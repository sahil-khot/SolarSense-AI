const { resolvePeakSunHours } = require('../config/solarResources');
const { calculateGovernmentSubsidy } = require('../config/subsidySchemes');
const { calculateFinancialModel } = require('./financialEngine');
const {
  DEFAULT_PERFORMANCE_RATIO,
  DEFAULT_PANEL_WATTAGE,
  AREA_PER_KW_SQFT,
  COST_PER_KW,
  DEFAULT_TARIFF,
  GRID_EMISSION_FACTOR_KG_PER_KWH,
  TREE_ABSORPTION_KG_PER_YEAR,
} = require('../config/constants');

/**
 * Standard inverter sizing (1.0x to 1.1x DC-to-AC ratio)
 */
function getStandardInverterSize(capacityKW) {
  const standardRatings = [1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10, 12, 15, 20, 25, 30, 40, 50, 60, 80, 100];
  for (const rating of standardRatings) {
    if (rating >= capacityKW * 0.95) {
      return rating;
    }
  }
  return Math.ceil(capacityKW);
}

/**
 * Derives usable roof area accounting for parapet setbacks, AC units, and maintenance access walkways.
 */
function calculateUsableRoofArea(totalRoofAreaSqFt, roofType = 'concrete_flat') {
  // Flat concrete roofs require ~30% buffer for walkways, water tanks, and parapet shading.
  // Pitched metal/sheet roofs typically have fewer obstructions (~15% buffer).
  // Open ground mounting has high space utilization (~90%).
  const usableFraction = roofType === 'open_ground' ? 0.90 : (roofType === 'sheet_metal' || roofType === 'metal_sheet') ? 0.85 : 0.70;
  const usableRoofArea = Math.round(totalRoofAreaSqFt * usableFraction);
  const effectiveSqFtPerKW = roofType === 'open_ground' ? 85 : 100; // 80 sq.ft panel + spacing
  const maxCapacityKW = Math.floor((usableRoofArea / effectiveSqFtPerKW) * 2) / 2;

  return {
    totalRoofAreaSqFt,
    usableRoofArea,
    usableFraction,
    effectiveSqFtPerKW,
    maxCapacityKW: Math.max(0.5, maxCapacityKW),
  };
}

/**
 * Comprehensive Solar Engineering & Financial Calculation
 */
