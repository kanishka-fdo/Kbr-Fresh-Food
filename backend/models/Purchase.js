const mongoose = require('mongoose');

const purchaseSchema = new mongoose.Schema(
  {
    purchaseDate: { type: Date, required: true },
    purchaseCode: { type: String, required: true, unique: true },
    referenceNo: { type: String, trim: true },
    supplierName: { type: String, required: true },

    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        name: String,
        quantity: Number,
        unitCost: Number,
        subtotal: Number
      }
    ],
    
    total: { type: Number, required: true, default: 0 },
    paidPayment: { type: Number, default: 0 },
    due: { type: Number, default: 0 },
    
    status: { type: String, default: 'Received' },
    paymentStatus: { type: String, default: 'Paid' },
    stockAdded: { type: Boolean, default: false }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Purchase', purchaseSchema);
