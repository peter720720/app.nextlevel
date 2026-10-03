require('dotenv').config();

const mongoose = require('mongoose');
const connectDB = require('../src/config/db');
const User = require('../src/models/User');

const createPlatformAdmin = async () => {
  const {
    PLATFORM_ADMIN_EMAIL,
    PLATFORM_ADMIN_PASSWORD,
    PLATFORM_ADMIN_FIRST_NAME,
    PLATFORM_ADMIN_LAST_NAME,
    PLATFORM_ADMIN_PHONE
  } = process.env;

  if (!PLATFORM_ADMIN_EMAIL || !PLATFORM_ADMIN_PASSWORD || !PLATFORM_ADMIN_FIRST_NAME || !PLATFORM_ADMIN_LAST_NAME) {
    throw new Error('Set the platform admin email, password, first name, and last name before running this command.');
  }

  if (PLATFORM_ADMIN_PASSWORD.length < 10) {
    throw new Error('The platform admin password must be at least 10 characters long.');
  }

  await connectDB();

  const existingPlatformAdmin = await User.findOne({ role: 'platform_admin' });
  if (existingPlatformAdmin) {
    throw new Error('A platform admin already exists. No account was changed.');
  }

  const existingEmail = await User.findOne({ email: PLATFORM_ADMIN_EMAIL.trim().toLowerCase() });
  if (existingEmail) {
    throw new Error('An account already uses that email. No account was changed.');
  }

  await User.create({
    firstName: PLATFORM_ADMIN_FIRST_NAME,
    lastName: PLATFORM_ADMIN_LAST_NAME,
    email: PLATFORM_ADMIN_EMAIL,
    password: PLATFORM_ADMIN_PASSWORD,
    phone: PLATFORM_ADMIN_PHONE || '',
    role: 'platform_admin'
  });

  console.log('Platform owner account created successfully.');
};

createPlatformAdmin()
  .catch((error) => {
    console.error(`Platform owner setup failed: ${error.message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
