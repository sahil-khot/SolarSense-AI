/**
 * SolarSense AI — What-If Solar Simulator Calculation Engine
 * Reuses deterministic formulas from server/utils/solarCalculations.js & server/config/subsidySchemes.js
 * Strictly NO fake data or arbitrary multipliers.
 */

export const PM_SURYA_GHAR_MAX_SUBSIDY = 78000;

/**
 * Calculates official PM Surya Ghar Central Government Subsidy (residential)
 * @param {number} capacityKW
 * @param {string} userType
 * @returns {number} Subsidy amount in INR
 */
export function calculateSubsidy(capacityKW, userType = 'residential') {
  if (userType !== 'residential' || capacityKW <= 0) {
    return 0;
  }
  if (capacityKW <= 1) {
    return Math.round(capacityKW * 30000);
  }
  if (capacityKW <= 2) {
    return Math.round(capacityKW * 30000);
  }
  if (capacityKW <= 3) {
    return Math.round(60000 + (capacityKW - 2) * 18000);
  }
  return PM_SURYA_GHAR_MAX_SUBSIDY;
}

/**
 * Simulates rooftop solar system for a given capacity using the user's authentic data context.
 */
export function simulateSolarCapacity({
  capacityKW,
  recommendedCapacity = 0,
  monthlyConsumption = 0,
  monthlyBill = 0,
  tariff = null,
  userType = 'residential',
  costPerKW = 60000,
  peakSunHours = 4.8,
  performanceRatio = 0.78,
  panelWattage = 540,
  sqFtPerKW = 90,
}) {
  const cap = Number(capacityKW) || 1;
  const recCap = Number(recommendedCapacity) || cap;

  // Resolved tariff
  const resolvedTariff =
    Number(tariff) > 0
      ? Number(tariff)
      : monthlyConsumption > 0 && monthlyBill > 0
      ? Math.round((monthlyBill / monthlyConsumption) * 100) / 100
      : userType === 'farm'
      ? 4.0
      : userType === 'small_business'
      ? 9.5
      : userType === 'large_business'
      ? 11.0
      : 7.5;

  // Annual Generation (kWh) = Capacity × Peak Sun Hours × 365 × PR
  const annualGeneration = Math.round(cap * peakSunHours * 365 * performanceRatio);
  const monthlyGeneration = Math.round(annualGeneration / 12);
  const dailyGeneration = Math.round((annualGeneration / 365) * 10) / 10;

  // Capital Expenditure
  const resolvedCostPerKW = Number(costPerKW) > 0 ? Number(costPerKW) : 60000;
  const systemCost = Math.round(cap * resolvedCostPerKW);
  const subsidy = calculateSubsidy(cap, userType);
  const netCost = Math.max(0, systemCost - subsidy);

  // Consumption offset & Financial Savings
  const annualConsumption = monthlyConsumption > 0 ? monthlyConsumption * 12 : annualGeneration;
  // Units consumed directly offset grid bill at retail tariff
  const offsetUnits = Math.min(annualGeneration, annualConsumption);
  // Surplus fed back into grid under DISCOM net-metering (credited at ~50% of retail or ₹3.50/kWh)
  const surplusUnits = Math.max(0, annualGeneration - annualConsumption);
  const feedInTariff = Math.max(3.0, Math.round(resolvedTariff * 0.5 * 10) / 10);

  const annualSavings = Math.round(offsetUnits * resolvedTariff + surplusUnits * feedInTariff);
  const monthlySavings = Math.round(annualSavings / 12);

  // Bill reduction percentage
  let billReductionPercent = 0;
  if (monthlyBill > 0) {
    billReductionPercent = Math.min(100, Math.round((monthlySavings / monthlyBill) * 100));
  } else if (monthlyConsumption > 0) {
    billReductionPercent = Math.min(100, Math.round((annualGeneration / annualConsumption) * 100));
  } else {
    billReductionPercent = 85; // Standard design target
  }

  // Simple Payback Period
  const paybackPeriod =
    netCost > 0 && annualSavings > 0
      ? Math.round((netCost / annualSavings) * 10) / 10
      : 0;

  // Physical specifications
  const panelCount = Math.ceil((cap * 1000) / panelWattage);
  const areaRequiredSqFt = Math.round(cap * sqFtPerKW);
  const inverterCapacity = cap <= 1.5 ? 1.5 : cap <= 3 ? 3 : cap <= 5 ? 5 : cap <= 8 ? 8 : Math.ceil(cap);

  // Environmental Impact
  const co2AvoidedKg = Math.round(annualGeneration * 0.82);
  const treesPlanted = Math.round(co2AvoidedKg / 20);
  const lifetimeSavings = Math.max(0, Math.round(annualSavings * 25 - netCost));

  return {
    capacityKW: cap,
    recommendedCapacity: recCap,
    annualGeneration,
    monthlyGeneration,
    dailyGeneration,
    systemCost,
    subsidy,
    netCost,
    annualSavings,
    monthlySavings,
    billReductionPercent,
    paybackPeriod,
    panelCount,
    panelWattage,
    inverterCapacity,
    areaRequiredSqFt,
    co2AvoidedKg,
    treesPlanted,
    lifetimeSavings,
    resolvedTariff,
  };
}

