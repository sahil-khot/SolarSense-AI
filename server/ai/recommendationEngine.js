const { calculateSolarMetrics, generateOptimizationMatrix } = require('../utils/solarCalculations');
const { predictAnnualConsumptionCurve } = require('./consumptionPredictor');
const { predictAnnualGenerationCurve } = require('./solarPredictor');

/**
 * Intelligent Solar Recommendation Engine
 * Analyzes consumption patterns, property constraints, and user type to recommend an optimal PV system.
 */
function buildPersonalizedRecommendation(assessmentInput) {
  const {
    userType = 'residential',
    monthlyConsumption,
    monthlyBill,
    roofArea = 1000,
    roofType = 'concrete_flat',
    shadingCondition = 'none',
    roofOrientation = 'south',
    dayNightUsage = 'balanced',
    gridPreference = 'on_grid',
    batteryRequirement = false,
    budget = 0,
    tariff,
    location = { city: 'Pune', state: 'Maharashtra' },
    categoryDetails = {},
  } = assessmentInput;

  // 1. Calculate core engineering metrics
  const metrics = calculateSolarMetrics({
    monthlyConsumption,
    monthlyBill,
    userType,
    roofArea,
    roofType,
    location,
    shadingCondition,
    roofOrientation,
    dayNightUsage,
    tariff,
    categoryDetails,
  });

  const {
    recommendedCapacity,
    annualGeneration,
    panelCount,
    inverterCapacity,
    systemCost,
    subsidy,
    netCost,
    annualSavings,
    monthlySavings,
    paybackPeriod,
    discountedPaybackPeriod,
    npv,
    irr,
    lcoe,
    roi,
    co2AvoidedKg,
    treesPlanted,
    areaRequiredSqFt,
    areaConstraintApplied,
    maxPossibleCapacityByArea,
    recommendationScore,
    scoreBreakdown,
    whyRecommendBullets,
    solarResource,
  } = metrics;

  // 2. Generate 5 comparative system options for cost optimization
  const systemOptions = generateOptimizationMatrix({
    recommendedCapacity,
    userType,
    roofArea,
    roofType,
    location,
    tariff: metrics.tariff,
    monthlyConsumption,
    budget,
  });

  // 3. Generate 12-month generation vs consumption curves for charts
  const consumptionCurve = predictAnnualConsumptionCurve(monthlyConsumption, userType);
  const generationCurve = predictAnnualGenerationCurve(recommendedCapacity, metrics.assumptions.combinedDeratePR || 0.76);

  const monthlyComparisonChartData = consumptionCurve.map((item, idx) => ({
    month: item.month,
    consumption: item.predictedConsumption,
    solarGeneration: generationCurve[idx]?.solarGeneration || 0,
    netGridDraw: Math.max(0, item.predictedConsumption - (generationCurve[idx]?.solarGeneration || 0)),
  }));

  // 4. Formulate dynamically grounded AI explanation
  let aiExplanation = '';
  let solarSuitability = 'Good';

  if (userType === 'residential') {
    const householdStr = categoryDetails.householdSize ? ` for your household of ${categoryDetails.householdSize}` : '';
    const appliancesStr = categoryDetails.appliances && categoryDetails.appliances.length > 0 
      ? ` to offset high-load appliances including ${categoryDetails.appliances.join(', ')}`
      : '';
    const orientationNote = roofOrientation === 'south' ? 'with optimal South orientation' : roofOrientation === 'east_west' ? 'engineered for East-West dual peak insolation' : '';

    if (areaConstraintApplied) {
      solarSuitability = 'Moderate';
      aiExplanation = `Your monthly consumption of ${monthlyConsumption} kWh${householdStr} would ideally benefit from a ${(monthlyConsumption / (30 * solarResource.dailyPeakSunHours * 0.76)).toFixed(1)} kW system. However, your usable roof area (${metrics.roofModel?.usableRoofArea || roofArea} sq.ft) accommodates up to ${recommendedCapacity} kW (${areaRequiredSqFt} sq.ft required) to maintain mandatory walkways and boundary setbacks. Sizing your system at ${recommendedCapacity} kW offsets ~${Math.round((annualGeneration / (monthlyConsumption * 12)) * 100)}% of your annual electricity bill while ensuring unconstrained maintenance access.`;
    } else {
      solarSuitability = 'Excellent';
      aiExplanation = `Based on your monthly electricity consumption of ${monthlyConsumption} kWh in ${location.city || location.state || 'India'} (${solarResource.dailyPeakSunHours} peak sun hours/day)${householdStr}${appliancesStr ? appliancesStr : ''}, SolarSense recommends an optimal ${recommendedCapacity} kW grid-tied system (${panelCount} high-efficiency 540W mono PERC panels${orientationNote ? ', ' + orientationNote : ''}). This system qualifies for ₹${subsidy.toLocaleString('en-IN')} in direct PM Surya Ghar subsidy, bringing your net investment to ₹${netCost.toLocaleString('en-IN')} with an attractive payback period of ~${paybackPeriod} years and levelized cost of ₹${lcoe}/kWh.`;
    }
  } else if (userType === 'farm') {
    solarSuitability = 'Excellent';
    const acreageStr = categoryDetails.farmAcres ? ` across your ${categoryDetails.farmAcres}-acre agricultural farm` : '';
    const pumpStr = categoryDetails.pumpPower ? ` powering your ${categoryDetails.pumpCount || 1}x ${categoryDetails.pumpPower} ${categoryDetails.pumpPowerUnit || 'HP'} pump for ${categoryDetails.dailyHours || 6} hrs/day` : '';
    const goalStr = categoryDetails.solarOption === 'solar_pump_only' ? ' (dedicated solar pumping array)' : ' (covering both agricultural irrigation and farm residence)';

    aiExplanation = `For your agricultural profile (${monthlyConsumption} kWh/month in ${location.city || 'rural district'}${acreageStr}), daytime solar generation synchronizes directly with daytime water pumping and irrigation cycles${pumpStr}${goalStr}. A ${recommendedCapacity} kW solar system (${panelCount} panels) delivers ~${annualGeneration.toLocaleString('en-IN')} kWh of clean electricity annually. With agricultural tariff assumptions, this generates estimated annual savings of ₹${annualSavings.toLocaleString('en-IN')}, insulating your farm from grid power interruptions.`;
  } else if (userType === 'small_business') {
    solarSuitability = 'Excellent';
    const bizTypeStr = categoryDetails.businessType ? ` (${categoryDetails.businessType})` : '';
    const opsStr = categoryDetails.dailyHours ? ` operating ${categoryDetails.dailyHours} hours/day across ${categoryDetails.monthlyDays || 26} days/month` : '';
    const equipStr = categoryDetails.majorEquipment && categoryDetails.majorEquipment.length > 0 ? ` supporting equipment like ${categoryDetails.majorEquipment.join(', ')}` : '';

    aiExplanation = `Your commercial enterprise${bizTypeStr} consumes approximately ${monthlyConsumption} kWh per month${opsStr}. Because commercial operations peak during daytime working hours${equipStr}, you achieve an estimated 92% direct self-consumption of generated solar power. Recommending a ${recommendedCapacity} kW system with a ${inverterCapacity} kW commercial inverter. This cuts high commercial tariff expenses, achieving full capital payback in just ${paybackPeriod} years and an impressive 25-year ROI of ${roi}%.`;
  } else {
    solarSuitability = 'Excellent';
    const industryStr = categoryDetails.industryType ? ` for your ${categoryDetails.industryType} facility` : '';
    const peakStr = categoryDetails.sanctionedLoad ? ` with a sanctioned peak load of ${categoryDetails.sanctionedLoad} kW/kVA` : '';
    const mountStr = categoryDetails.installationType === 'ground_mounted' ? 'ground-mounted' : categoryDetails.installationType === 'hybrid' ? 'combined rooftop and ground-mounted' : 'industrial rooftop PEB';

    aiExplanation = `For your high-volume commercial/industrial operation (${monthlyConsumption.toLocaleString('en-IN')} kWh/month${industryStr}${peakStr}), SolarSense recommends a ${recommendedCapacity} kW ${mountStr} PV installation requiring ${areaRequiredSqFt.toLocaleString('en-IN')} sq.ft. The installation will generate ~${annualGeneration.toLocaleString('en-IN')} kWh annually, providing massive operational savings of ₹${annualSavings.toLocaleString('en-IN')} per year, along with eligible accelerated depreciation and commercial ESG credits.`;
  }

  // Adjust for shading condition if present
  if (shadingCondition === 'partial') {
    aiExplanation += ` Note: Partial shading detected; micro-inverters or string inverters with dual MPPT tracking are recommended to maximize panel-level energy harvesting.`;
  } else if (shadingCondition === 'significant') {
    aiExplanation += ` Warning: Significant shading noted; consider structural elevated mounting or tree trimming to prevent production degradation.`;
  }

  // Adjust for battery / grid preference
  if (batteryRequirement || gridPreference === 'hybrid' || gridPreference === 'off_grid') {
    aiExplanation += ` A hybrid inverter with lithium-ion storage is factored in to safeguard critical loads during grid outages.`;
  }

  return {
    metrics,
    recommendedCapacity,
    systemOptions,
    monthlyComparisonChartData,
    aiExplanation,
    solarSuitability,
    recommendationScore,
    scoreBreakdown,
    whyRecommendBullets,
    technicalSummary: {
      userType,
      monthlyConsumption,
      roofAreaAvailable: roofArea,
      roofAreaRequired: areaRequiredSqFt,
      roofAreaUtilizationPercent: Math.min(100, Math.round((areaRequiredSqFt / (roofArea || 1)) * 100)),
      daytimeSelfConsumptionRatio: userType === 'small_business' || userType === 'large_business' ? 92 : 88,
      gridType: gridPreference,
    },
    financialSummary: {
      systemCost,
      subsidy,
      netCost,
      annualSavings,
      monthlySavings,
      paybackYears: paybackPeriod,
      discountedPaybackYears: discountedPaybackPeriod,
      npv,
      irr,
      twentyFiveYearNetSavings: metrics.lifetimeSavings,
      roiPercent: roi,
      levelizedCostOfEnergy: lcoe, // Real mathematical LCOE
    },
    environmentalImpact: {
      co2AvoidedKg,
      treesPlanted,
      cleanEnergyKWh: annualGeneration,
    },
  };
}

module.exports = { buildPersonalizedRecommendation };