function calculateSolarMetrics({
  monthlyConsumption,
  monthlyBill,
  userType = 'residential',
  roofArea = 1000,
  roofType = 'concrete_flat',
  location = { state: 'Maharashtra', city: 'Pune' },
  shadingCondition = 'none',
  roofOrientation = 'south',
  dayNightUsage = 'balanced',
  tariff = null,
  performanceRatio = DEFAULT_PERFORMANCE_RATIO,
  panelWattage = DEFAULT_PANEL_WATTAGE,
  billingDays = 30,
  customCostPerKW = null,
  categoryDetails = {},
}) {
  const resolvedTariff = tariff && tariff > 0 ? tariff : (DEFAULT_TARIFF[userType] || 7.5);
  const resolvedCostPerKW = customCostPerKW || COST_PER_KW[userType] || 60000;

  // 1. Resolve Location-Specific Solar Irradiance
  const solarResource = resolvePeakSunHours(location);
  const peakSunHours = solarResource.dailyPeakSunHours;

  // 2. Realistic Rooftop Area Modeling
  const roofModel = calculateUsableRoofArea(roofArea, roofType);
  const maxFeasibleCapacity = roofModel.maxCapacityKW;

  // 3. Daily Consumption (kWh/day)
  const dailyConsumption = monthlyConsumption / billingDays;

  // 4. Engineering Loss Derate Factors
  const shadingFactor = shadingCondition === 'significant' ? 0.80 : shadingCondition === 'partial' ? 0.90 : 1.0;
  // Orientation factor: South is optimal (1.0), East-West (0.92), North (0.82), Unknown/Flat (0.95)
  const orientationFactor =
    roofOrientation === 'south' ? 1.0 :
    roofOrientation === 'east_west' ? 0.92 :
    roofOrientation === 'north' ? 0.82 :
    0.95;
  const temperatureDerateFactor = 0.97; // Temperature coefficient for tropical Indian conditions
  const availabilityFactor = 0.99; // System uptime factor

  const combinedDeratePR = performanceRatio * shadingFactor * orientationFactor * temperatureDerateFactor * availabilityFactor;

  // 5. Unconstrained Ideal PV Capacity (kW)
  // Formula: dailyConsumption / (peakSunHours * combinedDeratePR)
  const rawIdealCapacity = dailyConsumption / (peakSunHours * combinedDeratePR);
  let recommendedCapacity = Math.max(1, Math.round(rawIdealCapacity * 2) / 2);

  let areaConstraintApplied = false;
  if (recommendedCapacity > maxFeasibleCapacity) {
    recommendedCapacity = maxFeasibleCapacity;
    areaConstraintApplied = true;
  }

  // 6. Sizing panels and inverter
  const panelCount = Math.ceil((recommendedCapacity * 1000) / panelWattage);
  const inverterCapacity = getStandardInverterSize(recommendedCapacity);
  const areaRequiredSqFt = Math.round(recommendedCapacity * roofModel.effectiveSqFtPerKW);

  // 7. Rigorous Generation Formula (kWh/year)
  // Generation = Capacity × Peak Sun Hours × 365 × Combined Derate PR
  const annualGeneration = Math.round(
    recommendedCapacity * peakSunHours * 365 * combinedDeratePR
  );
  const dailyGeneration = Math.round((annualGeneration / 365) * 10) / 10;

  // 8. Capital Expenditure & Subsidy Engine
  const systemCost = Math.round(recommendedCapacity * resolvedCostPerKW);
  const subsidyInfo = calculateGovernmentSubsidy(recommendedCapacity, userType);
  const subsidy = subsidyInfo.subsidyAmount;
  const netCost = Math.max(0, systemCost - subsidy);

  // 9. Self-consumption ratio based on day/night profile and userType
  let selfConsumptionRatio = 0.88;
  if (dayNightUsage === 'day_heavy') {
    selfConsumptionRatio = 0.94;
  } else if (dayNightUsage === 'night_heavy') {
    selfConsumptionRatio = 0.72;
  } else if (userType === 'small_business' || userType === 'large_business') {
    selfConsumptionRatio = 0.92;
  }

  // 10. Unified 25-Year Financial Cash-Flow Model
  const financialModel = calculateFinancialModel({
    systemCost,
    subsidy,
    year1AnnualGenerationKWh: annualGeneration,
    baseTariff: resolvedTariff,
    selfConsumptionRatio,
  });

  const annualSavings = financialModel.year1Savings;
  const monthlySavings = Math.round(annualSavings / 12);
  const paybackPeriod = financialModel.simplePaybackYears;
  const discountedPaybackPeriod = financialModel.discountedPaybackYears;
  const npv = financialModel.npv;
  const irr = financialModel.irr;
  const lcoe = financialModel.lcoe; // True calculated LCOE
  const roi = financialModel.roiPercent;
  const lifetimeSavings = financialModel.twentyFiveYearNetSavings;

  // 11. Environmental Impact
  const co2AvoidedKg = Math.round(annualGeneration * GRID_EMISSION_FACTOR_KG_PER_KWH);
  const treesPlanted = Math.round(co2AvoidedKg / TREE_ABSORPTION_KG_PER_YEAR);

  // 12. Transparent Recommendation Score out of 100
  const scoreBreakdown = calculateRecommendationScore({
    recommendedCapacity,
    annualGeneration,
    annualConsumption: monthlyConsumption * 12,
    paybackYears: paybackPeriod,
    npv,
    netCost,
    roofAreaAvailable: roofModel.usableRoofArea,
    roofAreaRequired: areaRequiredSqFt,
    co2AvoidedKg,
    areaConstraintApplied,
  });

  return {
    recommendedCapacity,
    dailyConsumption: Math.round(dailyConsumption * 10) / 10,
    dailyGeneration,
    annualGeneration,
    panelCount,
    panelWattage,
    inverterCapacity,
    areaRequiredSqFt,
    roofModel,
    areaConstraintApplied,
    maxPossibleCapacityByArea: maxFeasibleCapacity,
    systemCost,
    subsidy,
    subsidyInfo,
    netCost,
    annualSavings,
    monthlySavings,
    paybackPeriod,
    discountedPaybackPeriod,
    npv,
    irr,
    lcoe, // Factual mathematically derived LCOE
    roi,
    lifetimeSavings,
    co2AvoidedKg,
    treesPlanted,
    tariff: resolvedTariff,
    costPerKW: resolvedCostPerKW,
    recommendationScore: scoreBreakdown.totalScore,
    scoreBreakdown: scoreBreakdown.categories,
    whyRecommendBullets: scoreBreakdown.whyRecommendBullets,
    solarResource,
    assumptions: {
      locationUsed: solarResource.locationName,
      peakSunHours,
      solarResourceSource: solarResource.source,
      performanceRatio,
      shadingFactor,
      temperatureDerateFactor,
      availabilityFactor,
      combinedDeratePR: Math.round(combinedDeratePR * 1000) / 1000,
      costPerKW: resolvedCostPerKW,
      tariff: resolvedTariff,
      panelWattage,
      effectiveAreaPerKW: roofModel.effectiveSqFtPerKW,
      billingDays,
    },
  };
}

