/**
 * SolarSense Unified 25-Year Financial Engine
 * Calculates deterministic cash flows, degradation, tariff escalation,
 * Simple Payback, Discounted Payback, Net Present Value (NPV),
 * Internal Rate of Return (IRR), Return on Investment (ROI),
 * and true mathematically sound Levelized Cost of Energy (LCOE).
 *
 * Sourced according to MNRE & CEA guidelines for Indian Rooftop PV installations.
 */

const DEFAULT_FINANCIAL_PARAMS = {
  lifespanYears: 25,
  annualDegradationRate: 0.007, // 0.7% per year (Tier-1 Mono PERC warranty standard)
  tariffEscalationRate: 0.035,   // 3.5% average annual DISCOM tariff increase
  omRatePercentOfCapex: 0.01,   // 1.0% of system gross cost per year for routine cleaning & maintenance
  omInflationRate: 0.03,        // 3.0% annual inflation on O&M
  inverterReplacementYear: 12,  // Inverter replacement typically at year 10-12
  inverterReplacementCostPercent: 0.15, // Inverter represents ~15% of initial system Capex
  discountRate: 0.08,           // 8.0% standard discount rate for clean energy projects in India
};

/**
 * Computes 25-year financial ledger and investment returns.
 */
function calculateFinancialModel({
  systemCost,
  subsidy,
  year1AnnualGenerationKWh,
  baseTariff,
  selfConsumptionRatio = 0.90,
  params = {},
}) {
  const config = { ...DEFAULT_FINANCIAL_PARAMS, ...params };
  const netCapex = Math.max(0, systemCost - subsidy);

  const cashFlows = [];
  let cumulativeUndiscountedCashFlow = -netCapex;
  let cumulativeDiscountedCashFlow = -netCapex;
  let simplePaybackYear = null;
  let discountedPaybackYear = null;

  let totalDiscountedCosts = netCapex; // Initial net capex in Year 0
  let totalDiscountedGenerationKWh = 0;
  let lifetimeGrossSavings = 0;
  let lifetimeNetCashFlow = -netCapex;

  // Year 0 entry
  cashFlows.push({
    year: 0,
    generationKWh: 0,
    effectiveTariff: baseTariff,
    grossSavings: 0,
    omCost: 0,
    inverterReplacementCost: 0,
    netCashFlow: -netCapex,
    discountedCashFlow: -netCapex,
    cumulativeUndiscounted: -netCapex,
    cumulativeDiscounted: -netCapex,
  });

  for (let yr = 1; yr <= config.lifespanYears; yr++) {
    // 1. Solar generation with degradation
    const degradationMultiplier = Math.pow(1 - config.annualDegradationRate, yr - 1);
    const generationKWh = Math.round(year1AnnualGenerationKWh * degradationMultiplier);

    // 2. Escalated grid electricity tariff
    const tariffEscalationMultiplier = Math.pow(1 + config.tariffEscalationRate, yr - 1);
    const effectiveTariff = Math.round(baseTariff * tariffEscalationMultiplier * 100) / 100;

    // 3. Gross energy bill savings
    const usefulGeneration = generationKWh * selfConsumptionRatio;
    const grossSavings = Math.round(usefulGeneration * effectiveTariff);
    lifetimeGrossSavings += grossSavings;

    // 4. Operation & Maintenance (O&M) cost
    const omInflationMultiplier = Math.pow(1 + config.omInflationRate, yr - 1);
    const omCost = Math.round(systemCost * config.omRatePercentOfCapex * omInflationMultiplier);

    // 5. Inverter replacement at Year 12
    const inverterReplacementCost = yr === config.inverterReplacementYear
      ? Math.round(systemCost * config.inverterReplacementCostPercent)
      : 0;

    // 6. Net cash flow for this year
    const netCashFlow = grossSavings - omCost - inverterReplacementCost;
    lifetimeNetCashFlow += netCashFlow;

    // 7. Discounting at project discount rate
    const discountFactor = Math.pow(1 + config.discountRate, yr);
    const discountedCashFlow = netCashFlow / discountFactor;

    // Accumulate for true LCOE calculation
    totalDiscountedCosts += (omCost + inverterReplacementCost) / discountFactor;
    totalDiscountedGenerationKWh += generationKWh / discountFactor;

    // 8. Cumulative cash flows
    const prevUndiscounted = cumulativeUndiscountedCashFlow;
    cumulativeUndiscountedCashFlow += netCashFlow;

    const prevDiscounted = cumulativeDiscountedCashFlow;
    cumulativeDiscountedCashFlow += discountedCashFlow;

    // Track simple payback fraction
    if (simplePaybackYear === null && cumulativeUndiscountedCashFlow >= 0) {
      const remainingDeficit = -prevUndiscounted;
      const fraction = netCashFlow > 0 ? remainingDeficit / netCashFlow : 0;
      simplePaybackYear = Math.round(((yr - 1) + fraction) * 10) / 10;
    }

    // Track discounted payback fraction
    if (discountedPaybackYear === null && cumulativeDiscountedCashFlow >= 0) {
      const remainingDiscountedDeficit = -prevDiscounted;
      const fraction = discountedCashFlow > 0 ? remainingDiscountedDeficit / discountedCashFlow : 0;
      discountedPaybackYear = Math.round(((yr - 1) + fraction) * 10) / 10;
    }

    cashFlows.push({
      year: yr,
      generationKWh,
      effectiveTariff,
      grossSavings,
      omCost,
      inverterReplacementCost,
      netCashFlow,
      discountedCashFlow: Math.round(discountedCashFlow),
      cumulativeUndiscounted: Math.round(cumulativeUndiscountedCashFlow),
      cumulativeDiscounted: Math.round(cumulativeDiscountedCashFlow),
    });
  }

  // 9. Net Present Value (NPV)
  const npv = Math.round(cumulativeDiscountedCashFlow);

  // 10. True Levelized Cost of Energy (LCOE in INR / kWh)
  // LCOE = (Total Life-Cycle Discounted Costs) / (Total Life-Cycle Discounted Generation)
  const lcoe = totalDiscountedGenerationKWh > 0
    ? Math.round((totalDiscountedCosts / totalDiscountedGenerationKWh) * 100) / 100
    : 0;

  // 11. Internal Rate of Return (IRR) via numerical bisection
  const rawCashFlowValues = cashFlows.map(cf => cf.netCashFlow);
  const irr = calculateIRR(rawCashFlowValues);

  // 12. 25-Year ROI (%)
  const roi = netCapex > 0 ? Math.round((lifetimeNetCashFlow / netCapex) * 100) : 0;

  return {
    netCapex,
    systemCost,
    subsidy,
    simplePaybackYears: simplePaybackYear || 99,
    discountedPaybackYears: discountedPaybackYear || 99,
    npv,
    irr: irr !== null ? Math.round(irr * 1000) / 10 : null, // Percentage e.g. 24.5%
    lcoe, // Genuine calculated LCOE in INR/kWh
    twentyFiveYearGrossSavings: lifetimeGrossSavings,
    twentyFiveYearNetSavings: lifetimeNetCashFlow,
    roiPercent: roi,
    year1Savings: cashFlows[1]?.grossSavings || 0,
    cashFlowSchedule: cashFlows,
    assumptions: {
      lifespanYears: config.lifespanYears,
      discountRatePercent: config.discountRate * 100,
      annualDegradationPercent: config.annualDegradationRate * 100,
      tariffEscalationPercent: config.tariffEscalationRate * 100,
      omPercentOfCapex: config.omRatePercentOfCapex * 100,
      inverterReplacementYear: config.inverterReplacementYear,
      baseTariff,
    },
  };
}

/**
 * Calculates Internal Rate of Return (IRR) using bisection method.
 */
function calculateIRR(cashFlows, guess = 0.15) {
  let low = -0.5;
  let high = 2.0;
  const tolerance = 1e-5;
  const maxIterations = 100;

  const npvAtRate = (rate) => {
    let sum = 0;
    for (let t = 0; t < cashFlows.length; t++) {
      sum += cashFlows[t] / Math.pow(1 + rate, t);
    }
    return sum;
  };

  let npvLow = npvAtRate(low);
  let npvHigh = npvAtRate(high);

  if (npvLow * npvHigh > 0) {
    // No sign change; returns approximate simple rate if possible
    return null;
  }

  for (let i = 0; i < maxIterations; i++) {
    const mid = (low + high) / 2;
    const npvMid = npvAtRate(mid);

    if (Math.abs(npvMid) < tolerance) {
      return mid;
    }

    if (npvLow * npvMid < 0) {
      high = mid;
      npvHigh = npvMid;
    } else {
      low = mid;
      npvLow = npvMid;
    }
  }

  return (low + high) / 2;
}

module.exports = {
  calculateFinancialModel,
  DEFAULT_FINANCIAL_PARAMS,
};
