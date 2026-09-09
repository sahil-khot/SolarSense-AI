const express = require('express');
const router = express.Router();
const {
  getAllCompanies,
  getCompanyById,
  matchCompaniesForUser,
} = require('../controllers/companyController');

router.get('/', getAllCompanies);
router.post('/match', matchCompaniesForUser);
router.get('/:id', getCompanyById);

module.exports = router;
