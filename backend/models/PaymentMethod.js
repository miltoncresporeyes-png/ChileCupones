const mongoose = require('mongoose');

const paymentMethodSchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g., "Banco de Chile", "CMR Falabella", "Generic"
  type: { 
    type: String, 
    enum: ['bank', 'retail_card', 'coupon', 'club'], 
    required: true 
  },
  logoUrl: String,
  slug: { type: String, required: true, unique: true }
});

module.exports = mongoose.model('PaymentMethod', paymentMethodSchema);
