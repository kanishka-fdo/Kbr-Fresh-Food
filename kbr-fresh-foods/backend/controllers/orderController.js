const Order = require('../models/Order');
const Product = require('../models/Product');
const Notification = require('../models/Notification');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');
const { templates } = require('../utils/sendEmail');
const invoiceService = require('../services/invoiceService');
const crypto = require('crypto');
const QRCode = require('qrcode');

// KBR Fresh Foods shop location (Negombo) - used to estimate delivery distance/time
const SHOP_LOCATION = { lat: 7.2083, lng: 79.8358 };

function haversineDistanceKm(a, b) {
  if (!a || !b || a.lat == null || b.lat == null) return null;
  const toRad = (deg) => (deg * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

// @route POST /api/orders/request-payment-otp
const requestPaymentOtp = async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount) {
      return res.status(400).json({ message: 'Amount is required to generate payment OTP' });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Generate 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Save to user (10 min expiry)
    user.paymentOtp = otp;
    user.paymentOtpExpires = Date.now() + 10 * 60 * 1000;
    await user.save();

    // Send Email
    const { subject, html } = templates.paymentOtp(user.name, otp, amount);
    await sendEmail({ to: user.email, subject, html });

    return res.json({ message: 'Payment OTP sent successfully' });
  } catch (error) {
    console.error('OTP generation error:', error);
    return res.status(500).json({ message: 'Server error generating OTP' });
  }
};

// @route POST /api/orders (customer checkout)
const createOrder = async (req, res) => {
  try {
    const { items, deliveryAddress, paymentMethod, paymentOtp } = req.body;

    if (!items || !items.length) {
      return res.status(400).json({ message: 'Order must contain at least one item' });
    }

    // --- OTP VERIFICATION FOR CARD PAYMENTS ---
    if (paymentMethod === 'card') {
      if (!paymentOtp) {
        return res.status(400).json({ message: 'OTP is required for card payments' });
      }
      const user = await User.findById(req.user._id);
      
      if (!user.paymentOtp || user.paymentOtp !== paymentOtp) {
        return res.status(400).json({ message: 'Invalid OTP. Please try again.' });
      }
      
      if (user.paymentOtpExpires < Date.now()) {
        return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
      }
      
      // OTP is valid - clear it so it can't be reused
      user.paymentOtp = undefined;
      user.paymentOtpExpires = undefined;
      await user.save();
    }
    // ------------------------------------------

    let itemsTotal = 0;
    const orderItems = [];

    for (const cartItem of items) {
      const product = await Product.findById(cartItem.product);
      if (!product || !product.isActive) {
        return res.status(400).json({ message: `Product not available: ${cartItem.product}` });
      }
      if (product.stockQuantity < cartItem.quantity) {
        return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
      }

      const subtotal = product.retailPrice * cartItem.quantity;
      itemsTotal += subtotal;

      orderItems.push({
        product: product._id,
        name: product.name,
        quantity: cartItem.quantity,
        unitPrice: product.retailPrice,
        subtotal,
      });

      product.stockQuantity -= cartItem.quantity;
      await product.save();
    }

    const distanceKm = haversineDistanceKm(SHOP_LOCATION, deliveryAddress);
    const deliveryFee = distanceKm ? Math.max(150, Math.round(distanceKm * 40)) : 200;
    const estimatedMinutes = distanceKm ? Math.round(15 + distanceKm * 3) : 45;

    const paymentStatus =
      process.env.MOCK_PAYMENTS === 'true' && paymentMethod !== 'cod' && paymentMethod !== 'bank_transfer' ? 'paid' : 'pending';

    const qrCodeToken = crypto.randomBytes(16).toString('hex');

    const order = await Order.create({
      customer: req.user._id,
      items: orderItems,
      itemsTotal,
      deliveryFee,
      totalAmount: itemsTotal + deliveryFee,
      deliveryAddress,
      paymentMethod: paymentMethod || 'cod',
      paymentStatus,
      status: 'pending', // Starts at pending for the new timeline
      statusHistory: [{ status: 'pending', note: 'Order placed by customer' }],
      estimatedDeliveryTime: new Date(Date.now() + estimatedMinutes * 60 * 1000),
      deliveryDistanceKm: distanceKm || 0,
      deliveryEstimatedMins: estimatedMinutes,
      qrCodeToken
    });

    await Notification.create({
      user: req.user._id,
      title: 'Order Confirmed',
      message: `Your order ${order.orderNumber} has been placed successfully.`,
      type: 'order_update',
      relatedOrder: order._id,
    });

    // Populate order for invoice generation
    const populatedOrder = await Order.findById(order._id).populate('customer', 'name email phone');
    
    // Generate Invoice PDF
    let invoicePath = null;
    try {
      invoicePath = await invoiceService.generateInvoice(populatedOrder);
      order.invoiceUrl = `/invoices/invoice_${order.orderNumber}.pdf`;
      await order.save();
    } catch (err) {
      console.error('Invoice generation failed:', err);
    }

    // Send rich branded order confirmation email
    try {
      const { subject, html } = templates.orderConfirmation(req.user.name, {
        orderNumber: order.orderNumber,
        items: order.items,
        itemsTotal: order.itemsTotal,
        deliveryFee: order.deliveryFee,
        totalAmount: order.totalAmount,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        deliveryAddress: order.deliveryAddress,
        estimatedDeliveryTime: order.estimatedDeliveryTime,
        createdAt: order.createdAt,
      });

      const attachments = invoicePath
        ? [{ filename: `Invoice_${order.orderNumber}.pdf`, path: invoicePath }]
        : [];

      await sendEmail({ to: req.user.email, subject, html, attachments });
      console.log(`✉️  Order confirmation email sent to ${req.user.email} for order ${order.orderNumber}`);
    } catch (emailErr) {
      console.error('Failed to send order confirmation email:', emailErr.message);
      // Don't fail the order if email fails
    }

    if (invoicePath) {
      order.invoiceSentAt = new Date();
      await order.save();
    }

    return res.status(201).json({ order });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error creating order', error: error.message });
  }
};

