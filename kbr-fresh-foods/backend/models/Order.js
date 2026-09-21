const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: String, // snapshot at order time
    quantity: { type: Number, required: true },
    unitPrice: { type: Number, required: true },
    subtotal: { type: Number, required: true },
  },
  { _id: false }
);

const statusHistorySchema = new mongoose.Schema(
  {
    status: String,
    changedAt: { type: Date, default: Date.now },
    note: String,
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, required: true, unique: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    items: [orderItemSchema],
    itemsTotal: { type: Number, required: true },
    deliveryFee: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },

    deliveryAddress: {
      line1: String,
      line2: String,
      city: { type: String, default: 'Negombo' },
      lat: Number,
      lng: Number,
    },

    status: {
      type: String,
      enum: ['pending', 'processing', 'packed', 'out_for_delivery', 'delivered', 'cancelled'],
      default: 'pending',
    },
    statusHistory: [statusHistorySchema],

    paymentMethod: { type: String, enum: ['card', 'cod', 'qr', 'bank_transfer'], default: 'card' },
    paymentStatus: { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },
    paymentReference: String,

    driver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    estimatedDeliveryTime: Date,
    deliveredAt: Date,

    // Epic 3 new fields
    deliveryDistanceKm: { type: Number, default: 0 },
    deliveryEstimatedMins: { type: Number, default: 0 },
    qrCodeToken: { type: String },
    invoiceUrl: { type: String },
    invoiceSentAt: Date,

    notes: String,
  },
  { timestamps: true }
);

orderSchema.pre('validate', function (next) {
  if (!this.orderNumber) {
    this.orderNumber = 'KBR-' + Date.now().toString(36).toUpperCase() + '-' + Math.floor(Math.random() * 1000);
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);
