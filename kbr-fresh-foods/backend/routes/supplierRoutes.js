const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getSuppliers,
  createSupplier,
  getSupplier,
  updateSupplier,
  deleteSupplier
} = require('../controllers/supplierController');

router.route('/')
  .get(protect, authorize('admin'), getSuppliers)
  .post(protect, authorize('admin'), createSupplier);

router.route('/:id')
  .get(protect, authorize('admin'), getSupplier)
  .put(protect, authorize('admin'), updateSupplier)
  .delete(protect, authorize('admin'), deleteSupplier);

module.exports = router;