// @route GET /api/orders/my (customer)
const getMyOrders = async (req, res) => {
  const orders = await Order.find({ customer: req.user._id }).sort({ createdAt: -1 });
  return res.json({ orders });
};

// @route GET /api/orders/:id
const getOrderById = async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('customer', 'name email phone')
    .populate('driver', 'name phone vehicleNumber');

  if (!order) return res.status(404).json({ message: 'Order not found' });

  const isOwner = order.customer._id.toString() === req.user._id.toString();
  const isStaffOrAbove = ['staff', 'admin'].includes(req.user.role);
  const isAssignedDriver = order.driver && order.driver._id.toString() === req.user._id.toString();

  if (!isOwner && !isStaffOrAbove && !isAssignedDriver) {
    return res.status(403).json({ message: 'Not authorized to view this order' });
  }

  return res.json({ order });
};

// @route GET /api/orders (staff/admin - all orders)
const getAllOrders = async (req, res) => {
  const { status } = req.query;
  const filter = status ? { status } : {};
  const orders = await Order.find(filter)
    .populate('customer', 'name email phone')
    .populate('driver', 'name vehicleNumber')
    .sort({ createdAt: -1 });
  return res.json({ orders });
};

// @route PATCH /api/orders/:id/status (staff/admin/driver)
const updateOrderStatus = async (req, res) => {
  try {
    const { status, note } = req.body;
    const validStatuses = ['pending', 'processing', 'packed', 'out_for_delivery', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.status = status;
    order.statusHistory.push({ status, note });
    if (status === 'delivered') order.deliveredAt = new Date();
    await order.save();

    const statusLabels = {
      processing: 'Order Processing',
      packed: 'Order Packed',
      out_for_delivery: 'Out for Delivery',
      delivered: 'Delivered',
      cancelled: 'Order Cancelled',
    };

    await Notification.create({
      user: order.customer,
      title: statusLabels[status] || 'Order Update',
      message: `Your order ${order.orderNumber} status: ${statusLabels[status] || status}.`,
      type: 'order_update',
      relatedOrder: order._id,
    });

    // Send email for key status transitions
    const populated = await Order.findById(order._id).populate('customer', 'name email');
    if (populated?.customer?.email) {
      const emailTemplates = {
        out_for_delivery: {
          subject: `Your order ${order.orderNumber} is out for delivery! 🚚`,
          body: `<p style="color:#4b5563;">Great news! Your order <strong>${order.orderNumber}</strong> has been picked up by our driver and is on its way to you.</p><p style="color:#4b5563;">Please be available to receive your delivery. Our driver will contact you if needed.</p>`,
        },
        delivered: {
          subject: `Order ${order.orderNumber} delivered successfully! ✅`,
          body: `<p style="color:#4b5563;">Your order <strong>${order.orderNumber}</strong> has been delivered successfully. We hope you enjoy your fresh produce!</p><p style="color:#4b5563;">Thank you for choosing KBR Fresh Foods. 🌿</p>`,
        },
        cancelled: {
          subject: `Order ${order.orderNumber} has been cancelled`,
          body: `<p style="color:#4b5563;">We're sorry to let you know that your order <strong>${order.orderNumber}</strong> has been cancelled${note ? `: ${note}` : '.'}.</p><p style="color:#4b5563;">If you have any questions, please contact us at +94 77 977 9316.</p>`,
        },
      };

      const template = emailTemplates[status];
      if (template) {
        await emailService.sendEmail(
          populated.customer.email,
          template.subject,
          '',
          `
            <div style="font-family:sans-serif;max-width:600px;margin:auto;background:#f9fafb;border-radius:12px;overflow:hidden;">
              <div style="background:#16a34a;padding:24px 32px;">
                <h1 style="color:white;margin:0;font-size:22px;">🌿 KBR Fresh Foods</h1>
              </div>
              <div style="padding:32px;">
                <h2 style="color:#15803d;margin-top:0;">Hi ${populated.customer.name}!</h2>
                ${template.body}
                <p style="color:#4b5563;font-size:14px;margin-top:32px;padding-top:16px;border-top:1px solid #e5e7eb;">Order #: <strong>${order.orderNumber}</strong></p>
              </div>
            </div>
          `
        );
      }
    }

    return res.json({ order });
  } catch (error) {
    return res.status(500).json({ message: 'Error updating order status', error: error.message });
  }
};

// @route PATCH /api/orders/:id/assign-driver (staff/admin)
const assignDriver = async (req, res) => {
  try {
    const { driverId } = req.body;
    const driver = await User.findOne({ _id: driverId, role: 'driver' });
    if (!driver) return res.status(404).json({ message: 'Driver not found' });

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.driver = driver._id;
    order.statusHistory.push({ status: order.status, note: `Assigned to driver ${driver.name}` });
    await order.save();

    return res.json({ order });
  } catch (error) {
    return res.status(500).json({ message: 'Error assigning driver', error: error.message });
  }
};

// @route POST /api/orders/:id/verify-qr (driver)
const verifyQrCode = async (req, res) => {
  try {
    const { token } = req.body;
    const order = await Order.findById(req.params.id);
    
    if (!order) return res.status(404).json({ message: 'Order not found' });
    
    if (order.status === 'delivered') {
      return res.status(400).json({ message: 'Order is already delivered' });
    }

    if (order.qrCodeToken !== token) {
      return res.status(400).json({ message: 'Invalid QR Code' });
    }

    order.status = 'delivered';
    order.statusHistory.push({ status: 'delivered', note: 'Verified by QR Code scan' });
    order.deliveredAt = new Date();
    await order.save();

    await Notification.create({
      user: order.customer,
      title: 'Order Delivered Successfully! ✅',
      message: `Your order ${order.orderNumber} was securely delivered and verified via QR code.`,
      type: 'order_update',
      relatedOrder: order._id,
    });

    const populated = await Order.findById(order._id).populate('customer', 'name email');
    if (populated?.customer?.email) {
      await emailService.sendEmail(
        populated.customer.email,
        `Order ${order.orderNumber} delivered successfully! ✅`,
        '',
        `
          <div style="font-family:sans-serif;max-width:600px;margin:auto;background:#f9fafb;border-radius:12px;overflow:hidden;">
            <div style="background:#16a34a;padding:24px 32px;">
              <h1 style="color:white;margin:0;font-size:22px;">🌿 KBR Fresh Foods</h1>
            </div>
            <div style="padding:32px;">
              <h2 style="color:#15803d;margin-top:0;">Hi ${populated.customer.name}!</h2>
              <p style="color:#4b5563;">Your order <strong>${order.orderNumber}</strong> has been delivered and securely verified via QR code.</p>
              <p style="color:#4b5563;">Thank you for choosing KBR Fresh Foods. 🌿</p>
            </div>
          </div>
        `
      );
    }

    return res.json({ success: true, order });
  } catch (error) {
    return res.status(500).json({ message: 'Error verifying QR code', error: error.message });
  }
};

// @route GET /api/orders/drivers/available (staff/admin)
const getAvailableDrivers = async (req, res) => {
  const drivers = await User.find({ role: 'driver', isActive: true, isAvailable: true }).select(
    'name phone vehicleNumber'
  );
  return res.json({ drivers });
};

// @route GET /api/orders/driver/my (driver's assigned deliveries)
const getMyDeliveries = async (req, res) => {
  const orders = await Order.find({ driver: req.user._id, status: { $ne: 'delivered' } })
    .populate('customer', 'name phone')
    .sort({ createdAt: -1 });
  return res.json({ orders });
};

// @route PATCH /api/orders/:id/cancel (customer — pending orders only)
const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const isOwner = order.customer.toString() === req.user._id.toString();
    if (!isOwner) return res.status(403).json({ message: 'Not authorized to cancel this order' });

    if (order.status !== 'pending') {
      return res.status(400).json({ message: `Cannot cancel an order that is already '${order.status}'. Only pending orders can be cancelled.` });
    }

    // Restore stock for each item
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, { $inc: { stockQuantity: item.quantity } });
    }

    order.status = 'cancelled';
    order.statusHistory.push({ status: 'cancelled', note: req.body.reason || 'Cancelled by customer' });
    await order.save();

    await Notification.create({
      user: req.user._id,
      title: 'Order Cancelled',
      message: `Your order ${order.orderNumber} has been cancelled. Stock has been restored.`,
      type: 'order_update',
      relatedOrder: order._id,
    });

    // Send cancellation email
    try {
      const populated = await Order.findById(order._id).populate('customer', 'name email');
      if (populated?.customer?.email) {
        await emailService.sendEmail(
          populated.customer.email,
          `Order ${order.orderNumber} Cancelled`,
          '',
          `
            <div style="font-family:sans-serif;max-width:600px;margin:auto;background:#f9fafb;border-radius:12px;overflow:hidden;">
              <div style="background:#16a34a;padding:24px 32px;">
                <h1 style="color:white;margin:0;font-size:22px;">🌿 KBR Fresh Foods</h1>
              </div>
              <div style="padding:32px;">
                <h2 style="color:#15803d;margin-top:0;">Hi ${populated.customer.name}!</h2>
                <p style="color:#4b5563;">Your order <strong>${order.orderNumber}</strong> has been cancelled as requested.</p>
                <p style="color:#4b5563;">If you had already paid, a refund will be processed within 3–5 business days.</p>
                <p style="color:#4b5563;">Questions? Contact us at +94 77 977 9316.</p>
              </div>
            </div>
          `
        );
      }
    } catch (emailErr) {
      console.error('Cancel email failed:', emailErr.message);
    }

    return res.json({ order, message: 'Order cancelled successfully.' });
  } catch (error) {
    return res.status(500).json({ message: 'Error cancelling order', error: error.message });
  }
};

