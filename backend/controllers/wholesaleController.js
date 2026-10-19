const WholesaleOrder = require('../models/WholesaleOrder');
const Product = require('../models/Product');
const Notification = require('../models/Notification');
const User = require('../models/User');

// @route POST /api/wholesale/orders (wholesale buyer requests a quote)
const requestQuote = async (req, res) => {
  try {
// Allow all wholesale users to request quotes directly

    const { items, requestedDeliveryDate, notes } = req.body;
    if (!items || !items.length) {
      return res.status(400).json({ message: 'At least one item is required' });
    }

    let itemsTotal = 0;
    const orderItems = [];

    for (const cartItem of items) {
      const product = await Product.findById(cartItem.product);
      if (!product || !product.isActive) {
        return res.status(400).json({ message: `Product not available: ${cartItem.product}` });
      }
      if (cartItem.quantity < product.minWholesaleQty) {
        return res
          .status(400)
          .json({ message: `${product.name} requires a minimum wholesale quantity of ${product.minWholesaleQty}${product.unit}` });
      }

      if (cartItem.quantity > product.stockQuantity) {
        return res
          .status(400)
          .json({ message: `Insufficient stock for ${product.name}. Requested: ${cartItem.quantity}, Available: ${product.stockQuantity}` });
      }

      const subtotal = product.wholesalePrice * cartItem.quantity;
      itemsTotal += subtotal;

      orderItems.push({
        product: product._id,
        name: product.name,
        quantity: cartItem.quantity,
        unitPrice: product.wholesalePrice,
        subtotal,
      });
    }

    const order = await WholesaleOrder.create({
      buyer: req.user._id,
      items: orderItems,
      itemsTotal,
      requestedDeliveryDate,
      notes,
      status: 'quoted', // auto-quoted since pricing is fixed in the catalog
    });

    // Notify admins/staff of the new bulk order request
    const staffAndAdmins = await User.find({ role: { $in: ['staff', 'admin'] }, isActive: true });
    await Notification.insertMany(
      staffAndAdmins.map((u) => ({
        user: u._id,
        title: 'New Wholesale Order',
        message: `${req.user.businessName || req.user.name} requested a bulk order (${order.orderNumber}) worth Rs. ${itemsTotal.toLocaleString()}.`,
        type: 'wholesale_update',
      }))
    );

    return res.status(201).json({ order });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error creating wholesale order', error: error.message });
  }
};

// @route GET /api/wholesale/orders/my
const getMyWholesaleOrders = async (req, res) => {
  const orders = await WholesaleOrder.find({ buyer: req.user._id }).sort({ createdAt: -1 });
  return res.json({ orders });
};

// @route GET /api/wholesale/orders (staff/admin)
const getAllWholesaleOrders = async (req, res) => {
  const { status } = req.query;
  const filter = status ? { status } : {};
  const orders = await WholesaleOrder.find(filter)
    .populate('buyer', 'name businessName email phone')
    .sort({ createdAt: -1 });
  return res.json({ orders });
};

// @route PATCH /api/wholesale/orders/:id/approve (staff/admin)
const approveWholesaleOrder = async (req, res) => {
  try {
    const order = await WholesaleOrder.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Wholesale order not found' });

    // Deduct stock now that the order is approved
    for (const item of order.items) {
      const product = await Product.findById(item.product);
      if (product) {
        if (product.stockQuantity < item.quantity) {
          return res.status(400).json({ message: `Insufficient stock for ${product.name} to fulfil this order` });
        }
        product.stockQuantity -= item.quantity;
        await product.save();
      }
    }

    order.status = 'approved';
    order.approvedBy = req.user._id;
    order.approvedAt = new Date();
    await order.save();

    await Notification.create({
      user: order.buyer,
      title: 'Wholesale Order Approved',
      message: `Your bulk order ${order.orderNumber} has been approved and will be prepared for delivery.`,
      type: 'wholesale_update',
    });

    return res.json({ order });
  } catch (error) {
    return res.status(500).json({ message: 'Error approving wholesale order', error: error.message });
  }
};

// @route PATCH /api/wholesale/orders/:id/reject (staff/admin)
const rejectWholesaleOrder = async (req, res) => {
  const { reason } = req.body;
  const order = await WholesaleOrder.findById(req.params.id);
  if (!order) return res.status(404).json({ message: 'Wholesale order not found' });

  order.status = 'rejected';
  order.notes = reason || order.notes;
  await order.save();

  await Notification.create({
    user: order.buyer,
    title: 'Wholesale Order Rejected',
    message: `Your bulk order ${order.orderNumber} was rejected. ${reason || ''}`,
    type: 'wholesale_update',
  });

  return res.json({ order });
};

