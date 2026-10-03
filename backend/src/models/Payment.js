const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
  amount: { type: Number, required: true },
  currency: { type: String, required: true },
  status: { type: String, required: true },
  stripeInvoiceId: { type: String, unique: true }
}, { timestamps: true });

module.exports = mongoose.model('Payment', PaymentSchema);
