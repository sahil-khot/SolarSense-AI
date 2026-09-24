const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  loginAdmin,
  getMe,
  forgotPassword,
  resetPassword,
  checkUsername,
  checkEmail,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/check-username', checkUsername);
router.get('/check-email', checkEmail);
router.post('/admin/login', loginAdmin);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:resetToken', resetPassword);
router.get('/me', protect, getMe);

module.exports = router;
