const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { adminProtect } = require('../middleware/adminAuth');
const {
  getDashboardStats,
  getAllUsers,
  getUserDetails,
  getPlatformAnalytics,
  getAllReports,
  getSystemSettings,
  updateSystemSetting,
} = require('../controllers/adminController');

// Enforce authentication AND admin role for all admin routes
router.use(protect);
router.use(adminProtect);

router.get('/dashboard', getDashboardStats);
router.get('/users', getAllUsers);
router.get('/users/:id', getUserDetails);
router.get('/analytics', getPlatformAnalytics);
router.get('/reports', getAllReports);
router.get('/settings', getSystemSettings);
router.put('/settings/:id', updateSystemSetting);

module.exports = router;