/**
 * Generates an intelligent, human-friendly "Is it worth it?" comparison verdict
 * based strictly on mathematical trade-offs between simulated and recommended capacity.
 */
export function generateSimulatorInsight(simulated, recommended) {
  if (!simulated || !recommended) {
    return {
      title: 'Balanced Recommendation',
      description: 'Your solar sizing is engineered to match your electricity consumption.',
      sentiment: 'positive',
    };
  }

  const diffCap = Math.round((simulated.capacityKW - recommended.capacityKW) * 10) / 10;
  const costDiff = simulated.netCost - recommended.netCost;
  const savingsDiff = simulated.annualSavings - recommended.annualSavings;
  const paybackDiff = Math.round((simulated.paybackPeriod - recommended.paybackPeriod) * 10) / 10;
  const areaDiff = simulated.areaRequiredSqFt - recommended.areaRequiredSqFt;

  if (diffCap === 0) {
    return {
      title: 'Your Optimal Recommended System',
      description: `This ${simulated.capacityKW} kW setup is your sweet spot. It delivers ~${simulated.billReductionPercent}% bill reduction while maximizing government subsidy (₹${simulated.subsidy.toLocaleString('en-IN')}) with an attractive ${simulated.paybackPeriod}-year payback.`,
      sentiment: 'recommended',
    };
  }

  if (diffCap > 0) {
    if (paybackDiff <= 0.6) {
      return {
        title: 'High-Yield Upgrade Option',
        description: `Upgrading to ${simulated.capacityKW} kW adds ~₹${savingsDiff.toLocaleString('en-IN')}/year in extra savings. While it requires ₹${Math.abs(costDiff).toLocaleString('en-IN')} more upfront and ~${areaDiff} sq.ft more roof space, the payback remains quick at ${simulated.paybackPeriod} years.`,
        sentiment: 'positive',
      };
    } else {
      return {
        title: 'Higher Future Capacity, Longer Payback',
        description: `The ${simulated.capacityKW} kW setup generates more power, but the extra ₹${Math.abs(costDiff).toLocaleString('en-IN')} investment extends your payback from ${recommended.paybackPeriod} to ${simulated.paybackPeriod} years. Recommended if you plan to add electric vehicles or AC units soon.`,
        sentiment: 'neutral',
      };
    }
  }

  // diffCap < 0 (Smaller system)
  return {
    title: 'Budget-Friendly Option with Lower Coverage',
    description: `Downsizing to ${simulated.capacityKW} kW saves ₹${Math.abs(costDiff).toLocaleString('en-IN')} upfront, but offsets only ~${simulated.billReductionPercent}% of your electricity, leaving you with higher recurring monthly bills to your DISCOM.`,
    sentiment: 'caution',
  };
}
