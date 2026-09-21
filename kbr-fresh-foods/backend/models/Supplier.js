const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema(
  {
    supplierId: { type: String, required: true, unique: true },
    name: { type: String, required: true, trim: true },
    mobile: { type: String, trim: true },
    email: { type: String, lowercase: true, trim: true },
    
    purchaseDue: { type: Number, default: 0 },
    purchaseReturnDue: { type: Number, default: 0 },
    
    status: { type: String, default: 'Active' },
    
    address: { type: String, trim: true }, // Optional field for future use
  },
  { timestamps: true }
);

module.exports = mongoose.model('Supplier', supplierSchema);