/**
 * Computes Transparent Recommendation Score (out of 100) and rationale
 */
function calculateRecommendationScore({
  recommendedCapacity,
  annualGeneration,
  annualConsumption,
  paybackYears,
  npv,
  netCost,
  roofAreaAvailable,
  roofAreaRequired,
  co2AvoidedKg,
  areaConstraintApplied,
}) {
  // 1. Financial Score (max 30) - Based on NPV to Capex ratio & IRR
  const npvRatio = netCost > 0 ? npv / netCost : 2;
  let financialScore = Math.min(30, Math.max(10, Math.round(npvRatio * 10)));

  // 2. Energy Offset Score (max 25) - Target offset 80-100%
  const offsetRatio = annualGeneration / (annualConsumption || 1);
  let energyOffsetScore = 20;
  if (offsetRatio >= 0.85 && offsetRatio <= 1.05) energyOffsetScore = 25;
  else if (offsetRatio >= 0.70) energyOffsetScore = 22;
  else if (offsetRatio >= 0.50) energyOffsetScore = 18;
  else energyOffsetScore = 14;

  // 3. Payback Score (max 20) - Under 4 yrs = 20 pts
  let paybackScore = 20;
  if (paybackYears <= 3.8) paybackScore = 20;
  else if (paybackYears <= 4.5) paybackScore = 18;
  else if (paybackYears <= 5.5) paybackScore = 15;
  else paybackScore = 12;

  // 4. Roof Utilization Score (max 15) - Sits comfortably within roof boundaries
  const roofRatio = roofAreaRequired / (roofAreaAvailable || 1);
  let roofScore = 14;
  if (roofRatio <= 0.85) roofScore = 15;
  else if (roofRatio <= 0.95) roofScore = 13;
  else roofScore = 10;

  // 5. Environmental Score (max 10)
  const envScore = Math.min(10, Math.max(7, Math.round((co2AvoidedKg / 3000) * 10)));

  const totalScore = financialScore + energyOffsetScore + paybackScore + roofScore + envScore;

  const whyRecommendBullets = [];
  if (!areaConstraintApplied) {
    whyRecommendBullets.push(`Fits comfortably within available rooftop (${roofAreaRequired} sq.ft used out of ${roofAreaAvailable} sq.ft usable).`);
  } else {
    whyRecommendBullets.push(`Optimized to maximum feasible rooftop capacity (${recommendedCapacity} kW) while preserving maintenance walkways.`);
  }

  const offsetPercent = Math.round((annualGeneration / (annualConsumption || 1)) * 100);
  whyRecommendBullets.push(`Offsets ~${offsetPercent}% of annual electricity consumption, heavily minimizing grid electricity bills.`);
  whyRecommendBullets.push(`Attractive payback of ${paybackYears} years with strong Net Present Value (NPV: ₹${npv.toLocaleString('en-IN')}).`);
  whyRecommendBullets.push(`Mitigates ${Math.round(co2AvoidedKg / 1000)} metric tons of CO2 emissions annually (equivalent to planting ${Math.round(co2AvoidedKg / TREE_ABSORPTION_KG_PER_YEAR)} trees).`);

  return {
    totalScore,
    categories: {
      financial: { score: financialScore, max: 30, label: 'Financial Return' },
      energyOffset: { score: energyOffsetScore, max: 25, label: 'Energy Offset' },
      payback: { score: paybackScore, max: 20, label: 'Payback Speed' },
      roofUtilization: { score: roofScore, max: 15, label: 'Roof Utilization' },
      environmental: { score: envScore, max: 10, label: 'Environmental Impact' },
    },
    whyRecommendBullets,
  };
}

/**
 * Generates comparative candidate systems, filtering out physically impossible systems.
 */
