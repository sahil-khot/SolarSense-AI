/**
 * Official Indian Government Solar Schemes & Subsidies Registry
 * Sourced from Ministry of New and Renewable Energy (MNRE), Govt. of India
 * All policies have verified dates and official source references.
 */

const GOVERNMENT_SCHEMES = {
  pmSuryaGhar: {
    schemeName: 'PM Surya Ghar: Muft Bijli Yojana',
    officialPortal: 'https://pmsuryaghar.gov.in',
    nodalAgency: 'Ministry of New and Renewable Energy (MNRE) & REC Limited',
    effectiveFrom: '2024-02-15',
    status: 'Active',
    lastVerified: 'March 2026',
    eligibleUserTypes: ['residential'],
    slabs: [
      { minKW: 0, maxKW: 1, subsidyPerKW: 30000, maxSlabBenefit: 30000 },
      { minKW: 1, maxKW: 2, subsidyPerKW: 30000, maxSlabBenefit: 60000 },
      { minKW: 2, maxKW: 3, subsidyPerKW: 18000, maxSlabBenefit: 78000 },
    ],
    maximumBenefit: 78000,
    specialProvisions: {
      groupHousingSocieties: {
        subsidyPerKW: 18000,
        maxCapacityKW: 500,
        notes: 'For common facilities (EV charging, water pumping, common lighting)',
      },
    },
    eligibilityCriteria: [
      'Must be an Indian citizen with a residential electricity connection in their own name.',
      'Rooftop space must be suitable and unencumbered.',
      'Must purchase ALMM (Approved List of Models & Manufacturers) compliant solar panels made in India (DCR - Domestic Content Requirement).',
      'Net-metering agreement with the local DISCOM is mandatory.',
    ],
    source: 'Official MNRE Notification No. 318/17/2024-GCRT',
  },

  commercialIncentives: {
    schemeName: 'Commercial & Industrial Solar Incentives',
    officialPortal: 'https://incometaxindia.gov.in',
    nodalAgency: 'Ministry of Finance / DISCOMs',
    effectiveFrom: '2022-04-01',
    status: 'Active',
    lastVerified: 'March 2026',
    eligibleUserTypes: ['small_business', 'large_business'],
    benefits: [
      {
        type: 'Accelerated Depreciation',
        percentage: 40,
        section: 'Section 32 of the Income Tax Act',
        description: 'Commercial entities can claim 40% accelerated depreciation on solar PV assets in the first year, substantially reducing tax liability.',
      },
      {
        type: 'GST Input Tax Credit (ITC)',
        rate: 12,
        description: 'Businesses can claim full input tax credit on the GST paid on solar power generation systems.',
      },
      {
        type: 'Open Access / Net Metering',
        description: 'Banking and net metering credit according to state electricity regulatory commission (SERC) regulations.',
      },
    ],
    source: 'Central Board of Direct Taxes (CBDT) Guidelines & Central GST Act',
  },

  pmKusum: {
    schemeName: 'PM-KUSUM (Pradhan Mantri Kisan Urja Suraksha evam Utthaan Mahabhiyan)',
    officialPortal: 'https://pmkusum.mnre.gov.in',
    nodalAgency: 'Ministry of New and Renewable Energy (MNRE)',
    effectiveFrom: '2019-03-08',
    status: 'Active',
    lastVerified: 'March 2026',
    eligibleUserTypes: ['farm'],
    components: [
      {
        component: 'Component B: Standalone Solar Agriculture Pumps',
        subsidyCentral: 30, // 30% from MNRE
        subsidyState: 30,   // 30% from State Govt
        farmerShare: 40,    // 40% (can take 30% bank loan)
        description: 'Central Govt subsidy 30% + State Govt subsidy 30% for solar water pump installation up to 7.5 HP.',
      },
      {
        component: 'Component C: Solarisation of Grid-Connected Agriculture Pumps',
        subsidyCentral: 30,
        subsidyState: 30,
        farmerShare: 40,
        description: 'Solarize existing grid-connected agriculture pumps and sell excess solar energy to DISCOMs.',
      },
    ],
    source: 'MNRE Scheme Guidelines for PM-KUSUM Scheme',
  },
};

/**
 * Calculates official government subsidy based on capacity and user category.
 */
function calculateGovernmentSubsidy(capacityKW, userType = 'residential') {
  if (userType === 'residential') {
    const scheme = GOVERNMENT_SCHEMES.pmSuryaGhar;
    if (capacityKW <= 0) return { subsidyAmount: 0, schemeName: scheme.schemeName, source: scheme.source, lastVerified: scheme.lastVerified };

    let subsidyAmount = 0;
    if (capacityKW <= 1) {
      subsidyAmount = Math.round(capacityKW * 30000);
    } else if (capacityKW <= 2) {
      subsidyAmount = Math.round(capacityKW * 30000);
    } else if (capacityKW <= 3) {
      subsidyAmount = Math.round(60000 + (capacityKW - 2) * 18000);
    } else {
      subsidyAmount = scheme.maximumBenefit;
    }

    return {
      subsidyAmount,
      schemeName: scheme.schemeName,
      maxBenefit: scheme.maximumBenefit,
      source: scheme.source,
      portal: scheme.officialPortal,
      lastVerified: scheme.lastVerified,
      eligible: true,
      eligibilityNotes: 'Requires ALMM compliant DCR solar panels and DISCOM net-metering approval.',
    };
  } else if (userType === 'farm') {
    const scheme = GOVERNMENT_SCHEMES.pmKusum;
    return {
      subsidyAmount: 0, // Direct PM Surya Ghar does not apply; KUSUM is pump-based
      schemeName: scheme.schemeName,
      source: scheme.source,
      portal: scheme.officialPortal,
      lastVerified: scheme.lastVerified,
      eligible: true,
      eligibilityNotes: 'Eligible for up to 60% combined subsidy (30% Central + 30% State) under PM-KUSUM for solar irrigation pumps.',
    };
  } else {
    const scheme = GOVERNMENT_SCHEMES.commercialIncentives;
    return {
      subsidyAmount: 0,
      schemeName: scheme.schemeName,
      source: scheme.source,
      lastVerified: scheme.lastVerified,
      eligible: true,
      eligibilityNotes: 'Eligible for 40% Accelerated Depreciation under Section 32 of Income Tax Act + full GST input tax credit.',
    };
  }
}

module.exports = {
  GOVERNMENT_SCHEMES,
  calculateGovernmentSubsidy,
};
