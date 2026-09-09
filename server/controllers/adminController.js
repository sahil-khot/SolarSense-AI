const User = require('../models/User');
const SolarAssessment = require('../models/SolarAssessment');
const Recommendation = require('../models/Recommendation');
const Bill = require('../models/Bill');
const Report = require('../models/Report');
const SystemSetting = require('../models/SystemSetting');

// @desc    Get comprehensive Admin dashboard statistics
// @route   GET /api/admin/dashboard
// @access  Private/Admin
const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const residentialUsers = await User.countDocuments({ role: 'user', userType: 'residential' });
    const farmUsers = await User.countDocuments({ role: 'user', userType: 'farm' });
    const smallBusinessUsers = await User.countDocuments({ role: 'user', userType: 'small_business' });
    const largeBusinessUsers = await User.countDocuments({ role: 'user', userType: 'large_business' });

    const totalAssessments = await SolarAssessment.countDocuments();
    const totalRecommendations = await Recommendation.countDocuments();
    const totalBills = await Bill.countDocuments();
    const totalReports = await Report.countDocuments();

    // Aggregations: Total solar capacity recommended, total clean energy generated, total CO2 offset
    const aggregateMetrics = await SolarAssessment.aggregate([
      {
        $group: {
          _id: null,
          totalCapacityKW: { $sum: '$recommendedCapacity' },
          totalAnnualGenerationKWh: { $sum: '$estimatedGeneration' },
          totalAnnualSavingsINR: { $sum: '$annualSavings' },
          totalCO2AvoidedKg: { $sum: '$co2AvoidedKg' },
          avgPaybackYears: { $avg: '$paybackPeriod' },
        },
      },
    ]);

    const stats = aggregateMetrics[0] || {
      totalCapacityKW: 0,
      totalAnnualGenerationKWh: 0,
      totalAnnualSavingsINR: 0,
      totalCO2AvoidedKg: 0,
      avgPaybackYears: 0,
    };

    // Recent 5 users
    const recentUsers = await User.find({ role: 'user' })
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(6);

    // Recent 5 assessments
    const recentAssessments = await SolarAssessment.find()
      .populate('userId', 'name email location')
      .sort({ createdAt: -1 })
      .limit(6);

    const verifiedBills = await Bill.countDocuments({ verificationStatus: 'verified' });
    const pendingBills = await Bill.countDocuments({ verificationStatus: 'needs_verification' });

    // Live AI / ML layer telemetry
    const aiService = require('../ai/aiService');
    const mlStatus = await aiService.getMlStatus();

    res.json({
      success: true,
      summary: {
        totalUsers,
        totalAssessments,
        totalRecommendations,
        totalBills,
        verifiedBills,
        pendingBills,
        totalReports,
        userDistribution: {
          residential: residentialUsers,
          farm: farmUsers,
          small_business: smallBusinessUsers,
          large_business: largeBusinessUsers,
        },
        impact: {
          totalCapacityKW: Math.round(stats.totalCapacityKW * 10) / 10,
          totalAnnualGenerationKWh: Math.round(stats.totalAnnualGenerationKWh),
          totalAnnualSavingsINR: Math.round(stats.totalAnnualSavingsINR),
          totalCO2AvoidedKg: Math.round(stats.totalCO2AvoidedKg),
          avgPaybackYears: stats.avgPaybackYears ? Math.round(stats.avgPaybackYears * 10) / 10 : 0,
        },
      },
      systemHealth: {
        mongodb: 'connected',
        mlLayer: mlStatus,
        gemini: {
          model: process.env.GEMINI_MODEL || 'gemini-3.8-flash',
          configured: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'YOUR_GEMINI_API_KEY_HERE'),
        },
        storage: {
          method: 'Protected Authenticated Streaming (/api/bills/:id/file)',
          status: 'Secured',
        },
      },
      recentUsers,
      recentAssessments,
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all registered users
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
  try {
    const { userType, search } = req.query;
    let query = { role: 'user' };

    if (userType && userType !== 'all') {
      query.userType = userType;
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(query).select('-password').sort({ createdAt: -1 });
    res.json({ success: true, count: users.length, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single user details with assessment history
// @route   GET /api/admin/users/:id
// @access  Private/Admin
const getUserDetails = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const assessments = await SolarAssessment.find({ userId: user._id }).sort({ createdAt: -1 });
    const bills = await Bill.find({ userId: user._id }).sort({ createdAt: -1 });
    const reports = await Report.find({ userId: user._id }).sort({ generatedAt: -1 });

    res.json({
      success: true,
      user,
      assessments,
      bills,
      reports,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get platform analytics
// @route   GET /api/admin/analytics
// @access  Private/Admin
const getPlatformAnalytics = async (req, res) => {
  try {
    // Assessments group by userType
    const assessmentsByType = await SolarAssessment.aggregate([
      {
        $group: {
          _id: '$userType',
          count: { $sum: 1 },
          avgCapacity: { $avg: '$recommendedCapacity' },
          totalSavings: { $sum: '$annualSavings' },
          avgPayback: { $avg: '$paybackPeriod' },
        },
      },
    ]);

    // Monthly assessments volume over time
    const monthlyAssessments = await SolarAssessment.aggregate([
      {
        $group: {
          _id: {
            month: { $month: '$createdAt' },
            year: { $year: '$createdAt' },
          },
          count: { $sum: 1 },
          avgCapacity: { $avg: '$recommendedCapacity' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    res.json({
      success: true,
      assessmentsByType,
      monthlyAssessments,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all reports across platform
// @route   GET /api/admin/reports
// @access  Private/Admin
const getAllReports = async (req, res) => {
  try {
    const reports = await Report.find()
      .populate('userId', 'name email userType')
      .sort({ generatedAt: -1 });
    res.json({ success: true, count: reports.length, reports });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get system settings
// @route   GET /api/admin/settings
// @access  Private/Admin
const getSystemSettings = async (req, res) => {
  try {
    const settings = await SystemSetting.find().sort({ category: 1 });
    res.json({ success: true, settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update system setting
// @route   PUT /api/admin/settings/:id
// @access  Private/Admin
const updateSystemSetting = async (req, res) => {
  try {
    const { value } = req.body;
    const setting = await SystemSetting.findById(req.params.id);
    if (!setting) {
      return res.status(404).json({ success: false, message: 'Setting not found.' });
    }

    setting.value = value;
    setting.updatedAt = Date.now();
    await setting.save();

    res.json({ success: true, message: 'System setting updated successfully.', setting });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getDashboardStats,
  getAllUsers,
  getUserDetails,
  getPlatformAnalytics,
  getAllReports,
  getSystemSettings,
  updateSystemSetting,
};
