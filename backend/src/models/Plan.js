const mongoose = require('mongoose');

const PlanSchema = new mongoose.Schema({
  name: { type: String, required: true, enum: ['basic', 'standard', 'premium'] },
  stripePriceId: { type: String, required: true }, // The product reference key generated on your Stripe panel
  price: { type: Number, required: true },
  currency: { type: String, default: 'usd' },
  interval: { type: String, default: 'month' }
}, { timestamps: true });

module.exports = mongoose.model('Plan', PlanSchema);
