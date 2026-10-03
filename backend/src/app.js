const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const schoolRoutes = require('./routes/schoolRoutes');
const planRoutes = require('./routes/planRoutes');
const { handleWebhook } = require('./controllers/schoolController');

const app = express();

// Global Middlewares
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'API is healthy' });
});

// Stripe signature verification requires the unparsed request body.
app.post('/api/schools/webhook', express.raw({ type: 'application/json' }), handleWebhook);

app.use(express.json());

// API Base Routes Mounting Points
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/schools', schoolRoutes);
app.use('/api/plans', planRoutes);

module.exports = app;
