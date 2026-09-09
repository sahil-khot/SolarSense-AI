const mongoose = require('mongoose');

const fieldConfidenceSchema = new mongoose.Schema({
  unitsConsumed: { type: Number, min: 0, max: 1, default: 0 },
  totalAmount: { type: Number, min: 0, max: 1, default: 0 },
  billingMonth: { type: Number, min: 0, max: 1, default: 0 },
  tariff: { type: Number, min: 0, max: 1, default: 0 },
  overall: { type: Number, min: 0, max: 1, default: 0 },
}, { _id: false });

const billSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  fileName: {
    type: String,
    default: '',
  },
  filePath: {
    type: String,
    default: '',
  },
  fileUrl: {
    type: String,
    default: '',
  },
  fileType: {
    type: String,
    default: '',
  },
  discom: {
    type: String,
    default: '',
  },
  consumerNumber: {
    type: String,
    default: '',
  },
  consumerName: {
    type: String,
    default: '',
  },
  billingMonth: {
    type: String,
    default: 'Current Month',
  },
  billingYear: {
    type: Number,
    default: () => new Date().getFullYear(),
  },
  billingPeriodDays: {
    type: Number,
    default: 30,
  },
  unitsConsumed: {
    type: Number,
    default: null,
    min: 0,
  },
  totalAmount: {
    type: Number,
    default: null,
    min: 0,
  },
  tariff: {
    type: Number,
    default: null,
  },
  consumerCategory: {
    type: String,
    default: 'Residential',
  },
  sanctionedLoadKW: {
    type: Number,
    default: null,
  },
  fixedCharges: {
    type: Number,
    default: 0,
  },
  energyCharges: {
    type: Number,
    default: 0,
  },
  taxes: {
    type: Number,
    default: 0,
  },
  subsidiesApplied: {
    type: Number,
    default: 0,
  },
  meterNumber: {
    type: String,
    default: '',
  },
  previousReading: {
    type: Number,
    default: null,
  },
  currentReading: {
    type: Number,
    default: null,
  },
  extractionMethod: {
    type: String,
    enum: ['manual', 'pdf_text', 'ocr', 'gemini_multimodal', 'hybrid'],
    default: 'manual',
  },
  fieldConfidence: {
    type: fieldConfidenceSchema,
    default: () => ({}),
  },
  verificationStatus: {
    type: String,
    enum: ['verified', 'needs_verification'],
    default: 'needs_verification',
    index: true,
  },
  verifiedByUser: {
    type: Boolean,
    default: false,
  },
  verifiedAt: {
    type: Date,
    default: null,
  },
  validationErrors: {
    type: [String],
    default: [],
  },
  rawExtractedData: {
    type: mongoose.Schema.Types.Mixed,
    default: null,
  },
  normalizedData: {
    type: mongoose.Schema.Types.Mixed,
    default: null,
  },
  ocrText: {
    type: String,
    default: '',
  },
  aiInsights: {
    summary: String,
    consumptionLevel: {
      type: String,
      enum: ['Very Low', 'Low', 'Moderate', 'High', 'Very High'],
      default: 'Moderate',
    },
    solarSuitability: {
      type: String,
      enum: ['Excellent', 'Good', 'Moderate', 'Challenging'],
      default: 'Good',
    },
    recommendation: String,
    estimatedMonthlySavings: Number,
    recommendedCapacityRange: String,
    engine: String,
    isMlModelActive: Boolean,
    anomalies: [String],
  },
  status: {
    type: String,
    enum: ['uploaded', 'analyzed', 'archived'],
    default: 'uploaded',
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
});

// Compound index for fast user bill history retrieval
billSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Bill', billSchema);
