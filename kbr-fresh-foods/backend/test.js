require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/kbr-fresh-foods').then(async () => {
  const Order = require('./models/Order');
  const WholesaleOrder = require('./models/WholesaleOrder');

  try {
    const days = 30;
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
    console.log("retailTrend OK:", retailTrend.length);

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
    console.log("topProducts OK:", topProducts.length);

    const categoryBreakdown = await Order.aggregate([
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
      { $unwind: { path: '$productInfo', preserveNullAndEmpty: true } },
      {
        $lookup: {
          from: 'categories',
          localField: 'productInfo.category',
          foreignField: '_id',
          as: 'categoryInfo',
        },
      },
      { $unwind: { path: '$categoryInfo', preserveNullAndEmpty: true } },
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
    console.log("categoryBreakdown OK:", categoryBreakdown.length);

  } catch(e) {
    console.error("ERROR:", e);
  }
  process.exit(0);
});
