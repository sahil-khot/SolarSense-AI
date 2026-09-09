const Report = require('../models/Report');
const SolarAssessment = require('../models/SolarAssessment');
const Recommendation = require('../models/Recommendation');

// @desc    Get all reports for user
// @route   GET /api/reports
// @access  Private
const getUserReports = async (req, res) => {
  try {
    const reports = await Report.find({ userId: req.user._id })
      .populate('assessmentId')
      .sort({ generatedAt: -1 });
    res.json({ success: true, count: reports.length, reports });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single report by ID
// @route   GET /api/reports/:id
// @access  Private
const getReportById = async (req, res) => {
  try {
    const report = await Report.findOne({ _id: req.params.id, userId: req.user._id })
      .populate('assessmentId')
      .populate('recommendationId');

    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found.' });
    }

    res.json({ success: true, report });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Generate a new report for an assessment
// @route   POST /api/reports
// @access  Private
const generateReport = async (req, res) => {
  try {
    const { assessmentId } = req.body;
    if (!assessmentId) {
      return res.status(400).json({ success: false, message: 'assessmentId is required' });
    }

    const assessment = await SolarAssessment.findOne({ _id: assessmentId, userId: req.user._id });
    if (!assessment) {
      return res.status(404).json({ success: false, message: 'Assessment not found.' });
    }

    const recommendation = await Recommendation.findOne({ assessmentId: assessment._id });

    const reportNumber = `SS-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

    const report = await Report.create({
      userId: req.user._id,
      assessmentId: assessment._id,
      recommendationId: recommendation ? recommendation._id : null,
      reportNumber,
      title: `Solar Feasibility & Cost Optimization Report — ${assessment.userType.toUpperCase()}`,
      summaryData: {
        userName: req.user.name,
        userEmail: req.user.email,
        userType: assessment.userType,
        location: assessment.location,
        inputs: {
          monthlyConsumption: assessment.monthlyConsumption,
          monthlyBill: assessment.monthlyBill,
          roofArea: assessment.roofArea,
          roofType: assessment.roofType,
          shadingCondition: assessment.shadingCondition,
          gridPreference: assessment.gridPreference,
          tariff: assessment.tariff,
        },
        outputs: {
          recommendedCapacity: assessment.recommendedCapacity,
          annualGeneration: assessment.estimatedGeneration,
          panelCount: assessment.panelCount,
          inverterCapacity: assessment.inverterCapacity,
          systemCost: assessment.estimatedCost,
          subsidy: assessment.subsidy,
          netCost: assessment.netCost,
          annualSavings: assessment.annualSavings,
          paybackPeriod: assessment.paybackPeriod,
          roi: assessment.roi,
          co2AvoidedKg: assessment.co2AvoidedKg,
          treesPlanted: assessment.treesPlanted,
        },
        assumptions: assessment.assumptions,
        aiExplanation: assessment.aiExplanation,
      },
      status: 'generated',
    });

    res.status(201).json({ success: true, message: 'Report generated successfully.', report });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getUserReports,
  getReportById,
  generateReport,
};
