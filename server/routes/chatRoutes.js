const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  sendMessage,
  getChatHistory,
  clearChatHistory,
  getChatStatus,
} = require('../controllers/chatController');

// All chat routes are protected
router.post('/', protect, sendMessage);
router.get('/history', protect, getChatHistory);
router.delete('/history', protect, clearChatHistory);
router.get('/status', protect, getChatStatus);

module.exports = router;