// @route PATCH /api/wholesale/orders/:id/fulfil (staff/admin)
const fulfilWholesaleOrder = async (req, res) => {
  const order = await WholesaleOrder.findById(req.params.id);
  if (!order) return res.status(404).json({ message: 'Wholesale order not found' });

  order.status = 'fulfilled';
  await order.save();

  await Notification.create({
    user: order.buyer,
    title: 'Wholesale Order Fulfilled',
    message: `Your bulk order ${order.orderNumber} has been delivered.`,
    type: 'wholesale_update',
  });

  return res.json({ order });
};

// @route PATCH /api/wholesale/approve-buyer/:userId (admin - approves a business account)
const approveBuyer = async (req, res) => {
  const user = await User.findOneAndUpdate(
    { _id: req.params.userId, role: 'wholesale' },
    { wholesaleApproved: true },
    { new: true }
  );
  if (!user) return res.status(404).json({ message: 'Wholesale buyer not found' });

  await Notification.create({
    user: user._id,
    title: 'Wholesale Account Approved',
    message: 'Your business account has been approved. You can now place bulk orders.',
    type: 'wholesale_update',
  });

  return res.json({ user: user.toSafeObject() });
};

// @route GET /api/wholesale/pending-buyers (admin)
const getPendingBuyers = async (req, res) => {
  const buyers = await User.find({ role: 'wholesale', wholesaleApproved: false });
  return res.json({ buyers });
};

// @route GET /api/wholesale/orders/:id
const getWholesaleOrderById = async (req, res) => {
  try {
    const order = await WholesaleOrder.findById(req.params.id).populate('buyer', 'name businessName email phone');
    if (!order) return res.status(404).json({ message: 'Wholesale order not found' });

    const isOwner = order.buyer._id.toString() === req.user._id.toString();
    const isStaffOrAbove = ['staff', 'admin'].includes(req.user.role);
    if (!isOwner && !isStaffOrAbove) {
      return res.status(403).json({ message: 'Not authorized to view this order' });
    }

    return res.json({ order });
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching wholesale order', error: error.message });
  }
};

// @route PATCH /api/wholesale/orders/:id/transaction (staff/admin — record a payment)
const recordTransaction = async (req, res) => {
  try {
    const { amount, reference, method, note } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'A valid payment amount is required' });
    }

    const order = await WholesaleOrder.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Wholesale order not found' });

    const transaction = {
      amount: Number(amount),
      reference,
      method: method || 'bank_transfer',
      note,
      recordedBy: req.user._id,
      recordedAt: new Date(),
    };

    order.transactionHistory.push(transaction);
    order.amountPaid = (order.amountPaid || 0) + Number(amount);

    // Auto-update paymentStatus
    if (order.amountPaid >= order.itemsTotal) {
      order.paymentStatus = 'paid';
    } else if (order.amountPaid > 0) {
      order.paymentStatus = 'partial';
    }
    if (reference) order.paymentReference = reference;

    await order.save();

    await Notification.create({
      user: order.buyer,
      title: 'Payment Recorded',
      message: `A payment of Rs. ${Number(amount).toLocaleString()} has been recorded for your wholesale order ${order.orderNumber}. Total paid: Rs. ${order.amountPaid.toLocaleString()}.`,
      type: 'wholesale_update',
    });

    return res.json({ order });
  } catch (error) {
    return res.status(500).json({ message: 'Error recording transaction', error: error.message });
  }
};

// @route PATCH /api/wholesale/orders/:id/cancel (buyer — quote_requested or quoted only)
const cancelWholesaleOrder = async (req, res) => {
  try {
    const order = await WholesaleOrder.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Wholesale order not found' });

    const isOwner = order.buyer.toString() === req.user._id.toString();
    const isStaffOrAbove = ['staff', 'admin'].includes(req.user.role);
    if (!isOwner && !isStaffOrAbove) {
      return res.status(403).json({ message: 'Not authorized to cancel this order' });
    }

    const cancellableStatuses = ['quote_requested', 'quoted'];
    if (!cancellableStatuses.includes(order.status)) {
      return res.status(400).json({ message: `Cannot cancel an order with status '${order.status}'. Only quote_requested or quoted orders can be cancelled.` });
    }

    order.status = 'cancelled';
    order.cancelledAt = new Date();
    order.cancelledBy = req.user._id;
    order.cancellationReason = req.body.reason || 'Cancelled by buyer';
    await order.save();

    // Notify staff
    const staffAndAdmins = await User.find({ role: { $in: ['staff', 'admin'] }, isActive: true });
    await Notification.insertMany(
      staffAndAdmins.map((u) => ({
        user: u._id,
        title: 'Wholesale Order Cancelled',
        message: `Wholesale order ${order.orderNumber} has been cancelled by the buyer.`,
        type: 'wholesale_update',
      }))
    );

    return res.json({ order, message: 'Wholesale order cancelled successfully.' });
  } catch (error) {
    return res.status(500).json({ message: 'Error cancelling wholesale order', error: error.message });
  }
};

module.exports = {
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
};
