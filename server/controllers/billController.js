const fs = require('fs');
const path = require('path');
const Bill = require('../models/Bill');
const SolarAssessment = require('../models/SolarAssessment');
const Recommendation = require('../models/Recommendation');
const { extractBillData } = require('../utils/billParser');
const { validateMagicBytes } = require('../middleware/upload');
const aiService = require('../ai/aiService');
const { calculateSolarMetrics } = require('../utils/solarCalculations');
const { buildPersonalizedRecommendation } = require('../ai/recommendationEngine');

// @desc    Upload electricity bill file (PDF, JPG, PNG, WebP)
// @route   POST /api/bills/upload
// @access  Private
const uploadBill = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded. Please choose a PDF, JPG, PNG, or WebP bill file.',
      });
    }

    const filePath = req.file.path;
    const fileMimeType = req.file.mimetype;
    const fileName = req.file.originalname;

    // 1. Validate magic bytes (File Signature) to block disguised executables or malicious files
    const magicCheck = validateMagicBytes(filePath);
    if (!magicCheck.valid) {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      return res.status(400).json({
        success: false,
        message: `Security validation failed: ${magicCheck.error}`,
      });
    }

    // 2. Multimodal & OCR/Text extraction pipeline
    const extracted = await extractBillData(filePath, fileMimeType);

    // 3. Check if any usable units or billing figures were extracted
    let units = typeof extracted.unitsConsumed === 'number' && extracted.unitsConsumed > 0 ? extracted.unitsConsumed : null;
    let amount = typeof extracted.totalAmount === 'number' && extracted.totalAmount > 0 ? extracted.totalAmount : null;

    // If completely unreadable (both units and amount are missing)
    if (!units && !amount) {
      if (fs.existsSync(filePath)) {
        try { fs.unlinkSync(filePath); } catch (e) {}
      }
      return res.status(422).json({
        success: false,
        message: 'Could not extract electricity consumption details from this bill. Please ensure your document is a clear, legible electricity bill issued by your power provider (DISCOM), or try another bill.',
      });
    }

    // Determine category tariff baseline if one metric is present but the other is missing
    let userType = req.user.userType || 'residential';
    const cat = (extracted.consumerCategory || '').toLowerCase();
    if (cat.includes('agri') || cat.includes('farm')) userType = 'farm';
    else if (cat.includes('comm') || cat.includes('business')) userType = 'small_business';
    else if (cat.includes('ind') || cat.includes('ht')) userType = 'large_business';

    const defaultTariff = userType === 'small_business' ? 9.5 : (userType === 'farm' ? 4.0 : (userType === 'large_business' ? 11.0 : 7.5));

    if (!units && amount) {
      units = Math.round(amount / (extracted.tariff || defaultTariff));
    } else if (units && !amount) {
      amount = Math.round(units * (extracted.tariff || defaultTariff));
    }
    const resolvedTariff = extracted.tariff && extracted.tariff > 0
      ? extracted.tariff
      : Math.round((amount / units) * 100) / 100;

    // 4. Gather user's previous verified bills for anomaly detection & baseline comparison
    const userHistory = await Bill.find({ userId: req.user._id, verificationStatus: 'verified' })
      .sort({ createdAt: -1 })
      .limit(6);

    const isConsumptionEstimated = !extracted.unitsConsumed && Boolean(units);
    const isAmountEstimated = !extracted.totalAmount && Boolean(amount);

    const aiAnalysis = await aiService.analyzeBill({
      unitsConsumed: units,
      totalAmount: amount,
      userType,
      tariff: resolvedTariff,
      billingPeriodDays: extracted.billingPeriodDays || 30,
      discom: extracted.discom || '',
    }, userHistory);

    // 5. Save Bill record in database
    const bill = await Bill.create({
      userId: req.user._id,
      fileName,
      filePath,
      fileUrl: `/api/bills/file/${req.file.filename}`,
      fileType: fileMimeType,
      discom: extracted.discom || '',
      consumerNumber: extracted.consumerNumber || '',
      consumerName: extracted.consumerName || '',
      billingMonth: extracted.billingMonth || '',
      billingYear: extracted.billingYear || new Date().getFullYear(),
      billingPeriodDays: extracted.billingPeriodDays || 30,
      unitsConsumed: units,
      totalAmount: amount,
      tariff: resolvedTariff,
      consumerCategory: extracted.consumerCategory || 'Residential',
      sanctionedLoadKW: extracted.sanctionedLoadKW,
      fixedCharges: extracted.fixedCharges || 0,
      energyCharges: extracted.energyCharges || 0,
      taxes: extracted.taxes || 0,
      subsidiesApplied: extracted.subsidiesApplied || 0,
      meterNumber: extracted.meterNumber || '',
      previousReading: extracted.previousReading,
      currentReading: extracted.currentReading,
      extractionMethod: extracted.extractionMethod,
      fieldConfidence: {
        ...extracted.fieldConfidence,
        unitsConsumed: isConsumptionEstimated ? 0.6 : (extracted.fieldConfidence?.unitsConsumed || 0.85),
        totalAmount: isAmountEstimated ? 0.6 : (extracted.fieldConfidence?.totalAmount || 0.85),
      },
      verificationStatus: 'needs_verification',
      verifiedByUser: false,
      validationErrors: extracted.validationErrors || [],
      rawExtractedData: extracted.rawExtractedData,
      normalizedData: {
        ...extracted.normalizedData,
        unitsConsumed: units,
        totalAmount: amount,
        tariff: resolvedTariff,
        isConsumptionEstimated,
        isAmountEstimated,
      },
      ocrText: extracted.ocrText,
      aiInsights: aiAnalysis,
      status: 'analyzed',
    });

    // 6. Synchronize into Canonical EnergyProfile (Single Source of Truth)
    const energyProfileService = require('../services/energyProfileService');
    const energyProfile = await energyProfileService.syncFromBill(req.user._id, bill, false);

    res.status(201).json({
      success: true,
      message: 'Electricity bill successfully extracted and analyzed.',
      bill,
      analysis: aiAnalysis,
      energyProfile,
    });
  } catch (error) {
    console.error('Bill upload error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error processing bill upload.',
    });
  }
};

