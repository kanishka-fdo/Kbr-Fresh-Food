const crypto = require('crypto');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const sendEmail = require('../utils/sendEmail');
const { templates } = require('../utils/sendEmail');

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// @route POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, email, password, phone, role, businessName, businessRegNo, vehicleNumber } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ message: 'An account with this email already exists' });
    }

    const allowedSelfRoles = ['customer', 'wholesale'];
    const finalRole = allowedSelfRoles.includes(role) ? role : 'customer';

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      phone,
      role: finalRole,
      businessName: finalRole === 'wholesale' ? businessName : undefined,
      businessRegNo: finalRole === 'wholesale' ? businessRegNo : undefined,
      vehicleNumber,
    });

    // Generate email verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    user.emailVerificationToken = crypto.createHash('sha256').update(verificationToken).digest('hex');
    user.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
    await user.save();

    const verifyUrl = `${CLIENT_URL}/verify-email/${verificationToken}`;
    const { subject, html } = templates.emailVerification(user.name, verifyUrl);

    try {
      await sendEmail({ to: user.email, subject, html });
      console.log(`✉️  Verification email sent to ${user.email}`);
    } catch (emailErr) {
      console.error('Failed to send verification email:', emailErr.message);
      // Don't block registration if email fails — user can resend
    }

    return res.status(201).json({
      message: 'Registration successful! Please check your email to verify your account before logging in.',
      email: user.email,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error during registration', error: error.message });
  }
};

// @route GET /api/auth/verify-email/:token
const verifyEmail = async (req, res) => {
  try {
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Verification link is invalid or has expired' });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    return res.json({ message: 'Email verified successfully. You can now log in.' });
  } catch (error) {
    return res.status(500).json({ message: 'Server error during email verification', error: error.message });
  }
};

// @route POST /api/auth/resend-verification
const resendVerification = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    // Don't reveal if the user exists or not
    if (!user || user.isEmailVerified) {
      return res.json({ message: 'If that email is registered and unverified, a new verification link has been sent.' });
    }

    // Generate a fresh token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    user.emailVerificationToken = crypto.createHash('sha256').update(verificationToken).digest('hex');
    user.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000;
    await user.save();

    const verifyUrl = `${CLIENT_URL}/verify-email/${verificationToken}`;
    const { subject, html } = templates.emailVerification(user.name, verifyUrl);
    await sendEmail({ to: user.email, subject, html });

    return res.json({ message: 'If that email is registered and unverified, a new verification link has been sent.' });
  } catch (error) {
    return res.status(500).json({ message: 'Server error during resend', error: error.message });
  }
};

// @route POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (!user.isEmailVerified) {
      return res.status(403).json({
        message: 'Please verify your email before logging in. Check your inbox or request a new verification link.',
        unverified: true,
        email: user.email,
      });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: 'This account has been deactivated' });
    }

    const token = generateToken(user._id, user.role);
    return res.json({ token, user: user.toSafeObject() });
  } catch (error) {
    return res.status(500).json({ message: 'Server error during login', error: error.message });
  }
};

// @route POST /api/auth/forgot-password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: (email || '').toLowerCase() });

    if (!user) {
      return res.json({ message: 'If that email is registered, a reset link has been sent.' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.passwordResetExpires = Date.now() + 60 * 60 * 1000;
    await user.save();

    const resetUrl = `${CLIENT_URL}/reset-password/${resetToken}`;
    const { subject, html } = templates.passwordReset(user.name, resetUrl);
    await sendEmail({ to: user.email, subject, html });

    return res.json({ message: 'If that email is registered, a reset link has been sent.' });
  } catch (error) {
    return res.status(500).json({ message: 'Server error during forgot-password', error: error.message });
  }
};

// @route POST /api/auth/reset-password/:token
const resetPassword = async (req, res) => {
  try {
    const { password } = req.body;
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Reset link is invalid or has expired' });
    }

    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    return res.json({ message: 'Password reset successful. You can now log in with your new password.' });
  } catch (error) {
    return res.status(500).json({ message: 'Server error during password reset', error: error.message });
  }
};

// @route POST /api/auth/change-password (requires auth)
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current and new password are required' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }

    const user = await User.findById(req.user._id).select('+password');
    const valid = await user.matchPassword(currentPassword);
    if (!valid) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    return res.json({ message: 'Password changed successfully.' });
  } catch (error) {
    return res.status(500).json({ message: 'Server error during password change', error: error.message });
  }
};

// @route GET /api/auth/me
const getMe = async (req, res) => {
  return res.json({ user: req.user.toSafeObject() });
};

module.exports = { register, verifyEmail, resendVerification, login, forgotPassword, resetPassword, changePassword, getMe };
