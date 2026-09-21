const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getLowStockAlerts,
  getExpiringAlerts,
} = require('../controllers/productController');

router.get('/', getProducts);
router.get('/alerts/low-stock', protect, authorize('staff', 'admin'), getLowStockAlerts);
router.get('/alerts/expiring', protect, authorize('staff', 'admin'), getExpiringAlerts);
router.get('/:id', getProductById);
router.post('/', protect, authorize('staff', 'admin'), createProduct);
router.put('/:id', protect, authorize('staff', 'admin'), updateProduct);
router.delete('/:id', protect, authorize('admin'), deleteProduct);

module.exports = router;
