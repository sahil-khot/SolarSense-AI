const mongoose = require('mongoose');

const systemOptionSchema = new mongoose.Schema({
  capacityKW: Number,
  panelCount: Number,
  inverterCapacity: Number,
  annualGeneration: Number,
  areaRequiredSqFt: Number,
  systemCost: Number,
  subsidy: Number,
  netCost: Number,
  annualSavings: Number,
  monthlySavings: Number,
  paybackPeriod: Number,
  roi: Number,
  co2AvoidedKg: Number,
  isRecommended: { type: Boolean, default: false },
  tierLabel: String, // e.g. "Conservative (2 kW)", "Optimal Recommended (4 kW)", "Maximum Generation (6 kW)"
  feasibilityNotes: String,
});

const recommendationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  assessmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SolarAssessment',
    required: true,
  },
  systemOptions: [systemOptionSchema],
  recommendedCapacity: Number,
  aiExplanation: String,
  technicalSummary: {
    userType: String,
    monthlyConsumption: Number,
    roofAreaAvailable: Number,
    roofAreaUtilizationPercent: Number,
    daytimeSelfConsumptionRatio: Number,
    gridType: String,
  },
  financialSummary: {
    netCost: Number,
    paybackYears: Number,
    twentyFiveYearNetSavings: Number,
    roiPercent: Number,
    levelizedCostOfEnergy: Number, // LCOE in INR/kWh
  },
  disclaimer: {
    type: String,
    default: 'These figures are algorithmic estimates based on regional solar irradiance averages and declared consumption parameters. Actual performance requires an on-site physical engineering survey and shadow path analysis.',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Recommendation', recommendationSchema);
