const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    itemCode: { type: String, trim: true },
    name: { type: String, required: true, trim: true },
    brand: { type: String, trim: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    description: String,
    images: [String],

    unit: {
      type: String,
      enum: ['kg', 'g', 'unit', 'bunch', 'crate', 'l', 'ml', 'pack', 'dozen', 'pieces'],
      default: 'kg',
    },
    stockQuantity: { type: Number, required: true, default: 0 },
    minimumQty: { type: Number, default: 0 },
    lowStockThreshold: { type: Number, default: 10 },

    purchasePrice: { type: Number, default: 0 },
    retailPrice: { type: Number, required: true },
    wholesalePrice: { type: Number, required: true },
    tax: { type: Number, default: 0 },
    minWholesaleQty: { type: Number, default: 20 },

    supplierName: { type: String },
    supplierRef: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier' },

    // Freshness tracking
    harvestDate: { type: Date },
    arrivalDate: { type: Date },
    expiryDate: { type: Date },
    storageTemp: { type: Number }, // in Celsius
    warehouseZone: { type: String, default: 'General' }, // e.g. 'Cold Room A', 'Shelf B'
    batchNumber: { type: String, trim: true },

    isPerishable: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true },
    status: { type: String, default: 'Active' },
  },
  { timestamps: true }
);

// Virtual: isLowStock
productSchema.virtual('isLowStock').get(function () {
  return this.stockQuantity <= this.lowStockThreshold;
});

// Virtual: isExpiringSoon (within 3 days)
productSchema.virtual('isExpiringSoon').get(function () {
  if (!this.expiryDate) return false;
  const threeDaysMs = 3 * 24 * 60 * 60 * 1000;
  return this.expiryDate.getTime() - Date.now() <= threeDaysMs;
});

// Virtual: freshnessScore (0–100%)
productSchema.virtual('freshnessScore').get(function () {
  if (!this.expiryDate) return null;
  const now = Date.now();
  const arrival = this.arrivalDate ? this.arrivalDate.getTime() : (this.createdAt ? this.createdAt.getTime() : now);
  const expiry = this.expiryDate.getTime();
  if (expiry <= arrival) return 0;
  const totalLife = expiry - arrival;
  const remaining = expiry - now;
  const score = Math.max(0, Math.min(100, Math.round((remaining / totalLife) * 100)));
  return score;
});

// Virtual: dynamicPrice suggestion
productSchema.virtual('suggestedPrice').get(function () {
  if (!this.freshnessScore) return this.retailPrice;
  const score = this.freshnessScore;
  if (score > 70) return this.retailPrice;
  if (score > 40) return Math.round(this.retailPrice * 0.85);
  if (score > 20) return Math.round(this.retailPrice * 0.70);
  return Math.round(this.retailPrice * 0.55);
});

productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Product', productSchema);
