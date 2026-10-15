const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  requestQuote,
  getMyWholesaleOrders,
  getAllWholesaleOrders,
  approveWholesaleOrder,
  rejectWholesaleOrder,
  fulfilWholesaleOrder,
  approveBuyer,
  getPendingBuyers,
  getWholesaleOrderById,
  recordTransaction,
  cancelWholesaleOrder,
} = require('../controllers/wholesaleController');

router.post('/orders', protect, authorize('customer', 'wholesale', 'admin', 'staff'), requestQuote);
router.get('/orders/my', protect, authorize('customer', 'wholesale', 'admin', 'staff'), getMyWholesaleOrders);
router.get('/orders', protect, authorize('staff', 'admin'), getAllWholesaleOrders);
router.get('/orders/:id', protect, getWholesaleOrderById);
router.patch('/orders/:id/approve', protect, authorize('staff', 'admin'), approveWholesaleOrder);
router.patch('/orders/:id/reject', protect, authorize('staff', 'admin'), rejectWholesaleOrder);
router.patch('/orders/:id/fulfil', protect, authorize('staff', 'admin'), fulfilWholesaleOrder);
router.patch('/orders/:id/transaction', protect, authorize('staff', 'admin'), recordTransaction);
router.patch('/orders/:id/cancel', protect, cancelWholesaleOrder);

router.get('/pending-buyers', protect, authorize('admin'), getPendingBuyers);
router.patch('/approve-buyer/:userId', protect, authorize('admin'), approveBuyer);

module.exports = router;