function generateOptimizationMatrix({
  recommendedCapacity,
  userType = 'residential',
  roofArea = 1000,
  roofType = 'concrete_flat',
  location = { state: 'Maharashtra', city: 'Pune' },
  tariff,
  monthlyConsumption,
  costPerKW,
  budget = 0,
}) {
  const roofModel = calculateUsableRoofArea(roofArea, roofType);
  const maxFeasibleCapacity = roofModel.maxCapacityKW;

  let candidateCapacities = [];
  if (recommendedCapacity <= 3) {
    candidateCapacities = [1, 1.5, 2, 3, 4, 5];
  } else if (recommendedCapacity <= 6) {
    candidateCapacities = [2, 3, 4, 5, 6, 7];
  } else if (recommendedCapacity <= 12) {
    candidateCapacities = [4, 6, 8, 10, 12, 15];
  } else {
    const step = Math.max(5, Math.round(recommendedCapacity / 4));
    candidateCapacities = [
      Math.max(5, recommendedCapacity - step * 2),
      Math.max(5, recommendedCapacity - step),
      recommendedCapacity,
      recommendedCapacity + step,
      recommendedCapacity + step * 2,
    ];
  }

  // Ensure recommended capacity is included
  if (!candidateCapacities.includes(recommendedCapacity)) {
    candidateCapacities.push(recommendedCapacity);
  }
  candidateCapacities = [...new Set(candidateCapacities)].sort((a, b) => a - b);

  const resolvedTariff = tariff || DEFAULT_TARIFF[userType] || 7.5;
  const resolvedCost = costPerKW || COST_PER_KW[userType] || 60000;
  const solarResource = resolvePeakSunHours(location);
  const peakSunHours = solarResource.dailyPeakSunHours;

  const options = [];

  for (const cap of candidateCapacities) {
    const areaReq = Math.round(cap * roofModel.effectiveSqFtPerKW);
    const isPhysicallyFeasible = cap <= maxFeasibleCapacity;

    // Skip candidate systems that drastically exceed roof capacity (e.g. >130% of max feasible)
    if (cap > maxFeasibleCapacity * 1.3 && cap !== recommendedCapacity) {
      continue;
    }

    const panelCount = Math.ceil((cap * 1000) / DEFAULT_PANEL_WATTAGE);
    const inverterCapacity = getStandardInverterSize(cap);
    const annualGen = Math.round(cap * peakSunHours * 365 * DEFAULT_PERFORMANCE_RATIO * 0.97);

    const sysCost = Math.round(cap * resolvedCost);
    const subsidyInfo = calculateGovernmentSubsidy(cap, userType);
    const sub = subsidyInfo.subsidyAmount;
    const net = Math.max(0, sysCost - sub);

    const finModel = calculateFinancialModel({
      systemCost: sysCost,
      subsidy: sub,
      year1AnnualGenerationKWh: annualGen,
      baseTariff: resolvedTariff,
      selfConsumptionRatio: userType === 'residential' ? 0.88 : 0.92,
    });

    const isRecommended = cap === recommendedCapacity;
    let tierLabel = `${cap} kW System`;
    if (isRecommended) tierLabel = `Recommended Optimal (${cap} kW)`;
    else if (cap < recommendedCapacity) tierLabel = `Budget Option (${cap} kW)`;
    else tierLabel = `High Generation (${cap} kW)`;

    let feasibilityNotes = '';
    if (!isPhysicallyFeasible) {
      feasibilityNotes = `Roof Constraint: Requires ${areaReq} sq.ft, but usable roof is ${roofModel.usableRoofArea} sq.ft. Elevated structure would be required.`;
    } else if (isRecommended) {
      feasibilityNotes = 'Optimal match: balances capital outlay, rooftop geometry, and electricity offset.';
    } else if (cap < recommendedCapacity) {
      feasibilityNotes = 'Lower initial investment, but leaves recurring dependence on utility grid.';
    } else {
      feasibilityNotes = 'High generation setup: maximizes surplus power export under net-metering.';
    }

    options.push({
      capacityKW: cap,
      panelCount,
      inverterCapacity,
      annualGeneration: annualGen,
      areaRequiredSqFt: areaReq,
      systemCost: sysCost,
      subsidy: sub,
      netCost: net,
      annualSavings: finModel.year1Savings,
      monthlySavings: Math.round(finModel.year1Savings / 12),
      paybackPeriod: finModel.simplePaybackYears,
      discountedPaybackPeriod: finModel.discountedPaybackYears,
      npv: finModel.npv,
      irr: finModel.irr,
      lcoe: finModel.lcoe, // True mathematically derived LCOE
      roi: finModel.roiPercent,
      co2AvoidedKg: Math.round(annualGen * GRID_EMISSION_FACTOR_KG_PER_KWH),
      isRecommended,
      isPhysicallyFeasible,
      tierLabel,
      feasibilityNotes,
    });
  }

  return options.slice(0, 5); // Return top 5 realistic candidates
}

module.exports = {
  calculateSolarMetrics,
  calculateUsableRoofArea,
  calculateRecommendationScore,
  generateOptimizationMatrix,
  getStandardInverterSize,
};
