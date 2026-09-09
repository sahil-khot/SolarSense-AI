const mongoose = require('mongoose');

const fieldProvenanceSchema = new mongoose.Schema({
  value: mongoose.Schema.Types.Mixed,
  source: {
    type: String,
    enum: [
      'bill_extracted',
      'user_input',
      'calculated',
      'ml_forecast',
      'engineering_standard',
      'discom_tariff_table',
    ],
    default: 'user_input',
  },
  confidence: {
    type: Number,
    min: 0,
    max: 1,
    default: 1.0,
  },
  status: {
    type: String,
    enum: ['extracted', 'estimated', 'calculated', 'userVerified', 'standard_assumption'],
    default: 'userVerified',
  },
  notes: {
    type: String,
    default: '',
  },
}, { _id: false });

const energyProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    primarySource: {
      type: String,
      enum: ['bill_upload', 'manual_assessment', 'quick_estimate'],
      default: 'manual_assessment',
    },
    sourceBillId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bill',
      default: null,
    },
    sourceAssessmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SolarAssessment',
      default: null,
    },
    sourceRecommendationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Recommendation',
      default: null,
    },
    userType: {
      type: String,
      enum: ['residential', 'farm', 'small_business', 'large_business'],
      default: 'residential',
    },
    location: {
      state: { type: String, default: 'Maharashtra' },
      city: { type: String, default: 'Pune' },
      pincode: { type: String, default: '' },
    },

    // 1. Consumption & Billing Metrics (Single Source of Truth)
    consumption: {
      monthlyConsumption: { type: Number, default: 0 },
      dailyConsumption: { type: Number, default: 0 },
      monthlyBill: { type: Number, default: 0 },
      tariff: { type: Number, default: 7.5 },
      billingPeriodDays: { type: Number, default: 30 },
      billingMonth: { type: String, default: '' },
      billingYear: { type: Number, default: () => new Date().getFullYear() },
      discom: { type: String, default: '' },
      consumerNumber: { type: String, default: '' },
      consumerName: { type: String, default: '' },
      consumerCategory: { type: String, default: 'Residential' },
      meterNumber: { type: String, default: '' },
      sanctionedLoadKW: { type: Number, default: null },
      fixedCharges: { type: Number, default: 0 },
      energyCharges: { type: Number, default: 0 },
      taxes: { type: Number, default: 0 },
    },

    // 2. Property & Installation Constraints
    property: {
      roofArea: { type: Number, default: 0 },
      usableRoofArea: { type: Number, default: 0 },
      roofType: {
        type: String,
        enum: ['concrete_flat', 'metal_sheet', 'clay_tile', 'open_ground'],
        default: 'concrete_flat',
      },
      roofOrientation: {
        type: String,
        enum: ['south', 'east_west', 'north', 'unknown'],
        default: 'south',
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
      batteryRequirement: { type: Boolean, default: false },
      budget: { type: Number, default: 0 },
      dayNightUsage: {
        type: String,
        enum: ['day_heavy', 'balanced', 'night_heavy'],
        default: 'balanced',
      },
    },

    // 3. Deterministic Engineering System Sizing
    solar: {
      recommendedCapacity: { type: Number, default: 0 }, // in kW
      capacityRange: {
        min: { type: Number, default: 0 },
        max: { type: Number, default: 0 },
      },
      panelCount: { type: Number, default: 0 },
      panelWattage: { type: Number, default: 540 },
      inverterCapacity: { type: Number, default: 0 }, // in kW
      areaRequiredSqFt: { type: Number, default: 0 },
      dailyGeneration: { type: Number, default: 0 }, // kWh/day
      annualGeneration: { type: Number, default: 0 }, // kWh/year
      solarSuitability: {
        type: String,
        enum: ['Excellent', 'Good', 'Moderate', 'Limited', 'Unavailable'],
        default: 'Unavailable',
      },
      aiExplanation: { type: String, default: '' },
      whyRecommendBullets: { type: [String], default: [] },
      recommendationScore: { type: Number, default: 0 },
    },

    // 4. Deterministic Financial Model
    financials: {
      systemCost: { type: Number, default: 0 },
      subsidy: { type: Number, default: 0 },
      subsidyScheme: { type: String, default: 'PM Surya Ghar: Muft Bijli Yojana' },
      netCost: { type: Number, default: 0 },
      annualSavings: { type: Number, default: 0 },
      monthlySavings: { type: Number, default: 0 },
      paybackPeriod: { type: Number, default: 0 }, // years
      discountedPaybackPeriod: { type: Number, default: 0 },
      npv: { type: Number, default: 0 },
      irr: { type: Number, default: 0 },
      lcoe: { type: Number, default: 0 }, // INR/kWh
      roi: { type: Number, default: 0 }, // %
      lifetimeSavings: { type: Number, default: 0 },
      financialViability: {
        type: String,
        enum: ['Strong', 'Moderate', 'Weak', 'Not Evaluated'],
        default: 'Not Evaluated',
      },
      viabilityReason: { type: String, default: '' },
    },

    // 5. Environmental Impact
    environmental: {
      co2AvoidedKg: { type: Number, default: 0 },
      treesPlanted: { type: Number, default: 0 },
      coalSavedKg: { type: Number, default: 0 },
    },

    // 6. Transparent Mathematical Assumptions Used in Engineering
    assumptions: {
      peakSunHours: { type: Number, default: 4.8 },
      performanceRatio: { type: Number, default: 0.78 },
      combinedDeratePR: { type: Number, default: 0.76 },
      costPerKW: { type: Number, default: 60000 },
      tariff: { type: Number, default: 7.5 },
      annualDegradationRate: { type: Number, default: 0.007 },
      tariffEscalationRate: { type: Number, default: 0.035 },
      discountRate: { type: Number, default: 0.08 },
      omRatePercentOfCapex: { type: Number, default: 0.01 },
      selfConsumptionRatio: { type: Number, default: 0.88 },
      lifespanYears: { type: Number, default: 25 },
      locationUsed: { type: String, default: 'Maharashtra' },
    },

    // 7. Granular Data Provenance Map (Tracks how each number was established)
    provenance: {
      monthlyConsumption: { type: fieldProvenanceSchema, default: () => ({ source: 'user_input', confidence: 0, status: 'estimated' }) },
      monthlyBill: { type: fieldProvenanceSchema, default: () => ({ source: 'user_input', confidence: 0, status: 'estimated' }) },
      tariff: { type: fieldProvenanceSchema, default: () => ({ source: 'discom_tariff_table', confidence: 0.8, status: 'standard_assumption' }) },
      roofArea: { type: fieldProvenanceSchema, default: () => ({ source: 'user_input', confidence: 0, status: 'estimated' }) },
      recommendedCapacity: { type: fieldProvenanceSchema, default: () => ({ source: 'calculated', confidence: 1.0, status: 'calculated' }) },
      annualGeneration: { type: fieldProvenanceSchema, default: () => ({ source: 'calculated', confidence: 1.0, status: 'calculated' }) },
      systemCost: { type: fieldProvenanceSchema, default: () => ({ source: 'calculated', confidence: 1.0, status: 'calculated' }) },
      subsidy: { type: fieldProvenanceSchema, default: () => ({ source: 'calculated', confidence: 1.0, status: 'calculated' }) },
      netCost: { type: fieldProvenanceSchema, default: () => ({ source: 'calculated', confidence: 1.0, status: 'calculated' }) },
      annualSavings: { type: fieldProvenanceSchema, default: () => ({ source: 'calculated', confidence: 1.0, status: 'calculated' }) },
      paybackPeriod: { type: fieldProvenanceSchema, default: () => ({ source: 'calculated', confidence: 1.0, status: 'calculated' }) },
    },

    // 8. Quality & Completeness Metadata
    dataQuality: {
      isComplete: { type: Boolean, default: false },
      hasBill: { type: Boolean, default: false },
      hasAssessment: { type: Boolean, default: false },
      hasVerifiedData: { type: Boolean, default: false },
      confidenceScore: { type: Number, min: 0, max: 1, default: 0 },
      lastUpdatedSource: { type: String, default: 'initial_creation' },
    },
  },
  {
    timestamps: true,
  }
);

// Fast user lookups
energyProfileSchema.index({ userId: 1 });

module.exports = mongoose.model('EnergyProfile', energyProfileSchema);
