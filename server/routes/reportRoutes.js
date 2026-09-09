const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getUserReports,
  getReportById,
  generateReport,
} = require('../controllers/reportController');

router.use(protect);

router.get('/', getUserReports);
router.post('/', generateReport);
router.get('/:id', getReportById);

module.exports = router;
