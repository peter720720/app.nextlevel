const School = require('../models/School');
const User = require('../models/User');
const stripe = require('../config/stripe');

exports.registerSchool = async (req, res) => {
  try {
    const { name, email, phone, address, adminFirstName, adminLastName, adminEmail, password } = req.body;
    
    const customer = await stripe.customers.create({ email, name });
    const newSchool = await School.create({ name, email, phone, address, stripeCustomerId: customer.id });
    
    const admin = await User.create({
      schoolId: newSchool._id,
      firstName: adminFirstName,
      lastName: adminLastName,
      email: adminEmail,
      password,
      role: 'admin'
    });

    res.status(201).json({ success: true, school: newSchool, adminId: admin._id });
  } catch (err) { res.status(400).json({ success: false, error: err.message }); }
};

exports.handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) { return res.status(400).send(`Webhook verification breakdown: ${err.message}`); }

  if (event.type === 'invoice.payment_succeeded') {
    const invoice = event.data.object;
    await School.findOneAndUpdate({ stripeCustomerId: invoice.customer }, { subscriptionStatus: 'active' });
  }
  res.json({ received: true });
};
