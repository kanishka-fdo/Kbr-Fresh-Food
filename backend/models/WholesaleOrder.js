const mongoose = require('mongoose');

const wholesaleItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: String,
    quantity: { type: Number, required: true },
    unitPrice: { type: Number, required: true },
    subtotal: { type: Number, required: true },
  },
  { _id: false }
);

const transactionHistorySchema = new mongoose.Schema(
  {
    amount: { type: Number, required: true },
    reference: { type: String },
    method: { type: String, enum: ['cash', 'bank_transfer', 'cheque', 'card', 'other'], default: 'bank_transfer' },
    note: { type: String },
    recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    recordedAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const wholesaleOrderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, required: true, unique: true },
    buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // wholesale role user

    items: [wholesaleItemSchema],
    itemsTotal: { type: Number, required: true },

    status: {
      type: String,
      enum: ['quote_requested', 'quoted', 'approved', 'rejected', 'fulfilled', 'cancelled'],
      default: 'quote_requested',
    },

    // Payment tracking
    paymentStatus: {
      type: String,
      enum: ['unpaid', 'partial', 'paid'],
      default: 'unpaid',
    },
    paymentReference: { type: String },
    amountPaid: { type: Number, default: 0 },
    transactionHistory: [transactionHistorySchema],

    requestedDeliveryDate: Date,
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    approvedAt: Date,
    cancelledAt: Date,
    cancelledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    cancellationReason: { type: String },

    notes: String,
  },
  { timestamps: true }
);

wholesaleOrderSchema.pre('validate', function (next) {
  if (!this.orderNumber) {
    this.orderNumber = 'WS-' + Date.now().toString(36).toUpperCase() + '-' + Math.floor(Math.random() * 1000);
  }
  next();
});

module.exports = mongoose.model('WholesaleOrder', wholesaleOrderSchema);

