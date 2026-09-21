const mongoose = require('mongoose');

const storeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['Keells', 'Food City', 'KBR Retail'],
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    default: '',
  },
  openHours: {
    type: String,
    default: '7:00 AM – 9:00 PM',
  },
  description: {
    type: String,
    default: '',
  },
  imageUrl: {
    type: String,
    default: '',
  },
  location: {
    lat: {
      type: Number,
      required: true,
    },
    lng: {
      type: Number,
      required: true,
    }
  },
  inventory: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    stock: {
      type: Number,
      default: 0
    }
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Store', storeSchema);
