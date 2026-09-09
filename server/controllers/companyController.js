const SolarCompany = require('../models/SolarCompany');
const CompanyPriceSnapshot = require('../models/CompanyPriceSnapshot');

// @desc    Get all solar companies with flexible search, filter, and sort
// @route   GET /api/companies
// @access  Public
const getAllCompanies = async (req, res) => {
  try {
    const { type, state, technology, tier, search, sort = 'evaluation.overallScore' } = req.query;

    let query = {};

    if (type && type !== 'all') {
      query.type = type;
    }

    if (tier && tier !== 'all') {
      query.tier = tier;
    }

    if (state && state !== 'all') {
      query.statesServed = { $in: [state, 'All India'] };
    }

    if (technology && technology !== 'all') {
      query.panelTechnology = { $in: [technology] };
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { bestFor: { $regex: search, $options: 'i' } },
        { products: { $regex: search, $options: 'i' } },
      ];
    }

    let sortOption = {};
    if (sort === 'rating') {
      sortOption = { 'evaluation.overallScore': -1 };
    } else if (sort === 'price_asc') {
      sortOption = { pricePerKWMin: 1 };
    } else if (sort === 'price_desc') {
      sortOption = { pricePerKWMax: -1 };
    } else if (sort === 'warranty') {
      sortOption = { performanceWarrantyYears: -1 };
    } else {
      sortOption = { 'evaluation.overallScore': -1 };
    }

    const companies = await SolarCompany.find(query).sort(sortOption);

    res.json({
      success: true,
      count: companies.length,
      companies,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single company details with historical price snapshots
// @route   GET /api/companies/:id
// @access  Public
const getCompanyById = async (req, res) => {
  try {
    const company = await SolarCompany.findOne({
      $or: [{ _id: req.params.id.match(/^[0-9a-fA-F]{24}$/) ? req.params.id : null }, { slug: req.params.id }],
    });

    if (!company) {
      return res.status(404).json({ success: false, message: 'Solar company not found.' });
    }

    const priceSnapshots = await CompanyPriceSnapshot.find({ companyId: company._id })
      .sort({ systemSizeKW: 1, capturedAt: -1 });

    res.json({
      success: true,
      company,
      priceSnapshots,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Personalized company matching based on user's assessment and priorities
// @route   POST /api/companies/match
// @access  Public / Private
const matchCompaniesForUser = async (req, res) => {
  try {
    const {
      capacityKW = 3,
      userType = 'residential',
      location = { state: 'Maharashtra', city: 'Pune' },
      budget = 0,
      preference = 'best_overall', // 'best_overall' | 'best_value' | 'best_premium' | 'best_warranty' | 'best_local'
    } = req.body;

    const companies = await SolarCompany.find();

    const matchedList = companies.map((company) => {
      let matchScore = 70; // Base score
      const whyMatched = [];

      // 1. Geographic Availability check
      const servesState = company.statesServed.includes('All India') ||
        (location.state && company.statesServed.includes(location.state));
      if (servesState) {
        matchScore += 10;
        whyMatched.push(`Certified installation and warranty support available in ${location.state || 'your region'}.`);
      } else {
        matchScore -= 15;
      }

      // 2. Turnkey EPC vs Manufacturer
      if (userType === 'residential' && (company.type === 'Both' || company.type === 'Installer/EPC')) {
        matchScore += 8;
        whyMatched.push('Provides direct turnkey residential EPC including DISCOM net-metering liaison.');
      } else if (userType !== 'residential' && company.tier === 'Tier-1') {
        matchScore += 8;
        whyMatched.push('Tier-1 bankability ideal for commercial financing and industrial warranties.');
      }

      // 3. User Preference Alignment
      if (preference === 'best_premium') {
        if (company.tier === 'Premium' || company.evaluation.productQuality >= 9.2) {
          matchScore += 12;
          whyMatched.push('Top-tier product engineering and high-efficiency cell architecture.');
        }
      } else if (preference === 'best_value' || preference === 'best_budget') {
        if (company.evaluation.priceValue >= 8.8 || (company.pricePerKWMin && company.pricePerKWMin <= 54000)) {
          matchScore += 12;
          whyMatched.push('Industry-leading value per watt with highly competitive turnkey pricing.');
        }
      } else if (preference === 'best_warranty') {
        if (company.performanceWarrantyYears >= 27) {
          matchScore += 12;
          whyMatched.push(`Extended ${company.performanceWarrantyYears}-year linear performance degradation warranty.`);
        }
      } else {
        // Best Overall
        if (company.evaluation.overallScore >= 9.0) {
          matchScore += 10;
          whyMatched.push(`Highest SolarSense multi-factor evaluation (${company.evaluation.overallScore}/10).`);
        }
      }

      // 4. Budget check if budget provided
      if (budget > 0 && company.pricePerKWMin) {
        const estimatedTurnkeyTotal = company.pricePerKWMin * capacityKW;
        if (estimatedTurnkeyTotal <= budget * 1.1) {
          matchScore += 5;
          whyMatched.push('Estimated turnkey system cost fits comfortably within your target budget.');
        }
      }

      // 5. Subsidy assistance
      if (userType === 'residential' && company.subsidySupport) {
        whyMatched.push('Direct assistance with PM Surya Ghar national portal subsidy documentation.');
      }

      const clampedScore = Math.min(98, Math.max(50, Math.round(matchScore)));

      // Estimated turnkey cost range for user's specific capacity
      let estimatedCostForCapacity = 'Price on quotation';
      if (company.pricePerKWMin && company.pricePerKWMax) {
        const minCost = Math.round(company.pricePerKWMin * capacityKW);
        const maxCost = Math.round(company.pricePerKWMax * capacityKW);
        estimatedCostForCapacity = `₹${(minCost / 100000).toFixed(2)}L – ₹${(maxCost / 100000).toFixed(2)}L`;
      }

      return {
        company,
        matchScore: clampedScore,
        estimatedCostForCapacity,
        matchCategory: company.bestFor,
        whyMatchedBullets: whyMatched.slice(0, 3),
      };
    });

    matchedList.sort((a, b) => b.matchScore - a.matchScore);

    res.json({
      success: true,
      targetCapacityKW: capacityKW,
      userLocation: location,
      preference,
      topMatches: matchedList.slice(0, 5),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAllCompanies,
  getCompanyById,
  matchCompaniesForUser,
};
