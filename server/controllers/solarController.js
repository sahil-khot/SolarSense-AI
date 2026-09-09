const SolarAssessment = require('../models/SolarAssessment');
const Recommendation = require('../models/Recommendation');
const Report = require('../models/Report');
const aiService = require('../ai/aiService');
const { calculateSolarMetrics, generateOptimizationMatrix } = require('../utils/solarCalculations');
const { predictAnnualConsumptionCurve } = require('../ai/consumptionPredictor');
const { predictAnnualGenerationCurve } = require('../ai/solarPredictor');

// @desc    Quick on-the-fly solar estimate (no database save required)
// @route   POST /api/solar/quick-estimate
// @access  Public
const calculateQuickEstimate = async (req, res) => {
  try {
    const {
      monthlyConsumption,
      monthlyBill,
      userType = 'residential',
      roofArea = 1000,
      tariff,
    } = req.body;

    let units = Number(monthlyConsumption);
    let bill = Number(monthlyBill);
    const resolvedTariff = Number(tariff) || (userType === 'farm' ? 4.0 : userType === 'small_business' ? 9.5 : userType === 'large_business' ? 11.0 : 7.5);

    if (!units && !bill) {
      return res.status(400).json({
        success: false,
        message: 'Please provide monthly consumption (kWh) or monthly bill amount (INR).',
      });
    }

    if (!units && bill) {
      units = Math.round(bill / resolvedTariff);
    } else if (units && !bill) {
      bill = Math.round(units * resolvedTariff);
    }

    const metrics = calculateSolarMetrics({
      monthlyConsumption: units,
      monthlyBill: bill,
      userType,
      roofArea: Number(roofArea) || 1000,
      tariff: resolvedTariff,
    });

    res.json({
      success: true,
      metrics,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Run full solar assessment & generate recommendation
// @route   POST /api/solar/assess
// @access  Private
const runAssessment = async (req, res) => {
  try {
    const {
      userType = 'residential',
      location,
      monthlyConsumption,
      monthlyBill,
      tariff,
      roofArea,
      roofType = 'concrete_flat',
      shadingCondition = 'none',
      roofOrientation = 'south',
      dayNightUsage = 'balanced',
      gridPreference = 'on_grid',
      batteryRequirement = false,
      budget = 0,
      categoryDetails = {},
    } = req.body;

    const resolvedTariff = Number(tariff) || (userType === 'farm' ? 4.0 : userType === 'small_business' ? 9.5 : userType === 'large_business' ? 11.0 : 7.5);

    // Dynamic resolution of units & bill based on user case inputs
    let units = Number(monthlyConsumption) || 0;
    let bill = Number(monthlyBill) || 0;

    if (!units && bill) {
      units = Math.round(bill / resolvedTariff);
    } else if (units && !bill) {
      bill = Math.round(units * resolvedTariff);
    } else if (!units && !bill) {
      if (userType === 'farm') {
        const pumpPower = Number(categoryDetails.pumpPower) || 5;
        const pumpKW = categoryDetails.pumpPowerUnit === 'kW' ? pumpPower : (pumpPower * 0.746);
        const hours = Number(categoryDetails.dailyHours) || 6;
        const days = Number(categoryDetails.monthlyDays) || 25;
        const count = Number(categoryDetails.pumpCount) || 1;
        units = Math.round(count * pumpKW * hours * days);
        if (categoryDetails.solarOption === 'farm_and_home') {
          units += 250; // Add household baseline
        }
        bill = Math.round(units * resolvedTariff);
      } else if (userType === 'large_business' && categoryDetails.sanctionedLoad) {
        const load = Number(categoryDetails.sanctionedLoad);
        const hours = Number(categoryDetails.dailyHours) || 12;
        const days = Number(categoryDetails.monthlyDays) || 26;
        units = Math.round(load * 0.55 * hours * days);
        bill = Math.round(units * resolvedTariff);
      } else {
        return res.status(400).json({
          success: false,
          message: 'Please provide monthly electricity consumption (kWh) or monthly electricity bill (INR).',
        });
      }
    }

    // Dynamic resolution of installation area
    let area = Number(roofArea) || 0;
    if (!area) {
      if (userType === 'farm' && categoryDetails.farmAcres) {
        area = Math.max(1200, Math.round(Number(categoryDetails.farmAcres) * 43560 * 0.03));
      } else {
        area = Math.max(500, Math.round((units / 120) * 120));
      }
    }

    if (units <= 0 || area <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid consumption or installation area. Values must be positive.',
      });
    }

    // 1. Generate recommendation through AI service layer
    const recommendationResult = await aiService.generateRecommendation({
      userType,
      location: location || req.user.location,
      monthlyConsumption: units,
      monthlyBill: bill,
      tariff: resolvedTariff,
      roofArea: area,
      roofType,
      shadingCondition,
      roofOrientation,
      dayNightUsage,
      gridPreference,
      batteryRequirement: Boolean(batteryRequirement),
      budget: Number(budget) || 0,
      categoryDetails,
    });

    const { metrics, systemOptions, aiExplanation, solarSuitability } = recommendationResult;

    // 2. Save SolarAssessment record
    const assessment = await SolarAssessment.create({
      userId: req.user._id,
      userType,
      location: location || req.user.location,
      monthlyConsumption: units,
      monthlyBill: bill,
      tariff: metrics.tariff,
      roofArea: area,
      roofType,
      shadingCondition,
      roofOrientation,
      dayNightUsage,
      gridPreference,
      batteryRequirement: Boolean(batteryRequirement),
      budget: Number(budget) || 0,
      categoryDetails,

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
      aiExplanation,
      solarSuitability,
    });

    // 3. Save Recommendation record
    const recommendation = await Recommendation.create({
      userId: req.user._id,
      assessmentId: assessment._id,
      systemOptions,
      recommendedCapacity: metrics.recommendedCapacity,
      aiExplanation,
      technicalSummary: recommendationResult.technicalSummary,
      financialSummary: recommendationResult.financialSummary,
    });

    // 4. Create pre-built Report record
    const reportNumber = `SS-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
    const report = await Report.create({
      userId: req.user._id,
      assessmentId: assessment._id,
      recommendationId: recommendation._id,
      reportNumber,
      title: `Solar Feasibility & Cost Optimization Report — ${userType.toUpperCase()}`,
      summaryData: {
        userName: req.user.name,
        userEmail: req.user.email,
        userType,
        location: assessment.location,
        inputs: {
          monthlyConsumption: units,
          monthlyBill: bill,
          roofArea: area,
          roofType,
          shadingCondition,
          gridPreference,
          tariff: metrics.tariff,
        },
        outputs: {
          recommendedCapacity: metrics.recommendedCapacity,
          annualGeneration: metrics.annualGeneration,
          panelCount: metrics.panelCount,
          inverterCapacity: metrics.inverterCapacity,
          systemCost: metrics.systemCost,
          subsidy: metrics.subsidy,
          netCost: metrics.netCost,
          annualSavings: metrics.annualSavings,
          paybackPeriod: metrics.paybackPeriod,
          roi: metrics.roi,
          co2AvoidedKg: metrics.co2AvoidedKg,
          treesPlanted: metrics.treesPlanted,
        },
        assumptions: metrics.assumptions,
        aiExplanation,
      },
      status: 'generated',
    });

    // 5. Synchronize with Canonical EnergyProfile (Single Source of Truth)
    const energyProfileService = require('../services/energyProfileService');
    const energyProfile = await energyProfileService.syncFromAssessment(req.user._id, assessment, recommendation);

    res.status(201).json({
      success: true,
      message: 'Solar assessment completed successfully.',
      assessment,
      recommendation,
      report,
      energyProfile,
      monthlyComparisonChartData: recommendationResult.monthlyComparisonChartData,
      environmentalImpact: recommendationResult.environmentalImpact,
    });
  } catch (error) {
    console.error('Assessment error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error during assessment.',
    });
  }
};

// @desc    Get all assessments for user
// @route   GET /api/solar/assessments
// @access  Private
const getUserAssessments = async (req, res) => {
  try {
    const assessments = await SolarAssessment.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, count: assessments.length, assessments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get latest assessment with recommendation and canonical energy profile
// @route   GET /api/solar/latest
// @access  Private
const getLatestAssessment = async (req, res) => {
  try {
    const energyProfileService = require('../services/energyProfileService');
    const energyProfile = await energyProfileService.getCanonicalProfile(req.user._id);

    const assessment = await SolarAssessment.findOne({ userId: req.user._id }).sort({ createdAt: -1 });
    if (!assessment) {
      return res.json({
        success: true,
        assessment: null,
        recommendation: null,
        energyProfile,
      });
    }

    const recommendation = await Recommendation.findOne({ assessmentId: assessment._id });
    
    // Generate fresh monthly curves for chart rendering
    const consumptionCurve = predictAnnualConsumptionCurve(assessment.monthlyConsumption, assessment.userType);
    const generationCurve = predictAnnualGenerationCurve(assessment.recommendedCapacity, assessment.assumptions?.performanceRatio || 0.78);
    
    const monthlyComparisonChartData = consumptionCurve.map((item, idx) => ({
      month: item.month,
      consumption: item.predictedConsumption,
      solarGeneration: generationCurve[idx]?.solarGeneration || 0,
      netGridDraw: Math.max(0, item.predictedConsumption - (generationCurve[idx]?.solarGeneration || 0)),
    }));

    res.json({
      success: true,
      assessment,
      recommendation,
      energyProfile,
      monthlyComparisonChartData,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single assessment by ID
// @route   GET /api/solar/assessments/:id
// @access  Private
const getAssessmentById = async (req, res) => {
  try {
    const assessment = await SolarAssessment.findOne({ _id: req.params.id, userId: req.user._id });
    if (!assessment) {
      return res.status(404).json({ success: false, message: 'Assessment not found.' });
    }

    const recommendation = await Recommendation.findOne({ assessmentId: assessment._id });
    res.json({ success: true, assessment, recommendation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  calculateQuickEstimate,
  runAssessment,
  getUserAssessments,
  getLatestAssessment,
  getAssessmentById,
};
