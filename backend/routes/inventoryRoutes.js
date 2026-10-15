const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getInventoryHealth,
  getFreshness,
  getDynamicPricing,
  getDemandForecast,
  getKeellsAllocation,
  getWarehouseMap,
  getSupplierPerformance,
  getReorderRecommendations,
} = require('../controllers/inventoryController');

const admin = authorize('admin');

router.get('/health', protect, admin, getInventoryHealth);
router.get('/freshness', protect, admin, getFreshness);
router.get('/dynamic-pricing', protect, admin, getDynamicPricing);
router.get('/forecast', protect, admin, getDemandForecast);
router.get('/allocation', protect, admin, getKeellsAllocation);
router.get('/warehouse', protect, admin, getWarehouseMap);
router.get('/supplier-performance', protect, admin, getSupplierPerformance);
router.get('/reorder', protect, admin, getReorderRecommendations);

module.exports = router;
