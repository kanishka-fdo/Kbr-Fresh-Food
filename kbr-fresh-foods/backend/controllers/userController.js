const crypto = require('crypto');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');
const { templates } = require('../utils/sendEmail');

// @route PUT /api/users/profile
const updateProfile = async (req, res) => {
  try {
    const { name, phone, businessName } = req.body;
    const user = await User.findById(req.user._id);

    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (businessName && user.role === 'wholesale') user.businessName = businessName;

    await user.save();
    return res.json({ user: user.toSafeObject() });
  } catch (error) {
    return res.status(500).json({ message: 'Server error updating profile', error: error.message });
  }
};

// @route POST /api/users/request-email-change
const requestEmailChange = async (req, res) => {
  try {
    const { newEmail } = req.body;
    if (!newEmail) return res.status(400).json({ message: 'New email is required' });

    const exists = await User.findOne({ email: newEmail.toLowerCase() });
    if (exists) return res.status(400).json({ message: 'This email is already in use by another account' });

    const user = await User.findById(req.user._id);

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.pendingEmail = newEmail.toLowerCase();
    user.emailChangeOtp = crypto.createHash('sha256').update(otp).digest('hex');
    user.emailChangeOtpExpires = Date.now() + 15 * 60 * 1000; // 15 minutes
    await user.save();

    const { subject, html } = templates.emailChangeOtp(user.name, otp, newEmail);
    await sendEmail({ to: newEmail, subject, html });

    return res.json({ message: `A 6-digit OTP has been sent to ${newEmail}. It expires in 15 minutes.` });
  } catch (error) {
    return res.status(500).json({ message: 'Server error requesting email change', error: error.message });
  }
};

// @route POST /api/users/confirm-email-change
const confirmEmailChange = async (req, res) => {
  try {
    const { otp } = req.body;
    if (!otp) return res.status(400).json({ message: 'OTP is required' });

    const hashedOtp = crypto.createHash('sha256').update(otp.toString()).digest('hex');
    const user = await User.findById(req.user._id);

    if (!user.emailChangeOtp || user.emailChangeOtp !== hashedOtp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }
    if (!user.emailChangeOtpExpires || user.emailChangeOtpExpires < Date.now()) {
      return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
    }

    user.email = user.pendingEmail;
    user.pendingEmail = undefined;
    user.emailChangeOtp = undefined;
    user.emailChangeOtpExpires = undefined;
    await user.save();

    return res.json({ message: 'Email changed successfully.', user: user.toSafeObject() });
  } catch (error) {
    return res.status(500).json({ message: 'Server error confirming email change', error: error.message });
  }
};

// @route POST /api/users/addresses
const addAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (req.body.isDefault) {
      user.addresses.forEach((a) => (a.isDefault = false));
    }
    user.addresses.push(req.body);
    await user.save();
    return res.status(201).json({ addresses: user.addresses });
  } catch (error) {
    return res.status(500).json({ message: 'Server error adding address', error: error.message });
  }
};

// @route DELETE /api/users/addresses/:addressId
const deleteAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.addresses = user.addresses.filter((a) => a._id.toString() !== req.params.addressId);
    await user.save();
    return res.json({ addresses: user.addresses });
  } catch (error) {
    return res.status(500).json({ message: 'Server error deleting address', error: error.message });
  }
};

// @route PATCH /api/users/addresses/:addressId
const updateAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const address = user.addresses.id(req.params.addressId);
    if (!address) return res.status(404).json({ message: 'Address not found' });

    const { label, line1, line2, city, lat, lng, isDefault } = req.body;
    if (label !== undefined) address.label = label;
    if (line1 !== undefined) address.line1 = line1;
    if (line2 !== undefined) address.line2 = line2;
    if (city !== undefined) address.city = city;
    if (lat !== undefined) address.lat = lat;
    if (lng !== undefined) address.lng = lng;
    if (isDefault) {
      user.addresses.forEach((a) => (a.isDefault = false));
      address.isDefault = true;
    }

    await user.save();
    return res.json({ addresses: user.addresses });
  } catch (error) {
    return res.status(500).json({ message: 'Server error updating address', error: error.message });
  }
};

