/**
 * Modular Consumption Predictor
 * Predicts 12-month electricity consumption trends based on historical bill data,
 * user type seasonality, and temperature variations.
 */

// Monthly seasonal demand multipliers by user category
const SEASONAL_MULTIPLIERS = {
  residential: [0.85, 0.90, 1.15, 1.30, 1.35, 1.10, 0.95, 0.90, 0.95, 1.05, 0.85, 0.80], // High in Apr-May (AC)
  farm:        [1.10, 1.25, 1.35, 1.30, 1.10, 0.70, 0.65, 0.75, 1.00, 1.15, 1.20, 1.10], // High in Mar-Apr & Nov (Kharif/Rabi irrigation)
  small_business: [0.90, 0.95, 1.10, 1.20, 1.25, 1.15, 1.05, 1.00, 1.05, 1.10, 0.95, 0.90],
  large_business: [0.95, 0.98, 1.05, 1.15, 1.20, 1.12, 1.05, 1.02, 1.04, 1.08, 0.98, 0.96],
};

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function predictAnnualConsumptionCurve(baselineMonthlyConsumption, userType = 'residential') {
  const multipliers = SEASONAL_MULTIPLIERS[userType] || SEASONAL_MULTIPLIERS.residential;
  // Calculate average multiplier so baseline maps directly to average
  const avgMultiplier = multipliers.reduce((a, b) => a + b, 0) / 12;

  return MONTH_NAMES.map((month, index) => {
    const rawVal = (baselineMonthlyConsumption / avgMultiplier) * multipliers[index];
    const predictedKWh = Math.round(rawVal);
    return {
      month,
      predictedConsumption: predictedKWh,
    };
  });
}

module.exports = { predictAnnualConsumptionCurve };
