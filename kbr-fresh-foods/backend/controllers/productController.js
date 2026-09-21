const Product = require('../models/Product');
const Notification = require('../models/Notification');
const User = require('../models/User');

// @route GET /api/products  (public - customers browse)
const getProducts = async (req, res) => {
  try {
    const { category, search, page = 1, limit = 20 } = req.query;
    const filter = { isActive: true };

    if (category) filter.category = category;
    if (search) filter.name = { $regex: search, $options: 'i' };

    const products = await Product.find(filter)
      .populate('category', 'name type')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Product.countDocuments(filter);

    return res.json({ products, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching products', error: error.message });
  }
};

// @route GET /api/products/:id
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('category', 'name type');
    if (!product) return res.status(404).json({ message: 'Product not found' });
    return res.json({ product });
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching product', error: error.message });
  }
};

// @route POST /api/products (staff/admin)
const createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);
    return res.status(201).json({ product });
  } catch (error) {
    return res.status(400).json({ message: 'Error creating product', error: error.message });
  }
};

// @route PUT /api/products/:id (staff/admin)
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!product) return res.status(404).json({ message: 'Product not found' });

    // Trigger a low-stock alert to admins/staff if the update pushed stock below the threshold
    if (product.stockQuantity <= product.lowStockThreshold) {
      await notifyStaffAndAdmins(
        'low_stock',
        'Low Stock Alert',
        `${product.name} is running low: ${product.stockQuantity}${product.unit} remaining (threshold ${product.lowStockThreshold}${product.unit}).`
      );
    }

    return res.json({ product });
  } catch (error) {
    return res.status(400).json({ message: 'Error updating product', error: error.message });
  }
};

// @route DELETE /api/products/:id (admin)
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    return res.json({ message: 'Product deactivated', product });
  } catch (error) {
    return res.status(500).json({ message: 'Error deleting product', error: error.message });
  }
};

// @route GET /api/products/alerts/low-stock (staff/admin)
const getLowStockAlerts = async (req, res) => {
  try {
    const products = await Product.find({ isActive: true }).populate('category', 'name');
    const lowStock = products.filter((p) => p.stockQuantity <= p.lowStockThreshold);
    return res.json({ products: lowStock, count: lowStock.length });
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching low stock alerts', error: error.message });
  }
};

// @route GET /api/products/alerts/expiring (staff/admin)
const getExpiringAlerts = async (req, res) => {
  try {
    const twoDaysFromNow = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
    const products = await Product.find({
      isActive: true,
      isPerishable: true,
      expiryDate: { $ne: null, $lte: twoDaysFromNow },
    }).populate('category', 'name');

    return res.json({ products, count: products.length });
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching expiry alerts', error: error.message });
  }
};

async function notifyStaffAndAdmins(type, title, message) {
  const staffAndAdmins = await User.find({ role: { $in: ['staff', 'admin'] }, isActive: true });
  const notifications = staffAndAdmins.map((u) => ({
    user: u._id,
    title,
    message,
    type,
  }));
  if (notifications.length) await Notification.insertMany(notifications);
}

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getLowStockAlerts,
  getExpiringAlerts,
  notifyStaffAndAdmins,
};