// @route PATCH /api/orders/:id/payment-status (staff/admin — update payment status)
const updatePaymentStatus = async (req, res) => {
  try {
    const { paymentStatus, paymentReference } = req.body;
    const validStatuses = ['pending', 'paid', 'failed', 'refunded'];
    if (!validStatuses.includes(paymentStatus)) {
      return res.status(400).json({ message: 'Invalid payment status' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.paymentStatus = paymentStatus;
    if (paymentReference) order.paymentReference = paymentReference;
    if (paymentStatus === 'paid') {
      order.statusHistory.push({ status: order.status, note: `Payment marked as paid${paymentReference ? ` (ref: ${paymentReference})` : ''} by ${req.user.name}` });
    }
    await order.save();

    // Notify customer of payment confirmation
    await Notification.create({
      user: order.customer,
      title: 'Payment Confirmed',
      message: `Payment for your order ${order.orderNumber} has been confirmed.`,
      type: 'order_update',
      relatedOrder: order._id,
    });

    return res.json({ order });
  } catch (error) {
    return res.status(500).json({ message: 'Error updating payment status', error: error.message });
  }
};

// @route GET /api/orders/:id/invoice (customer/staff/admin)
const getOrderInvoice = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('customer', 'name email phone');
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const isOwner = order.customer._id.toString() === req.user._id.toString();
    const isStaffOrAbove = ['staff', 'admin'].includes(req.user.role);
    if (!isOwner && !isStaffOrAbove) {
      return res.status(403).json({ message: 'Not authorized to access this invoice' });
    }

    // Check if a pre-generated invoice exists
    const path = require('path');
    const fs = require('fs');
    const invoiceDir = path.join(__dirname, '..', 'public', 'invoices');
    const invoiceFilename = `invoice_${order.orderNumber}.pdf`;
    const invoicePath = path.join(invoiceDir, invoiceFilename);

    if (fs.existsSync(invoicePath)) {
      return res.download(invoicePath, `Invoice_${order.orderNumber}.pdf`);
    }

    // Generate on-demand
    const invoiceService = require('../services/invoiceService');
    let generatedPath = null;
    try {
      generatedPath = await invoiceService.generateInvoice(order);
    } catch (err) {
      console.error('Invoice generation failed:', err);
    }

    if (generatedPath && fs.existsSync(generatedPath)) {
      return res.download(generatedPath, `Invoice_${order.orderNumber}.pdf`);
    }

    // Fallback: return order data for client-side PDF generation
    return res.json({
      order: {
        orderNumber: order.orderNumber,
        customer: order.customer,
        items: order.items,
        itemsTotal: order.itemsTotal,
        deliveryFee: order.deliveryFee,
        totalAmount: order.totalAmount,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        deliveryAddress: order.deliveryAddress,
        createdAt: order.createdAt,
        status: order.status,
      },
      message: 'Invoice data returned for client-side generation',
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching invoice', error: error.message });
  }
};

module.exports = {
  requestPaymentOtp,
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  assignDriver,
  verifyQrCode,
  getAvailableDrivers,
  getMyDeliveries,
  cancelOrder,
  updatePaymentStatus,
  getOrderInvoice,
  SHOP_LOCATION,
};