// @desc    Verify and confirm extracted bill data (or provide missing values)
// @route   PUT /api/bills/:id/verify
// @access  Private
const verifyBillData = async (req, res) => {
  try {
    const bill = await Bill.findOne({ _id: req.params.id, userId: req.user._id });
    if (!bill) {
      return res.status(404).json({ success: false, message: 'Bill record not found.' });
    }

    const { unitsConsumed, totalAmount, billingMonth, tariff, consumerCategory, sanctionedLoadKW } = req.body;

    if (!unitsConsumed || !totalAmount || Number(unitsConsumed) <= 0 || Number(totalAmount) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide valid positive values for units consumed (kWh) and total bill amount (INR).',
      });
    }

    const resolvedUnits = Number(unitsConsumed);
    const resolvedAmount = Number(totalAmount);
    const resolvedTariff = tariff ? Number(tariff) : Math.round((resolvedAmount / resolvedUnits) * 100) / 100;

    // Run AI / ML analysis with verified values
    const userHistory = await Bill.find({
      userId: req.user._id,
      _id: { $ne: bill._id },
      verificationStatus: 'verified',
    }).sort({ createdAt: -1 }).limit(6);

    const aiAnalysis = await aiService.analyzeBill({
      unitsConsumed: resolvedUnits,
      totalAmount: resolvedAmount,
      userType: req.user.userType || 'residential',
      tariff: resolvedTariff,
    }, userHistory);

    bill.unitsConsumed = resolvedUnits;
    bill.totalAmount = resolvedAmount;
    bill.tariff = resolvedTariff;
    if (billingMonth) bill.billingMonth = billingMonth;
    if (consumerCategory) bill.consumerCategory = consumerCategory;
    if (sanctionedLoadKW) bill.sanctionedLoadKW = Number(sanctionedLoadKW);

    bill.verificationStatus = 'verified';
    bill.verifiedByUser = true;
    bill.verifiedAt = new Date();
    bill.validationErrors = [];
    bill.aiInsights = aiAnalysis;
    bill.status = 'analyzed';

    await bill.save();

    const energyProfileService = require('../services/energyProfileService');
    const energyProfile = await energyProfileService.syncFromBill(req.user._id, bill, true);

    res.json({
      success: true,
      message: 'Bill data successfully confirmed and analyzed.',
      bill,
      energyProfile,
    });
  } catch (error) {
    console.error('Bill verification error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Submit manual bill information
// @route   POST /api/bills/manual
// @access  Private
const analyzeManualBill = async (req, res) => {
  try {
    const { unitsConsumed, totalAmount, billingMonth, billingYear, tariff, consumerCategory } = req.body;

    if (!unitsConsumed || !totalAmount || Number(unitsConsumed) <= 0 || Number(totalAmount) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide valid positive units consumed (kWh) and total bill amount (INR).',
      });
    }

    const resolvedUnits = Number(unitsConsumed);
    const resolvedAmount = Number(totalAmount);
    const resolvedTariff = tariff ? Number(tariff) : Math.round((resolvedAmount / resolvedUnits) * 100) / 100;

    const userHistory = await Bill.find({
      userId: req.user._id,
      verificationStatus: 'verified',
    }).sort({ createdAt: -1 }).limit(6);

    const aiAnalysis = await aiService.analyzeBill({
      unitsConsumed: resolvedUnits,
      totalAmount: resolvedAmount,
      userType: req.user.userType || 'residential',
      tariff: resolvedTariff,
    }, userHistory);

    const bill = await Bill.create({
      userId: req.user._id,
      fileName: 'Manual Entry',
      filePath: '',
      fileUrl: '',
      fileType: 'manual',
      billingMonth: billingMonth || 'Current Month',
      billingYear: billingYear || new Date().getFullYear(),
      unitsConsumed: resolvedUnits,
      totalAmount: resolvedAmount,
      tariff: resolvedTariff,
      consumerCategory: consumerCategory || 'Residential',
      extractionMethod: 'manual',
      verificationStatus: 'verified',
      verifiedByUser: true,
      verifiedAt: new Date(),
      fieldConfidence: {
        unitsConsumed: 1.0,
        totalAmount: 1.0,
        billingMonth: 1.0,
        tariff: 1.0,
        overall: 1.0,
      },
      aiInsights: aiAnalysis,
      status: 'analyzed',
    });

    const energyProfileService = require('../services/energyProfileService');
    const energyProfile = await energyProfileService.syncFromBill(req.user._id, bill, true);

    res.status(201).json({
      success: true,
      message: 'Manual bill verified and analyzed successfully.',
      bill,
      energyProfile,
    });
  } catch (error) {
    console.error('Manual bill analysis error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error analyzing bill.',
    });
  }
};

