const Product = require('../models/Product');
const Purchase = require('../models/Purchase');
const Supplier = require('../models/Supplier');
const Order = require('../models/Order');

// ─── Helper: group by supplier from purchase history ──────────────────────────
function calcSupplierPerformance(purchases) {
  const bySupplier = {};
  for (const p of purchases) {
    if (!bySupplier[p.supplierName]) {
      bySupplier[p.supplierName] = { total: 0, paid: 0, unpaid: 0, orders: 0, totalValue: 0 };
    }
    bySupplier[p.supplierName].orders++;
    bySupplier[p.supplierName].totalValue += p.total;
    if (p.paymentStatus === 'Paid') bySupplier[p.supplierName].paid++;
    else bySupplier[p.supplierName].unpaid++;
  }
  return bySupplier;
}

// ─── GET /api/inventory/health ─────────────────────────────────────────────────
const getInventoryHealth = async (req, res) => {
  try {
    const products = await Product.find({ isActive: true }).populate('category');
    const orders = await Order.find({}).sort('-createdAt').limit(200);

    // Low stock
    const lowStock = products.filter(p => p.stockQuantity <= p.lowStockThreshold);

    // Near expiry (within 5 days)
    const now = Date.now();
    const nearExpiry = products.filter(p => {
      if (!p.expiryDate || !p.isPerishable) return false;
      const daysLeft = (p.expiryDate.getTime() - now) / (1000 * 60 * 60 * 24);
      return daysLeft <= 5 && daysLeft >= 0;
    });

    // Total inventory value
    const totalValue = products.reduce((sum, p) => sum + (p.stockQuantity * p.purchasePrice), 0);
    const retailValue = products.reduce((sum, p) => sum + (p.stockQuantity * p.retailPrice), 0);

    // Fast movers: products that appear in most orders
    const productSales = {};
    for (const order of orders) {
      for (const item of order.items || []) {
        const id = item.product?.toString();
        if (!id) continue;
        if (!productSales[id]) productSales[id] = { qty: 0, revenue: 0, name: item.name };
        productSales[id].qty += item.quantity;
        productSales[id].revenue += item.subtotal || 0;
      }
    }
    const fastMovers = Object.entries(productSales)
      .sort((a, b) => b[1].qty - a[1].qty)
      .slice(0, 5)
      .map(([id, data]) => ({ productId: id, name: data.name, qty: data.qty, revenue: data.revenue }));

    const slowMovers = products
      .filter(p => !productSales[p._id.toString()])
      .slice(0, 5)
      .map(p => ({ productId: p._id, name: p.name, stockQuantity: p.stockQuantity }));

    // Daily wastage estimate: sum of near-expiry stock value
    const wastageValue = nearExpiry.reduce((sum, p) => sum + (p.stockQuantity * p.purchasePrice), 0);

    res.json({
      summary: {
        totalProducts: products.length,
        lowStockCount: lowStock.length,
        nearExpiryCount: nearExpiry.length,
        totalInventoryValue: totalValue,
        retailInventoryValue: retailValue,
        potentialWastageValue: wastageValue,
      },
      lowStock: lowStock.map(p => ({
        _id: p._id, name: p.name, stockQuantity: p.stockQuantity,
        lowStockThreshold: p.lowStockThreshold, unit: p.unit,
        recommendedPurchase: Math.max(p.lowStockThreshold * 3, 50),
        purchasePrice: p.purchasePrice,
        category: p.category?.name,
      })),
      nearExpiry: nearExpiry.map(p => {
        const daysLeft = Math.round((p.expiryDate.getTime() - now) / (1000 * 60 * 60 * 24));
        return {
          _id: p._id, name: p.name, stockQuantity: p.stockQuantity, unit: p.unit,
          expiryDate: p.expiryDate, daysLeft,
          freshnessScore: p.freshnessScore,
          suggestedPrice: p.suggestedPrice,
          retailPrice: p.retailPrice,
        };
      }),
      fastMovers,
      slowMovers,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── GET /api/inventory/freshness ─────────────────────────────────────────────
const getFreshness = async (req, res) => {
  try {
    const products = await Product.find({ isActive: true, isPerishable: true }).populate('category');
    const now = Date.now();

    const result = products.map(p => {
      const freshnessScore = p.freshnessScore;
      const daysLeft = p.expiryDate
        ? Math.max(0, Math.round((p.expiryDate.getTime() - now) / (1000 * 60 * 60 * 24)))
        : null;

      let recommendation = 'Good — Normal sales';
      if (freshnessScore !== null) {
        if (freshnessScore <= 20) recommendation = '⚠️ Sell immediately / Discard';
        else if (freshnessScore <= 40) recommendation = '🏷️ Apply discount now';
        else if (freshnessScore <= 60) recommendation = '📦 Prioritize wholesale orders';
        else if (freshnessScore <= 75) recommendation = '🛒 Monitor closely';
      }

      return {
        _id: p._id,
        name: p.name,
        category: p.category?.name,
        stockQuantity: p.stockQuantity,
        unit: p.unit,
        arrivalDate: p.arrivalDate,
        expiryDate: p.expiryDate,
        daysLeft,
        freshnessScore,
        suggestedPrice: p.suggestedPrice,
        retailPrice: p.retailPrice,
        recommendation,
        warehouseZone: p.warehouseZone || 'General',
      };
    }).sort((a, b) => (a.freshnessScore ?? 100) - (b.freshnessScore ?? 100));

    res.json({ products: result });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── GET /api/inventory/dynamic-pricing ───────────────────────────────────────
const getDynamicPricing = async (req, res) => {
  try {
    const products = await Product.find({ isActive: true, isPerishable: true }).populate('category');

    const suggestions = products
      .filter(p => p.freshnessScore !== null && p.freshnessScore <= 75)
      .map(p => {
        const score = p.freshnessScore;
        let urgency = 'low';
        if (score <= 20) urgency = 'critical';
        else if (score <= 40) urgency = 'high';
        else if (score <= 60) urgency = 'medium';

        const discount = 100 - Math.round((p.suggestedPrice / p.retailPrice) * 100);
        return {
          _id: p._id,
          name: p.name,
          category: p.category?.name,
          stockQuantity: p.stockQuantity,
          unit: p.unit,
          freshnessScore: score,
          retailPrice: p.retailPrice,
          suggestedPrice: p.suggestedPrice,
          discount,
          urgency,
          potentialRevenue: p.suggestedPrice * p.stockQuantity,
          expiryDate: p.expiryDate,
        };
      })
      .sort((a, b) => a.freshnessScore - b.freshnessScore);

    res.json({ suggestions });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── GET /api/inventory/forecast ──────────────────────────────────────────────
const getDemandForecast = async (req, res) => {
  try {
    const products = await Product.find({ isActive: true }).populate('category');
    const orders = await Order.find({
      createdAt: { $gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) }
    });

    // Calculate sales velocity per product (units/day over 90 days)
    const salesData = {};
    for (const order of orders) {
      for (const item of order.items || []) {
        const id = item.product?.toString();
        if (!id) continue;
        if (!salesData[id]) salesData[id] = { totalQty: 0, revenue: 0, name: item.name };
        salesData[id].totalQty += item.quantity;
        salesData[id].revenue += item.subtotal || 0;
      }
    }

    const DAYS = 90;
    const forecast = products.map(p => {
      const id = p._id.toString();
      const data = salesData[id];
      const dailyVelocity = data ? data.totalQty / DAYS : 0;
      const weeklyDemand = Math.round(dailyVelocity * 7);
      const monthlyDemand = Math.round(dailyVelocity * 30);

      // Days until stockout
      const daysUntilStockout = dailyVelocity > 0
        ? Math.round(p.stockQuantity / dailyVelocity)
        : null;

      // Recommended purchase
      const targetStock = monthlyDemand * 1.2; // 20% buffer
      const recommendedPurchase = Math.max(0, Math.round(targetStock - p.stockQuantity));

      return {
        _id: p._id,
        name: p.name,
        category: p.category?.name,
        stockQuantity: p.stockQuantity,
        unit: p.unit,
        dailyVelocity: Math.round(dailyVelocity * 10) / 10,
        weeklyDemand,
        monthlyDemand,
        daysUntilStockout,
        recommendedPurchase,
        purchasePrice: p.purchasePrice,
        estimatedCost: recommendedPurchase * p.purchasePrice,
        stockStatus: daysUntilStockout === null ? 'No sales data' :
          daysUntilStockout <= 3 ? 'Critical' :
          daysUntilStockout <= 7 ? 'Low' :
          daysUntilStockout <= 14 ? 'Moderate' : 'Good',
      };
    }).sort((a, b) => (a.daysUntilStockout ?? 999) - (b.daysUntilStockout ?? 999));

    res.json({ forecast, generatedAt: new Date() });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── GET /api/inventory/allocation ────────────────────────────────────────────
const getKeellsAllocation = async (req, res) => {
  try {
    const products = await Product.find({ isActive: true, stockQuantity: { $gt: 0 } }).populate('category');

    // Keells branches in Negombo area
    const BRANCHES = [
      { name: 'Keells Super — Negombo', priority: 1, demandFactor: 1.0 },
      { name: 'Keells Super — Kochchikade', priority: 2, demandFactor: 0.7 },
      { name: 'Keells Super — Katunayake', priority: 3, demandFactor: 0.8 },
      { name: 'Food City — Negombo', priority: 4, demandFactor: 0.6 },
      { name: 'Food City — Wennappuwa', priority: 5, demandFactor: 0.5 },
    ];

    const allocations = products.map(p => {
      const available = p.stockQuantity;
      // Simulate branch requests based on demand factor
      const branchData = BRANCHES.map(b => {
        const requested = Math.round(available * b.demandFactor * 0.4);
        return { ...b, requested };
      });

      const totalRequested = branchData.reduce((sum, b) => sum + b.requested, 0);
      const wholesaleReserve = Math.round(available * 0.2); // keep 20% in reserve
      const distributable = Math.max(0, available - wholesaleReserve);

      // Allocate proportionally based on priority
      let remaining = distributable;
      const result = branchData
        .sort((a, b) => a.priority - b.priority)
        .map(b => {
          const share = totalRequested > 0 ? Math.round((b.requested / totalRequested) * distributable) : 0;
          const allocated = Math.min(share, remaining, b.requested);
          remaining -= allocated;
          return { ...b, allocated };
        });

      return {
        _id: p._id,
        name: p.name,
        category: p.category?.name,
        unit: p.unit,
        available,
        wholesaleReserve,
        distributable,
        totalRequested,
        branches: result,
      };
    });

    res.json({ allocations });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── GET /api/inventory/warehouse ─────────────────────────────────────────────
const getWarehouseMap = async (req, res) => {
  try {
    const products = await Product.find({ isActive: true }).populate('category');

    // Group by warehouse zone
    const zones = {};
    for (const p of products) {
      const zone = p.warehouseZone || 'General Storage';
      if (!zones[zone]) zones[zone] = [];
      zones[zone].push({
        _id: p._id,
        name: p.name,
        stockQuantity: p.stockQuantity,
        unit: p.unit,
        freshnessScore: p.freshnessScore,
        isLowStock: p.isLowStock,
        isExpiringSoon: p.isExpiringSoon,
        category: p.category?.name,
      });
    }

    // Default zones if no zone assigned
    const defaultZones = {
      'Cold Room A': ['Banana', 'Fruit'],
      'Cold Room B': ['Vegetable'],
      'Dry Storage': ['OTHERS', 'Rice'],
      'General Storage': [],
    };

    // Build zone heatmap
    const heatmap = Object.entries(defaultZones).map(([zoneName, cats]) => {
      const zoneProducts = products
        .filter(p => cats.some(c => p.category?.name?.toLowerCase().includes(c.toLowerCase())))
        .map(p => ({
          _id: p._id, name: p.name, stockQuantity: p.stockQuantity, unit: p.unit,
          freshnessScore: p.freshnessScore,
          isLowStock: p.isLowStock,
          isExpiringSoon: p.isExpiringSoon,
          category: p.category?.name,
        }));

      const avgFreshness = zoneProducts.length > 0
        ? Math.round(zoneProducts.reduce((s, p) => s + (p.freshnessScore ?? 100), 0) / zoneProducts.length)
        : 100;

      const status = avgFreshness < 30 ? 'critical' : avgFreshness < 60 ? 'warning' : 'good';

      return { zone: zoneName, products: zoneProducts, avgFreshness, status, categories: cats };
    });

    res.json({ heatmap });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── GET /api/inventory/supplier-performance ──────────────────────────────────
const getSupplierPerformance = async (req, res) => {
  try {
    const suppliers = await Supplier.find({}).sort('name');
    const purchases = await Purchase.find({}).sort('-purchaseDate');

    const perfMap = calcSupplierPerformance(purchases);

    const result = suppliers.map(s => {
      const perf = perfMap[s.name] || { orders: 0, paid: 0, unpaid: 0, totalValue: 0 };
      const onTimeRate = perf.orders > 0
        ? Math.round(((perf.paid) / perf.orders) * 100) : 0;
      const score = Math.round((onTimeRate * 0.6) + (perf.orders > 5 ? 30 : perf.orders * 6) + 10);

      return {
        _id: s._id,
        supplierId: s.supplierId,
        name: s.name,
        mobile: s.mobile,
        totalOrders: perf.orders,
        totalValue: perf.totalValue,
        paidOrders: perf.paid,
        unpaidOrders: perf.unpaid,
        onTimePaymentRate: onTimeRate,
        performanceScore: Math.min(100, score),
        purchaseDue: s.purchaseDue,
        status: s.status,
      };
    });

    res.json({ suppliers: result.sort((a, b) => b.performanceScore - a.performanceScore) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── GET /api/inventory/reorder-recommendations ───────────────────────────────
const getReorderRecommendations = async (req, res) => {
  try {
    const products = await Product.find({ isActive: true }).populate('category');
    const recommendations = products
      .filter(p => p.stockQuantity <= p.lowStockThreshold)
      .map(p => ({
        _id: p._id,
        name: p.name,
        category: p.category?.name,
        unit: p.unit,
        currentStock: p.stockQuantity,
        minimumStock: p.lowStockThreshold,
        recommendedPurchase: Math.max(p.lowStockThreshold * 3, 50),
        supplierName: p.supplierName || 'Any supplier',
        estimatedCost: Math.max(p.lowStockThreshold * 3, 50) * p.purchasePrice,
        urgency: p.stockQuantity === 0 ? 'Out of Stock' : 'Low Stock',
      }))
      .sort((a, b) => a.currentStock - b.currentStock);

    res.json({ recommendations, count: recommendations.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getInventoryHealth,
  getFreshness,
  getDynamicPricing,
  getDemandForecast,
  getKeellsAllocation,
  getWarehouseMap,
  getSupplierPerformance,
  getReorderRecommendations,
};
