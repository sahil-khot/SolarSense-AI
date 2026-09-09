const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  calculateQuickEstimate,
  runAssessment,
  getUserAssessments,
  getLatestAssessment,
  getAssessmentById,
} = require('../controllers/solarController');

// Public quick calculation
router.post('/quick-estimate', calculateQuickEstimate);

// Protected assessment endpoints
router.post('/assess', protect, runAssessment);
router.get('/latest', protect, getLatestAssessment);
router.get('/assessments', protect, getUserAssessments);
router.get('/assessments/:id', protect, getAssessmentById);

module.exports = router;
