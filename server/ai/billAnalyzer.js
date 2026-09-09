/**
 * Modular AI Bill Analyzer
 * Evaluates electricity bill consumption patterns, provides clear consumption & cost insights,
 * and calculates data-driven solar potential (NO generic Good/Moderate/Excellent ratings).
 */

function analyzeBillMetrics({
  unitsConsumed = 0,
  totalAmount = 0,
  userType = 'residential',
  tariff = null,
  billingPeriodDays = 30,
  discom = '',
}) {
  const units = Number(unitsConsumed) || 0;
  const amount = Number(totalAmount) || 0;
  const days = Number(billingPeriodDays) || 30;

  // Effective tariff calculation
  const effectiveTariff = tariff && Number(tariff) > 0
    ? Math.round(Number(tariff) * 100) / 100
    : (units > 0 && amount > 0 ? Math.round((amount / units) * 100) / 100 : 7.5);

  // Daily & annual metrics
  const dailyAverageKwh = days > 0 ? Number((units / days).toFixed(1)) : Number((units / 30).toFixed(1));
  const annualConsumptionKwh = Math.round(units * 12);

  // Solar sizing calculations
  // Typical insolation derate yield in India = ~4.8 PSH * 0.78 PR ≈ 3.74 kWh/day per kW installed
  // 1 kW generates approx 112 kWh/month (1,350–1,450 kWh/year)
  const idealCapacityKw = units > 0 ? units / (30 * 4.8 * 0.78) : 1;

  let minKw, maxKw, recommendedCapacityRange;
  if (userType === 'farm') {
    minKw = Math.max(3, Math.floor(idealCapacityKw));
    maxKw = Math.max(minKw + 2, Math.ceil(idealCapacityKw * 1.25));
    recommendedCapacityRange = `${minKw} – ${maxKw} kW (Agricultural Motor Load)`;
  } else if (userType === 'small_business') {
    minKw = Math.max(3, Math.floor(idealCapacityKw * 0.9));
    maxKw = Math.max(minKw + 2, Math.ceil(idealCapacityKw * 1.15));
    recommendedCapacityRange = `${minKw} – ${maxKw} kW`;
  } else if (userType === 'large_business') {
    minKw = Math.max(25, Math.floor(idealCapacityKw * 0.85 / 5) * 5);
    maxKw = Math.max(minKw + 15, Math.ceil(idealCapacityKw * 1.1 / 5) * 5);
    recommendedCapacityRange = `${minKw} – ${maxKw} kW`;
  } else {
    // Residential
    minKw = Math.max(1, Math.floor(idealCapacityKw));
    maxKw = Math.max(minKw + 1, Math.ceil(idealCapacityKw));
    recommendedCapacityRange = `${minKw} – ${maxKw} kW`;
  }

  // Estimated solar generation
  const minAnnualYield = Math.round(minKw * 1380);
  const maxAnnualYield = Math.round(maxKw * 1450);
  const estimatedAnnualGeneration = `${minAnnualYield.toLocaleString('en-IN')} – ${maxAnnualYield.toLocaleString('en-IN')} kWh/year`;
  const estimatedMonthlyGeneration = `${Math.round(minAnnualYield / 12)} – ${Math.round(maxAnnualYield / 12)} kWh/month`;

  // Savings estimates
  const estimatedMonthlySavings = Math.round(units * 0.85 * effectiveTariff);
  const estimatedAnnualSavings = estimatedMonthlySavings * 12;

  // 1. Consumption Insights
  let consumptionInsight = '';
  if (units > 0) {
    consumptionInsight = `You consumed ${units} kWh this billing period, averaging approximately ${dailyAverageKwh} kWh per day. Based on this usage, your electricity demand is well-suited for evaluating an on-grid rooftop solar system.`;
  } else {
    consumptionInsight = `Your consumption data is currently being assessed. A standard residential rooftop solar system can offset typical daily household usage.`;
  }

  // 2. Cost Insights
  let costInsight = '';
  if (amount > 0 && units > 0) {
    costInsight = `Your current electricity cost is approximately ₹${effectiveTariff}/unit. A solar system could reduce your dependence on grid electricity and lower your monthly electricity expense by up to 80–90%.`;
  } else {
    costInsight = `Grid electricity rates continue to rise year over year. A solar system locks in a levelized electricity cost below ₹2.50/unit over 25 years.`;
  }

  // 3. Solar Potential
  const isSuitable = units >= 50;
  const approxCoveragePercent = Math.min(100, Math.round(((minAnnualYield / 12) / Math.max(1, units)) * 100));
  const suitabilityExplanation = `A ${recommendedCapacityRange} system generates sufficient clean energy to power approximately ${approxCoveragePercent}% to 100% of your current monthly electricity demand.`;

  const keyFactors = [
    `Available shadow-free rooftop space (~${Math.round(minKw * 85)}–${Math.round(maxKw * 100)} sq.ft required)`,
    `Direct sunlight exposure (South or East-West orientation recommended)`,
    `DISCOM net-metering grid connection${discom ? ' under ' + discom : ''}`,
    userType === 'residential'
      ? 'PM Surya Ghar Central Subsidy eligibility (up to ₹78,000 direct credit)'
      : 'Accelerated 40% depreciation tax benefits for commercial/industrial solar',
  ];

  const solarPotential = {
    recommendedCapacityRange,
    minKw,
    maxKw,
    estimatedMonthlyGeneration,
    estimatedAnnualGeneration,
    isSuitable,
    suitabilityExplanation,
    keyFactors,
  };

  const summary = `Analyzed ${units} kWh consumption (${dailyAverageKwh} kWh/day) at ₹${effectiveTariff}/unit. Recommended solar sizing: ${recommendedCapacityRange}.`;

  return {
    summary,
    unitsConsumed: units,
    totalAmount: amount,
    effectiveTariff,
    billingPeriodDays: days,
    dailyAverageKwh,
    annualConsumptionKwh,
    consumptionInsight,
    costInsight,
    solarPotential,
    recommendedCapacityRange,
    estimatedMonthlySavings,
    estimatedAnnualSavings,
  };
}

module.exports = { analyzeBillMetrics };
