const express = require('express');
const router = express.Router();
const { upload } = require('../middleware/upload');
const { protect } = require('../middleware/auth');
const {
  uploadBill,
  verifyBillData,
  analyzeManualBill,
  generateRecommendationFromBill,
  streamBillFile,
  getBillAnalytics,
  getUserBills,
  getBillById,
  deleteBill,
} = require('../controllers/billController');

router.use(protect);

router.post('/upload', upload.single('billFile'), uploadBill);
router.post('/manual', analyzeManualBill);
router.post('/:id/generate-recommendation', generateRecommendationFromBill);
router.put('/:id/verify', verifyBillData);
router.get('/analytics', getBillAnalytics);
router.get('/:id/file', streamBillFile);
router.get('/:id', getBillById);
router.get('/', getUserBills);
router.delete('/:id', deleteBill);

module.exports = router;
