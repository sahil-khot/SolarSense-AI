const express = require('express');
const router = express.Router();
const { getUserProfile, updateUserProfile, getUserEnergyProfile } = require('../controllers/userController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.route('/profile')
  .get(getUserProfile)
  .put(updateUserProfile);

router.route('/energy-profile')
  .get(getUserEnergyProfile);

module.exports = router;
