const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  assignDriver,
  verifyQrCode,
  getAvailableDrivers,
  getMyDeliveries,
  cancelOrder,
  updatePaymentStatus,
  getOrderInvoice,
  requestPaymentOtp,
} = require('../controllers/orderController');

router.post('/request-payment-otp', protect, authorize('customer'), requestPaymentOtp);
router.post('/', protect, authorize('customer'), createOrder);
router.get('/my', protect, authorize('customer'), getMyOrders);
router.get('/drivers/available', protect, authorize('staff', 'admin'), getAvailableDrivers);
router.get('/driver/my', protect, authorize('driver'), getMyDeliveries);
router.get('/', protect, authorize('staff', 'admin'), getAllOrders);
router.get('/:id', protect, getOrderById);
router.patch('/:id/status', protect, authorize('staff', 'admin', 'driver'), updateOrderStatus);
router.patch('/:id/assign-driver', protect, authorize('staff', 'admin'), assignDriver);
router.post('/:id/verify-qr', protect, authorize('driver', 'admin'), verifyQrCode);
// New routes
router.patch('/:id/cancel', protect, authorize('customer'), cancelOrder);
router.patch('/:id/payment-status', protect, authorize('staff', 'admin'), updatePaymentStatus);
router.get('/:id/invoice', protect, getOrderInvoice);

module.exports = router;

