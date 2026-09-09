const mongoose = require('mongoose');

const solarAssessmentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  userType: {
    type: String,
    enum: ['residential', 'farm', 'small_business', 'large_business'],
    required: true,
  },
  location: {
    state: { type: String, default: 'Maharashtra' },
    city: { type: String, default: 'Pune' },
    pincode: { type: String, default: '' },
  },
  // Inputs
  monthlyConsumption: {
    type: Number,
    required: [true, 'Monthly consumption (kWh) is required'],
  },
  monthlyBill: {
    type: Number,
    required: [true, 'Monthly bill amount (INR) is required'],
  },
  tariff: {
    type: Number,
    default: 7.5,
  },
  roofArea: {
    type: Number,
    required: [true, 'Available rooftop or ground area (sq.ft) is required'],
  },
  roofType: {
    type: String,
    enum: ['concrete_flat', 'metal_sheet', 'clay_tile', 'open_ground'],
    default: 'concrete_flat',
  },
  shadingCondition: {
    type: String,
    enum: ['none', 'partial', 'significant'],
    default: 'none',
  },
  gridPreference: {
    type: String,
    enum: ['on_grid', 'hybrid', 'off_grid'],
    default: 'on_grid',
  },
  batteryRequirement: {
    type: Boolean,
    default: false,
  },
  budget: {
    type: Number,
    default: 0,
  },
  roofOrientation: {
    type: String,
    enum: ['south', 'east_west', 'north', 'unknown'],
    default: 'south',
  },
  dayNightUsage: {
    type: String,
    enum: ['day_heavy', 'balanced', 'night_heavy'],
    default: 'balanced',
  },
  categoryDetails: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  
  // Sizing and Technical Outputs
  recommendedCapacity: {
    type: Number,
    required: true, // in kW
  },
  estimatedDailyGeneration: {
    type: Number, // in kWh
  },
  estimatedGeneration: {
    type: Number,
    required: true, // annual generation in kWh
  },
  panelCount: {
    type: Number,
    required: true,
  },
  panelWattage: {
    type: Number,
    default: 540,
  },
  inverterCapacity: {
    type: Number,
    required: true, // in kW
  },
  areaRequiredSqFt: {
    type: Number,
  },

  // Financial Outputs
  estimatedCost: {
    type: Number,
    required: true, // in INR
  },
  subsidy: {
    type: Number,
    default: 0, // in INR
  },
  netCost: {
    type: Number,
    required: true, // in INR
  },
  annualSavings: {
    type: Number,
    required: true, // in INR
  },
  monthlySavings: {
    type: Number,
    default: 0,
  },
  paybackPeriod: {
    type: Number,
    required: true, // in years
  },
  roi: {
    type: Number,
    required: true, // in %
  },
  
  // Environmental Impact
  co2AvoidedKg: {
    type: Number,
    default: 0,
  },
  treesPlanted: {
    type: Number,
    default: 0,
  },

  // Assumptions & Sizing Metadata
  assumptions: {
    peakSunHours: { type: Number, default: 4.8 },
    performanceRatio: { type: Number, default: 0.78 },
    costPerKW: { type: Number, default: 60000 },
    billingDays: { type: Number, default: 30 },
  },
  
  aiExplanation: {
    type: String,
    default: '',
  },
  solarSuitability: {
    type: String,
    enum: ['Excellent', 'Good', 'Moderate', 'Limited'],
    default: 'Good',
  },
  sourceType: {
    type: String,
    enum: ['onboarding_wizard', 'bill_upload', 'quick_estimate'],
    default: 'onboarding_wizard',
  },
  sourceBill: {
    type: String,
    default: '',
  },
  sourceBillId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bill',
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('SolarAssessment', solarAssessmentSchema);
