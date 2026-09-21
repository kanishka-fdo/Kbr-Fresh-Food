const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getSummary,
  getSalesTrend,
  getTopProducts,
  getInventoryForecast,
  getCustomerReport,
  getCategoryBreakdown,
} = require('../controllers/dashboardController');

router.use(protect, authorize('staff', 'admin'));

router.get('/summary', getSummary);
router.get('/sales-trend', getSalesTrend);
router.get('/top-products', getTopProducts);
router.get('/inventory-forecast', getInventoryForecast);
router.get('/customer-report', getCustomerReport);
router.get('/category-breakdown', getCategoryBreakdown);

module.exports = router;

