const Purchase = require('../models/Purchase');
const Product = require('../models/Product');

// Get all purchases
exports.getPurchases = async (req, res) => {
  try {
    const purchases = await Purchase.find().sort('-purchaseDate');
    res.json({ success: true, count: purchases.length, purchases });
  } catch (error) {
    console.error('Error fetching purchases:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Create a new purchase
exports.createPurchase = async (req, res) => {
  try {
    const purchase = await Purchase.create(req.body);
    
    // Automatically add to inventory if received and not yet added
    if (purchase.status === 'Received' && !purchase.stockAdded && purchase.items && purchase.items.length > 0) {
      for (const item of purchase.items) {
        if (item.product) {
          await Product.findByIdAndUpdate(item.product, {
            $inc: { stockQuantity: item.quantity }
          });
        }
      }
      purchase.stockAdded = true;
      await purchase.save();
    }

    res.status(201).json({ success: true, purchase });
  } catch (error) {
    console.error('Error creating purchase:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// Get single purchase
exports.getPurchase = async (req, res) => {
  try {
    const purchase = await Purchase.findById(req.params.id);
    if (!purchase) {
      return res.status(404).json({ success: false, message: 'Purchase not found' });
    }
    res.json({ success: true, purchase });
  } catch (error) {
    console.error('Error fetching purchase:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Update purchase
exports.updatePurchase = async (req, res) => {
  try {
    const purchase = await Purchase.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!purchase) {
      return res.status(404).json({ success: false, message: 'Purchase not found' });
    }

    // Automatically add to inventory if received and not yet added
    if (purchase.status === 'Received' && !purchase.stockAdded && purchase.items && purchase.items.length > 0) {
      for (const item of purchase.items) {
        if (item.product) {
          await Product.findByIdAndUpdate(item.product, {
            $inc: { stockQuantity: item.quantity }
          });
        }
      }
      purchase.stockAdded = true;
      await purchase.save();
    }

    res.json({ success: true, purchase });
  } catch (error) {
    console.error('Error updating purchase:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// Delete purchase
exports.deletePurchase = async (req, res) => {
  try {
    const purchase = await Purchase.findByIdAndDelete(req.params.id);
    if (!purchase) {
      return res.status(404).json({ success: false, message: 'Purchase not found' });
    }
    res.json({ success: true, data: {} });
  } catch (error) {
    console.error('Error deleting purchase:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
