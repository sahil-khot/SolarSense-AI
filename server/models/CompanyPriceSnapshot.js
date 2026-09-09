const mongoose = require('mongoose');

const companyPriceSnapshotSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SolarCompany',
    required: true,
  },
  systemSizeKW: {
    type: Number,
    required: true,
  },
  priceMin: {
    type: Number,
    required: true,
  },
  priceMax: {
    type: Number,
    required: true,
  },
  location: {
    type: String,
    default: 'India (Average)',
  },
  priceType: {
    type: String,
    enum: ['equipment_only', 'turnkey', 'installation', 'estimated', 'official', 'market_indicative'],
    default: 'market_indicative',
  },
  source: {
    type: String,
    required: true,
  },
  sourceUrl: {
    type: String,
    default: '',
  },
  capturedAt: {
    type: Date,
    default: Date.now,
  },
});

companyPriceSnapshotSchema.index({ companyId: 1, systemSizeKW: 1 });

module.exports = mongoose.model('CompanyPriceSnapshot', companyPriceSnapshotSchema);