// @desc    Securely stream uploaded bill file to authenticated owner
// @route   GET /api/bills/:id/file
// @access  Private
const streamBillFile = async (req, res) => {
  try {
    const bill = await Bill.findOne({ _id: req.params.id, userId: req.user._id });
    if (!bill || !bill.filePath) {
      return res.status(404).json({ success: false, message: 'Bill document not found or access denied.' });
    }

    const resolvedPath = path.resolve(bill.filePath);
    const uploadsRoot = path.resolve(__dirname, '../uploads');

    // Prevent directory traversal
    if (!resolvedPath.startsWith(uploadsRoot)) {
      return res.status(403).json({ success: false, message: 'Access to requested file path is restricted.' });
    }

    if (!fs.existsSync(resolvedPath)) {
      return res.status(404).json({ success: false, message: 'Physical file has expired or was removed.' });
    }

    res.setHeader('Content-Type', bill.fileType || 'application/octet-stream');
    res.setHeader('Content-Disposition', `inline; filename="${bill.fileName || 'bill-document'}"`);
    res.sendFile(resolvedPath);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get historical bill analytics, trends, and anomalies across all user bills
// @route   GET /api/bills/analytics
// @access  Private
const getBillAnalytics = async (req, res) => {
  try {
    const bills = await Bill.find({ userId: req.user._id, verificationStatus: 'verified' })
      .sort({ createdAt: 1 });

    if (bills.length === 0) {
      return res.json({
        success: true,
        count: 0,
        analytics: null,
        message: 'No verified bills found to generate analytics.',
      });
    }

    const consumptionValues = bills.map(b => b.unitsConsumed);
    const amountValues = bills.map(b => b.totalAmount);
    const tariffValues = bills.map(b => b.tariff || (b.totalAmount / b.unitsConsumed));

    const totalConsumption = consumptionValues.reduce((a, b) => a + b, 0);
    const averageConsumption = Math.round(totalConsumption / bills.length);
    const peakConsumption = Math.max(...consumptionValues);
    const lowestConsumption = Math.min(...consumptionValues);

    const totalAmount = amountValues.reduce((a, b) => a + b, 0);
    const averageBillAmount = Math.round(totalAmount / bills.length);
    const averageTariff = Math.round((tariffValues.reduce((a, b) => a + b, 0) / bills.length) * 100) / 100;

    // Monthly progression
    const monthlySeries = bills.map((b, idx) => {
      const prev = idx > 0 ? bills[idx - 1].unitsConsumed : null;
      const momChange = prev ? Math.round(((b.unitsConsumed - prev) / prev) * 1000) / 10 : 0;
      return {
        id: b._id,
        month: b.billingMonth || `Bill #${idx + 1}`,
        year: b.billingYear,
        unitsConsumed: b.unitsConsumed,
        totalAmount: b.totalAmount,
        tariff: b.tariff,
        momChangePercent: momChange,
        anomalies: b.aiInsights?.anomalies || [],
      };
    });

    res.json({
      success: true,
      count: bills.length,
      analytics: {
        averageConsumption,
        peakConsumption,
        lowestConsumption,
        averageBillAmount,
        averageTariff,
        monthlySeries,
        dataHonesty: 'Calculated deterministically from user-uploaded verified bills.',
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all bills for logged in user
// @route   GET /api/bills
// @access  Private
const getUserBills = async (req, res) => {
  try {
    const bills = await Bill.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, count: bills.length, bills });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single bill
// @route   GET /api/bills/:id
// @access  Private
const getBillById = async (req, res) => {
  try {
    const bill = await Bill.findOne({ _id: req.params.id, userId: req.user._id });
    if (!bill) {
      return res.status(404).json({ success: false, message: 'Bill record not found.' });
    }
    res.json({ success: true, bill });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete bill and remove file if present
// @route   DELETE /api/bills/:id
// @access  Private
const deleteBill = async (req, res) => {
  try {
    const bill = await Bill.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!bill) {
      return res.status(404).json({ success: false, message: 'Bill not found or unauthorized.' });
    }

    if (bill.filePath && fs.existsSync(bill.filePath)) {
      try {
        fs.unlinkSync(bill.filePath);
      } catch (e) {
        console.warn('Failed to delete file:', e.message);
      }
    }

    res.json({ success: true, message: 'Bill record and associated file securely removed.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Generate solar recommendation and assessment directly from bill data
// @route   POST /api/bills/:id/generate-recommendation
// @access  Private
const generateRecommendationFromBill = async (req, res) => {
  try {
    const bill = await Bill.findOne({ _id: req.params.id, userId: req.user._id });
    if (!bill) {
      return res.status(404).json({ success: false, message: 'Bill record not found.' });
    }

    if (!bill.unitsConsumed || bill.unitsConsumed <= 0) {
      return res.status(400).json({
        success: false,
        message: 'This bill has no valid consumption data to generate a solar recommendation.',
      });
    }

    let userType = 'residential';
    const cat = (bill.consumerCategory || '').toLowerCase();
    if (cat.includes('agri') || cat.includes('farm')) userType = 'farm';
    else if (cat.includes('comm') || cat.includes('business')) userType = 'small_business';
    else if (cat.includes('ind') || cat.includes('ht')) userType = 'large_business';
    else if (req.user.userType) userType = req.user.userType;

    const units = bill.unitsConsumed;
    const billAmount = bill.totalAmount || Math.round(units * 7.5);
    const tariff = bill.tariff || Math.round((billAmount / units) * 100) / 100;

    // Estimate realistic roof area needed for this consumption
    const targetKw = Math.max(1, Math.round((units / (30 * 4.8 * 0.78)) * 10) / 10);
    const estimatedRoofArea = Math.max(400, Math.round(targetKw * 135));

    // Calculate metrics using deterministic engineering engine
    const metrics = calculateSolarMetrics({
      monthlyConsumption: units,
      monthlyBill: billAmount,
      userType,
      roofArea: estimatedRoofArea,
      roofType: 'concrete_flat',
      roofOrientation: 'south',
      dayNightUsage: 'balanced',
      tariff,
    });

    const recommendationResult = buildPersonalizedRecommendation({
      userType,
      monthlyConsumption: units,
      monthlyBill: billAmount,
      roofArea: estimatedRoofArea,
      roofType: 'concrete_flat',
      roofOrientation: 'south',
      dayNightUsage: 'balanced',
      tariff,
      metrics,
      categoryDetails: {
        sourceBill: bill.fileName,
        billingMonth: bill.billingMonth,
        billingYear: bill.billingYear,
        discom: bill.discom,
      },
    });

    // Create SolarAssessment linked to this bill
    const assessment = await SolarAssessment.create({
      userId: req.user._id,
      userType,
      location: {
        state: req.user.state || 'Maharashtra',
        city: req.user.city || 'Pune',
        pincode: req.user.pincode || '',
      },
      monthlyConsumption: units,
      monthlyBill: billAmount,
      tariff,
      roofArea: estimatedRoofArea,
      roofType: 'concrete_flat',
      shadingCondition: 'none',
      gridPreference: 'on_grid',
      batteryRequirement: false,
      roofOrientation: 'south',
      dayNightUsage: 'balanced',
      categoryDetails: {
        sourceBill: bill.fileName,
        billingMonth: bill.billingMonth,
        billingYear: bill.billingYear,
        discom: bill.discom,
      },
      sourceType: 'bill_upload',
      sourceBill: bill.fileName || 'Uploaded Bill',
      sourceBillId: bill._id,

      recommendedCapacity: metrics.recommendedCapacity,
      estimatedDailyGeneration: metrics.dailyGeneration,
      estimatedGeneration: metrics.annualGeneration,
      panelCount: metrics.panelCount,
      panelWattage: metrics.panelWattage,
      inverterCapacity: metrics.inverterCapacity,
      areaRequiredSqFt: metrics.areaRequiredSqFt,

      estimatedCost: metrics.systemCost,
      subsidy: metrics.subsidy,
      netCost: metrics.netCost,
      annualSavings: metrics.annualSavings,
      monthlySavings: metrics.monthlySavings,
      paybackPeriod: metrics.paybackPeriod,
      roi: metrics.roi,

      co2AvoidedKg: metrics.co2AvoidedKg,
      treesPlanted: metrics.treesPlanted,

      assumptions: metrics.assumptions,
      aiExplanation: recommendationResult.aiExplanation,
      solarSuitability: recommendationResult.solarSuitability || 'Good',
    });

    // Create Recommendation
    const recommendation = await Recommendation.create({
      userId: req.user._id,
      assessmentId: assessment._id,
      systemOptions: recommendationResult.systemOptions,
      recommendedCapacity: metrics.recommendedCapacity,
      aiExplanation: recommendationResult.aiExplanation,
      technicalSummary: recommendationResult.technicalSummary,
      financialSummary: recommendationResult.financialSummary,
    });

    const energyProfileService = require('../services/energyProfileService');
    const energyProfile = await energyProfileService.syncFromAssessment(req.user._id, assessment, recommendation);

    res.status(201).json({
      success: true,
      message: 'Solar recommendation generated from bill.',
      assessment,
      recommendation,
      energyProfile,
    });
  } catch (error) {
    console.error('Error generating recommendation from bill:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  uploadBill,
  verifyBillData,
  analyzeManualBill,
  generateRecommendationFromBill,
  streamBillFile,
  getBillAnalytics,
  getUserBills,
  getBillById,
  deleteBill,
};
