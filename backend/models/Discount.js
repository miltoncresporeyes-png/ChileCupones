const mongoose = require('mongoose');

const discountSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  
  // Discount details
  discountPercentage: Number, // e.g., 20 for 20%
  discountAmount: Number, // e.g., 5000 for $5000 off
  currency: { type: String, default: 'CLP' },
  
  // Relations
  store: { type: mongoose.Schema.Types.ObjectId, ref: 'Store' },
  paymentMethods: [{ type: mongoose.Schema.Types.ObjectId, ref: 'PaymentMethod' }],
  
  // Validity
  validFrom: Date,
  validUntil: Date,
  
  // Links
  url: { type: String, required: true }, // Original offer link
  affiliateUrl: String, // Monetization link
  
  // Media
  imageUrl: String,
  
  // Status
  active: { type: Boolean, default: true },
  verified: { type: Boolean, default: false }, // Validated by Validation Service
  lastVerifiedAt: Date,
  
  // Metadata
  source: { type: String, required: true }, // e.g., "crawler-banco-chile"
  externalId: String, // ID in the source system to avoid duplicates
  
  // Metrics
  clicks: { type: Number, default: 0 },
  likes: { type: Number, default: 0 },
  dislikes: { type: Number, default: 0 },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Indexes for faster queries
discountSchema.index({ store: 1, active: 1 });
discountSchema.index({ paymentMethods: 1, active: 1 });
discountSchema.index({ validUntil: 1 });
discountSchema.index({ externalId: 1, source: 1 }, { unique: true }); // Prevent duplicates from same source

module.exports = mongoose.model('Discount', discountSchema);