// @route GET /api/users (admin only)
const getAllUsers = async (req, res) => {
  try {
    const { role } = req.query;
    const filter = role ? { role } : {};
    const users = await User.find(filter).select('-password').sort({ createdAt: -1 });
    return res.json({ users });
  } catch (error) {
    return res.status(500).json({ message: 'Server error fetching users', error: error.message });
  }
};

// @route PATCH /api/users/:id/role (admin only)
const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const validRoles = ['customer', 'staff', 'admin', 'driver', 'wholesale'];
    if (!validRoles.includes(role)) return res.status(400).json({ message: 'Invalid role' });

    const updateData = { role };
    if (role === 'wholesale') {
      updateData.wholesaleApproved = true;
    }

    const user = await User.findByIdAndUpdate(req.params.id, updateData, { new: true }).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    return res.json({ user });
  } catch (error) {
    return res.status(500).json({ message: 'Server error updating role', error: error.message });
  }
};

// @route PATCH /api/users/:id/deactivate (admin only) - toggles active status
const deactivateUser = async (req, res) => {
  try {
    // Prevent admin from deactivating their own account
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot deactivate your own account.' });
    }

    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    // Toggle: if active → deactivate; if inactive → reactivate
    user.isActive = !user.isActive;
    await user.save();
    return res.json({ user, message: user.isActive ? 'User reactivated successfully.' : 'User deactivated successfully.' });
  } catch (error) {
    return res.status(500).json({ message: 'Server error toggling user status', error: error.message });
  }
};

// @route PUT /api/users/avatar
const uploadAvatar = async (req, res) => {
  try {
    const { avatar } = req.body;
    if (!avatar) return res.status(400).json({ message: 'No image data provided' });
    if (!avatar.startsWith('data:image/')) {
      return res.status(400).json({ message: 'Invalid image format. Must be a base64 image.' });
    }
    if (avatar.length > 1500000) {
      return res.status(400).json({ message: 'Image too large. Please use an image under 1MB.' });
    }
    const user = await User.findById(req.user._id);
    user.avatar = avatar;
    await user.save();
    return res.json({ message: 'Profile picture updated.', user: user.toSafeObject() });
  } catch (error) {
    return res.status(500).json({ message: 'Error uploading avatar', error: error.message });
  }
};

// @route POST /api/users/create-staff (admin only — creates staff, driver, or wholesale account)
const createStaffAccount = async (req, res) => {
  try {
    const { name, email, password, phone, role, vehicleNumber, businessName, businessRegNo } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }
    const allowedRoles = ['staff', 'driver', 'admin', 'wholesale'];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ message: 'Invalid role. Allowed: staff, driver, admin, wholesale' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ message: 'An account with this email already exists' });
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      phone,
      role,
      vehicleNumber: role === 'driver' ? vehicleNumber : undefined,
      businessName: role === 'wholesale' ? businessName : undefined,
      businessRegNo: role === 'wholesale' ? businessRegNo : undefined,
      isEmailVerified: true, // Admin-created accounts are pre-verified
      isActive: true,
    });

    return res.status(201).json({ user: user.toSafeObject(), message: `${role.charAt(0).toUpperCase() + role.slice(1)} account created successfully.` });
  } catch (error) {
    return res.status(500).json({ message: 'Server error creating account', error: error.message });
  }
};

// @route PATCH /api/users/:id/details (admin only — update name/phone/vehicleNumber/businessName)
const updateUserDetails = async (req, res) => {
  try {
    const { name, phone, vehicleNumber, businessName, businessRegNo, isAvailable } = req.body;
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (name !== undefined) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (vehicleNumber !== undefined && user.role === 'driver') user.vehicleNumber = vehicleNumber;
    if (businessName !== undefined && user.role === 'wholesale') user.businessName = businessName;
    if (businessRegNo !== undefined && user.role === 'wholesale') user.businessRegNo = businessRegNo;
    if (isAvailable !== undefined && user.role === 'driver') user.isAvailable = isAvailable;

    await user.save();
    return res.json({ user: user.toObject(), message: 'User details updated.' });
  } catch (error) {
    return res.status(500).json({ message: 'Server error updating user details', error: error.message });
  }
};

module.exports = {
  updateProfile,
  requestEmailChange,
  confirmEmailChange,
  addAddress,
  deleteAddress,
  updateAddress,
  getAllUsers,
  updateUserRole,
  deactivateUser,
  uploadAvatar,
  createStaffAccount,
  updateUserDetails,
};
