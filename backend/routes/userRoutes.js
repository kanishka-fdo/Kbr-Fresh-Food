const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
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
} = require('../controllers/userController');

// Profile
router.put('/profile', protect, updateProfile);
router.put('/avatar', protect, uploadAvatar);

// Email change (OTP flow)
router.post('/request-email-change', protect, requestEmailChange);
router.post('/confirm-email-change', protect, confirmEmailChange);

// Addresses
router.post('/addresses', protect, addAddress);
router.patch('/addresses/:addressId', protect, updateAddress);
router.delete('/addresses/:addressId', protect, deleteAddress);

// Admin only
router.get('/', protect, authorize('admin'), getAllUsers);
router.post('/create-staff', protect, authorize('admin'), createStaffAccount);
router.patch('/:id/role', protect, authorize('admin'), updateUserRole);
router.patch('/:id/deactivate', protect, authorize('admin'), deactivateUser);
router.patch('/:id/details', protect, authorize('admin'), updateUserDetails);

module.exports = router;

