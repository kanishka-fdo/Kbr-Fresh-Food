const Order = require('../models/Order');
const WholesaleOrder = require('../models/WholesaleOrder');
const Product = require('../models/Product');
const User = require('../models/User');

// @route GET /api/dashboard/summary (staff/admin)
const getSummary = async (req, res) => {
  try {
    const [totalOrders, totalWholesaleOrders, totalCustomers, totalProducts] = await Promise.all([
      Order.countDocuments(),
      WholesaleOrder.countDocuments(),
      User.countDocuments({ role: 'customer' }),
      Product.countDocuments({ isActive: true }),
    ]);

    const revenueAgg = await Order.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);
    const wholesaleRevenueAgg = await WholesaleOrder.aggregate([
      { $match: { status: { $in: ['approved', 'fulfilled'] } } },
      { $group: { _id: null, total: { $sum: '$itemsTotal' } } },
    ]);

    const lowStockCount = (await Product.find({ isActive: true })).filter(
      (p) => p.stockQuantity <= p.lowStockThreshold
    ).length;

    return res.json({
      totalOrders,
      totalWholesaleOrders,
      totalCustomers,
      totalProducts,
      retailRevenue: revenueAgg[0]?.total || 0,
      wholesaleRevenue: wholesaleRevenueAgg[0]?.total || 0,
      lowStockCount,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching dashboard summary', error: error.message });
  }
};

// @route GET /api/dashboard/sales-trend?days=30 (staff/admin)
const getSalesTrend = async (req, res) => {
  try {
    const days = Number(req.query.days) || 30;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const retailTrend = await Order.aggregate([
      { $match: { createdAt: { $gte: since }, status: { $ne: 'cancelled' } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$totalAmount' },
          orders: { $sum: 1 },
        },
      },
    ]);

    const wholesaleTrend = await WholesaleOrder.aggregate([
      { $match: { createdAt: { $gte: since }, status: { $in: ['approved', 'fulfilled'] } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$itemsTotal' },
          orders: { $sum: 1 },
        },
      },
    ]);

    const merged = {};
    for (const item of retailTrend) {
      merged[item._id] = { _id: item._id, revenue: item.revenue, orders: item.orders, retailRevenue: item.revenue, wholesaleRevenue: 0 };
    }
    for (const item of wholesaleTrend) {
      if (!merged[item._id]) {
        merged[item._id] = { _id: item._id, revenue: 0, orders: 0, retailRevenue: 0, wholesaleRevenue: 0 };
      }
      merged[item._id].revenue += item.revenue;
      merged[item._id].wholesaleRevenue += item.revenue;
      merged[item._id].orders += item.orders;
    }

    const trend = Object.values(merged).sort((a, b) => a._id.localeCompare(b._id));

    return res.json({ trend });
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching sales trend', error: error.message });
  }
};

// @route GET /api/dashboard/top-products (staff/admin)
const getTopProducts = async (req, res) => {
  try {
    const topProducts = await Order.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      {
        $unionWith: {
          coll: 'wholesaleorders',
          pipeline: [
            { $match: { status: { $in: ['approved', 'fulfilled'] } } }
          ]
        }
      },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          name: { $first: '$items.name' },
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$items.subtotal' },
        },
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 10 },
    ]);
    return res.json({ topProducts });
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching top products', error: error.message });
  }
};

// @route GET /api/dashboard/inventory-forecast (staff/admin)
// Simple forecast: average daily sales over the last 14 days vs. current stock -> days remaining
const getInventoryForecast = async (req, res) => {
  try {
    const since = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

    const salesByProduct = await Order.aggregate([
      { $match: { createdAt: { $gte: since }, status: { $ne: 'cancelled' } } },
      {
        $unionWith: {
          coll: 'wholesaleorders',
          pipeline: [
            { $match: { createdAt: { $gte: since }, status: { $in: ['approved', 'fulfilled'] } } }
          ]
        }
      },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          totalSold: { $sum: '$items.quantity' },
        },
      },
    ]);

    const salesMap = new Map(salesByProduct.map((s) => [s._id.toString(), s.totalSold]));
    const products = await Product.find({ isActive: true }).populate('category', 'name');

    const forecast = products.map((p) => {
      const totalSold = salesMap.get(p._id.toString()) || 0;
      const avgDailySales = totalSold / 14;
      const daysRemaining = avgDailySales > 0 ? Math.round(p.stockQuantity / avgDailySales) : null;
      return {
        product: p.name,
        category: p.category?.name,
        stockQuantity: p.stockQuantity,
        unit: p.unit,
        avgDailySales: Number(avgDailySales.toFixed(2)),
        daysRemaining,
        recommendation:
          daysRemaining !== null && daysRemaining <= 3
            ? 'Reorder soon'
            : daysRemaining === null
            ? 'No recent sales data'
            : 'Stock healthy',
      };
    });

    return res.json({ forecast });
  } catch (error) {
    return res.status(500).json({ message: 'Error generating inventory forecast', error: error.message });
  }
};

