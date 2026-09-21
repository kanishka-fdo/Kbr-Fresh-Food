/**
 * Quick utility to force-verify a user account by email.
 * Usage: node scripts/verifyUser.js <email>
 */
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const email = process.argv[2];
if (!email) {
  console.error('Usage: node scripts/verifyUser.js <email>');
  process.exit(1);
}

mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 10000 })
  .then(async () => {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      console.error(`❌ No user found with email: ${email}`);
      process.exit(1);
    }
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();
    console.log(`✅ User "${user.name}" (${user.email}) has been verified. Role: ${user.role}`);
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ DB connection failed:', err.message);
    process.exit(1);
  });
