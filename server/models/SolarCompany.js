const mongoose = require('mongoose');

const solarCompanySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  type: {
    type: String,
    enum: ['Manufacturer', 'Installer/EPC', 'Both'],
    required: true,
  },
  logoUrl: {
    type: String,
    default: '',
  },
  officialWebsite: {
    type: String,
    required: true,
  },
  quoteUrl: {
    type: String,
    default: '',
  },
  headquarters: {
    type: String,
    default: '',
  },
  establishedYear: {
    type: Number,
    default: 2000,
  },
  products: {
    type: [String],
    default: [],
  },
  panelTechnology: {
    type: [String],
    default: ['Mono PERC', 'Bifacial'],
  },
  cellTechnology: {
    type: String,
    default: 'TOPCon / Mono PERC',
  },
  efficiencyPercent: {
    type: Number,
    default: 21.5,
  },
  annualDegradation: {
    type: String,
    default: '0.55% / yr',
  },
  advantages: {
    type: [String],
    default: [],
  },
  disadvantages: {
    type: [String],
    default: [],
  },
  productWarrantyYears: {
    type: Number,
    default: 12,
  },
  performanceWarrantyYears: {
    type: Number,
    default: 25,
  },
  installationAvailability: {
    type: String,
    enum: ['Nationwide', 'Regional', 'Major Metros'],
    default: 'Nationwide',
  },
  statesServed: {
    type: [String],
    default: ['All India'],
  },
  tier: {
    type: String,
    enum: ['Tier-1', 'Premium', 'Value'],
    default: 'Tier-1',
  },
  pricePerKWMin: {
    type: Number,
    default: null,
  },
  pricePerKWMax: {
    type: Number,
    default: null,
  },
  priceDisplay: {
    type: String,
    default: 'Price available on quotation',
  },
  priceType: {
    type: String,
    enum: ['turnkey', 'equipment_only', 'market_indicative', 'quote_only'],
    default: 'market_indicative',
  },
  inverterPartners: {
    type: [String],
    default: [],
  },
  amcAvailable: {
    type: Boolean,
    default: true,
  },
  financingAvailable: {
    type: Boolean,
    default: true,
  },
  subsidySupport: {
    type: Boolean,
    default: true,
  },
  netMeteringSupport: {
    type: Boolean,
    default: true,
  },
  evaluation: {
    overallScore: { type: Number, min: 0, max: 10, default: 8.5 },
    priceValue: { type: Number, min: 0, max: 10, default: 8.0 },
    productQuality: { type: Number, min: 0, max: 10, default: 9.0 },
    warrantyScore: { type: Number, min: 0, max: 10, default: 8.5 },
    installationScore: { type: Number, min: 0, max: 10, default: 8.0 },
    serviceScore: { type: Number, min: 0, max: 10, default: 8.0 },
    availabilityScore: { type: Number, min: 0, max: 10, default: 9.0 },
    technologyScore: { type: Number, min: 0, max: 10, default: 8.5 },
    assessmentDisclaimer: {
      type: String,
      default: 'SolarSense technical assessment based on verified public product specifications, manufacturer warranties, and market presence.',
    },
  },
  bestFor: {
    type: String,
    default: 'Best Overall',
  },
  source: {
    type: String,
    default: 'Official Company Website & MNRE ALMM Registry',
  },
  lastVerified: {
    type: String,
    default: 'March 2026',
  },
  featured: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

solarCompanySchema.index({ type: 1, statesServed: 1 });

module.exports = mongoose.model('SolarCompany', solarCompanySchema);
