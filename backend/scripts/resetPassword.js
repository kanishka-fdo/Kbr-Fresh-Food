/**
 * Quick utility to reset a user's password directly in the DB.
 * Usage: node scripts/resetPassword.js <email> <newPassword>
 */
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const email = process.argv[2];
const newPassword = process.argv[3];
if (!email || !newPassword) {
  console.error('Usage: node scripts/resetPassword.js <email> <newPassword>');
  process.exit(1);
}

mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 10000 })
  .then(async () => {
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      console.error(`❌ No user found with email: ${email}`);
      process.exit(1);
    }
    user.password = newPassword; // will be hashed by pre-save hook
    user.isEmailVerified = true; // ensure verified
    await user.save();
    console.log(`✅ Password reset for "${user.name}" (${user.email}). New password: ${newPassword}`);
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ DB connection failed:', err.message);
    process.exit(1);
  });
