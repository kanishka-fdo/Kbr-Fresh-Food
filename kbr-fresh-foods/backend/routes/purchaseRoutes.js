const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getPurchases,
  createPurchase,
  getPurchase,
  updatePurchase,
  deletePurchase
} = require('../controllers/purchaseController');

router.route('/')
  .get(protect, authorize('admin'), getPurchases)
  .post(protect, authorize('admin'), createPurchase);

router.route('/:id')
  .get(protect, authorize('admin'), getPurchase)
  .put(protect, authorize('admin'), updatePurchase)
  .delete(protect, authorize('admin'), deletePurchase);

module.exports = router;
