const mongoose = require('mongoose');

const SchoolSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'School name required'], trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  stripeCustomerId: { type: String, default: '' },
  stripeSubscriptionId: { type: String, default: '' },
  subscriptionStatus: { 
    type: String, 
    enum: ['active', 'past_due', 'unpaid', 'canceled', 'trialing'], 
    default: 'trialing' 
  },
  planPackage: { type: String, enum: ['basic', 'standard', 'premium'], default: 'basic' },
  subscriptionExpiresAt: { 
    type: Date, 
    default: () => new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14-day default workspace trial
  }
}, { timestamps: true });

module.exports = mongoose.model('School', SchoolSchema);