// @route GET /api/dashboard/customer-report (staff/admin) - top customers by spend
const getCustomerReport = async (req, res) => {
  try {
    const retailReport = await Order.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      {
        $group: {
          _id: '$customer',
          totalSpent: { $sum: '$totalAmount' },
          orderCount: { $sum: 1 },
        },
      },
    ]);

    const wholesaleReport = await WholesaleOrder.aggregate([
      { $match: { status: { $in: ['approved', 'fulfilled'] } } },
      {
        $group: {
          _id: '$buyer',
          totalSpent: { $sum: '$itemsTotal' },
          orderCount: { $sum: 1 },
        },
      },
    ]);

    const customerMap = {};
    for (const r of retailReport) {
      if (!r._id) continue;
      const idStr = r._id.toString();
      customerMap[idStr] = { _id: r._id, totalSpent: r.totalSpent, orderCount: r.orderCount };
    }
    for (const w of wholesaleReport) {
      if (!w._id) continue;
      const idStr = w._id.toString();
      if (!customerMap[idStr]) {
        customerMap[idStr] = { _id: w._id, totalSpent: 0, orderCount: 0 };
      }
      customerMap[idStr].totalSpent += w.totalSpent;
      customerMap[idStr].orderCount += w.orderCount;
    }

    const combined = Object.values(customerMap).sort((a, b) => b.totalSpent - a.totalSpent).slice(0, 20);

    const userIds = combined.map(c => c._id);
    const users = await User.find({ _id: { $in: userIds } }, 'name email businessName');
    
    const userDict = {};
    for (const u of users) userDict[u._id.toString()] = u;

    const report = combined.map(c => {
      const u = userDict[c._id.toString()];
      return {
        _id: c._id,
        name: u ? (u.businessName || u.name) : 'Unknown User',
        email: u ? u.email : '',
        totalSpent: c.totalSpent,
        orderCount: c.orderCount,
      };
    });

    return res.json({ report });
  } catch (error) {
    return res.status(500).json({ message: 'Error generating customer report', error: error.message });
  }
};

// @route GET /api/dashboard/category-breakdown (staff/admin)
const getCategoryBreakdown = async (req, res) => {
  try {
    const breakdown = await Order.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      {
        $unionWith: {
          coll: 'wholesaleorders',
          pipeline: [
            { $match: { status: { $in: ['approved', 'fulfilled'] } } }
          ]
        }
      },
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'products',
          localField: 'items.product',
          foreignField: '_id',
          as: 'productInfo',
        },
      },
      { $unwind: { path: '$productInfo', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'categories',
          localField: 'productInfo.category',
          foreignField: '_id',
          as: 'categoryInfo',
        },
      },
      { $unwind: { path: '$categoryInfo', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: '$categoryInfo.name',
          totalRevenue: { $sum: '$items.subtotal' },
          totalQuantity: { $sum: '$items.quantity' },
          orderCount: { $sum: 1 },
        },
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 10 },
    ]);

    // Fallback for products without category
    const result = breakdown.map((b) => ({
      name: b._id || 'Uncategorized',
      value: Math.round(b.totalRevenue),
      quantity: b.totalQuantity,
      orders: b.orderCount,
    }));

    return res.json({ breakdown: result });
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching category breakdown', error: error.message });
  }
};

module.exports = {
  getSummary,
  getSalesTrend,
  getTopProducts,
  getInventoryForecast,
  getCustomerReport,
  getCategoryBreakdown,
};
