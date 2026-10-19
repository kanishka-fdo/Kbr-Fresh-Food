const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    type: {
      type: String,
      enum: ['fruit', 'vegetable', 'dairy', 'grain', 'spice', 'bakery', 'beverage', 'seafood', 'other'],
      default: 'other',
    },
    description: String,
    image: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Category', categorySchema);
