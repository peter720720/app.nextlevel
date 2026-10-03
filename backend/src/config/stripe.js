const Stripe = require('stripe');
require('dotenv').config();

const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16', // Stable production API snapshot version
});

module.exports = stripeInstance;
