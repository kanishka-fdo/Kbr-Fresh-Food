const Store = require('../models/Store');
const Product = require('../models/Product');

// Get all stores with populated inventory products
exports.getStores = async (req, res) => {
  try {
    const stores = await Store.find()
      .populate('inventory.product')
      .sort({ name: 1 });
    
    res.status(200).json({ success: true, count: stores.length, stores });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get a single store by ID
exports.getStore = async (req, res) => {
  try {
    const store = await Store.findById(req.params.id)
      .populate('inventory.product');
      
    if (!store) {
      return res.status(404).json({ success: false, message: 'Store not found' });
    }
    
    res.status(200).json({ success: true, store });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
