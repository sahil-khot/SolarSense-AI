/**
 * Modular Solar Predictor
 * Simulates month-by-month solar PV generation incorporating seasonal solar irradiance curves
 * and ambient temperature de-rating.
 */

// Average daily peak sun hours by month across central/western/southern India solar belt
const MONTHLY_SUN_HOURS = [
  5.0, // Jan
  5.3, // Feb
  5.6, // Mar
  5.7, // Apr
  5.5, // May (high temperature derate)
  4.0, // Jun (pre-monsoon clouds)
  3.4, // Jul (monsoon)
  3.5, // Aug (monsoon)
  4.5, // Sep (retreating monsoon)
  5.1, // Oct
  5.0, // Nov
  4.8, // Dec
];

const MONTH_DAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function predictAnnualGenerationCurve(capacityKW, performanceRatio = 0.78) {
  return MONTH_NAMES.map((month, idx) => {
    const dailySunHours = MONTHLY_SUN_HOURS[idx];
    const daysInMonth = MONTH_DAYS[idx];
    // Monthly kWh = capacityKW * dailySunHours * daysInMonth * PR
    const monthlyGen = Math.round(capacityKW * dailySunHours * daysInMonth * performanceRatio);
    return {
      month,
      solarGeneration: monthlyGen,
      dailySunHours,
    };
  });
}

module.exports = { predictAnnualGenerationCurve, MONTHLY_SUN_HOURS };
