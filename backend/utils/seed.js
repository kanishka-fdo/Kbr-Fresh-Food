require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Category = require('../models/Category');
const Product = require('../models/Product');

const days = (n) => new Date(Date.now() + n * 24 * 60 * 60 * 1000);

const run = async () => {
  await connectDB();

  console.log('Clearing existing data...');
  await Promise.all([User.deleteMany({}), Category.deleteMany({}), Product.deleteMany({})]);

  console.log('Creating users...');
  await User.create({
    name: 'Kanishka Fernando',
    email: 'admin@kbrfreshfoods.lk',
    password: 'Admin@123',
    role: 'admin',
    isEmailVerified: true,
  });

  await User.create({
    name: 'Nimal Perera',
    email: 'staff@kbrfreshfoods.lk',
    password: 'Staff@123',
    role: 'staff',
    isEmailVerified: true,
  });

  await User.create({
    name: 'Sunil Silva',
    email: 'driver@kbrfreshfoods.lk',
    password: 'Driver@123',
    role: 'driver',
    vehicleNumber: 'NB-4521',
    isEmailVerified: true,
  });

  await User.create({
    name: 'Amaya Jayasinghe',
    email: 'customer@example.com',
    password: 'Customer@123',
    role: 'customer',
    isEmailVerified: true,
    addresses: [
      { label: 'Home', line1: '45 Lewis Place', city: 'Negombo', lat: 7.2094, lng: 79.8402, isDefault: true },
    ],
  });

  await User.create({
    name: 'Keells Super - Negombo Branch',
    email: 'procurement@keells-demo.lk',
    password: 'Keells@123',
    role: 'wholesale',
    businessName: 'Keells Super',
    businessRegNo: 'PV-00123456',
    wholesaleApproved: true,
    isEmailVerified: true,
  });

  console.log('Creating categories...');
  const [fruits, vegetables, dairy, grains, spices, bakery, beverages, seafood] = await Category.insertMany([
    { name: 'Fruits', type: 'fruit', description: 'Fresh seasonal fruits' },
    { name: 'Vegetables', type: 'vegetable', description: 'Fresh vegetables' },
    { name: 'Dairy & Eggs', type: 'dairy', description: 'Milk, cheese, yogurt & eggs' },
    { name: 'Rice & Grains', type: 'grain', description: 'Rice, flour, lentils & cereals' },
    { name: 'Spices & Herbs', type: 'spice', description: 'Local spices and fresh herbs' },
    { name: 'Bakery', type: 'bakery', description: 'Fresh baked bread and pastries' },
    { name: 'Beverages', type: 'beverage', description: 'Juices, tea, coffee and water' },
    { name: 'Seafood', type: 'seafood', description: 'Fresh local seafood' },
  ]);

  console.log('Creating products...');
  await Product.insertMany([
    // --- Fruits ---
    { name: 'Bananas (Kolikuttu)', category: fruits._id, unit: 'kg', stockQuantity: 8, lowStockThreshold: 10, retailPrice: 320, wholesalePrice: 250, minWholesaleQty: 20, supplierName: 'Gampaha Fruit Collective', expiryDate: days(1), isPerishable: true },
    { name: 'Papaya', category: fruits._id, unit: 'kg', stockQuantity: 40, lowStockThreshold: 10, retailPrice: 280, wholesalePrice: 210, minWholesaleQty: 20, supplierName: 'Negombo Farms', expiryDate: days(5), isPerishable: true },
    { name: 'King Coconut', category: fruits._id, unit: 'unit', stockQuantity: 150, lowStockThreshold: 30, retailPrice: 100, wholesalePrice: 75, minWholesaleQty: 50, supplierName: 'Local Estate', isPerishable: false },
    { name: 'Mango (Karutha Colomban)', category: fruits._id, unit: 'kg', stockQuantity: 25, lowStockThreshold: 10, retailPrice: 450, wholesalePrice: 360, minWholesaleQty: 15, supplierName: 'Anuradhapura Orchards', expiryDate: days(4), isPerishable: true },
    { name: 'Pineapple', category: fruits._id, unit: 'unit', stockQuantity: 30, lowStockThreshold: 8, retailPrice: 220, wholesalePrice: 170, minWholesaleQty: 15, supplierName: 'Gampaha Fruit Collective', expiryDate: days(6), isPerishable: true },
    { name: 'Watermelon', category: fruits._id, unit: 'kg', stockQuantity: 60, lowStockThreshold: 15, retailPrice: 150, wholesalePrice: 110, minWholesaleQty: 30, supplierName: 'Negombo Farms', expiryDate: days(7), isPerishable: true },
    { name: 'Rambutan', category: fruits._id, unit: 'kg', stockQuantity: 6, lowStockThreshold: 10, retailPrice: 500, wholesalePrice: 400, minWholesaleQty: 15, supplierName: 'Kegalle Growers', expiryDate: days(2), isPerishable: true },
    { name: 'Avocado', category: fruits._id, unit: 'kg', stockQuantity: 18, lowStockThreshold: 8, retailPrice: 550, wholesalePrice: 440, minWholesaleQty: 10, supplierName: 'Kandy Hill Farms', expiryDate: days(5), isPerishable: true },

    // --- Vegetables ---
    { name: 'Carrots', category: vegetables._id, unit: 'kg', stockQuantity: 60, lowStockThreshold: 15, retailPrice: 260, wholesalePrice: 200, minWholesaleQty: 25, supplierName: 'Nuwara Eliya Growers', expiryDate: days(7), isPerishable: true },
    { name: 'Tomatoes', category: vegetables._id, unit: 'kg', stockQuantity: 5, lowStockThreshold: 10, retailPrice: 300, wholesalePrice: 230, minWholesaleQty: 20, supplierName: 'Dambulla Economic Centre', expiryDate: days(2), isPerishable: true },
    { name: 'Cabbage', category: vegetables._id, unit: 'kg', stockQuantity: 35, lowStockThreshold: 10, retailPrice: 180, wholesalePrice: 130, minWholesaleQty: 25, supplierName: 'Nuwara Eliya Growers', expiryDate: days(6), isPerishable: true },
    { name: 'Potatoes', category: vegetables._id, unit: 'kg', stockQuantity: 80, lowStockThreshold: 20, retailPrice: 220, wholesalePrice: 170, minWholesaleQty: 30, supplierName: 'Badulla Suppliers', expiryDate: days(14), isPerishable: true },
    { name: 'Red Onions', category: vegetables._id, unit: 'kg', stockQuantity: 70, lowStockThreshold: 20, retailPrice: 320, wholesalePrice: 260, minWholesaleQty: 25, supplierName: 'Jaffna Onion Traders', expiryDate: days(20), isPerishable: true },
    { name: 'Garlic', category: vegetables._id, unit: 'kg', stockQuantity: 22, lowStockThreshold: 8, retailPrice: 900, wholesalePrice: 750, minWholesaleQty: 10, supplierName: 'Dambulla Economic Centre', expiryDate: days(25), isPerishable: true },
    { name: 'Pumpkin', category: vegetables._id, unit: 'kg', stockQuantity: 40, lowStockThreshold: 10, retailPrice: 140, wholesalePrice: 100, minWholesaleQty: 25, supplierName: 'Negombo Farms', expiryDate: days(10), isPerishable: true },
    { name: 'Brinjal (Eggplant)', category: vegetables._id, unit: 'kg', stockQuantity: 28, lowStockThreshold: 10, retailPrice: 210, wholesalePrice: 160, minWholesaleQty: 20, supplierName: 'Negombo Farms', expiryDate: days(4), isPerishable: true },
    { name: 'Green Beans', category: vegetables._id, unit: 'kg', stockQuantity: 9, lowStockThreshold: 10, retailPrice: 260, wholesalePrice: 200, minWholesaleQty: 20, supplierName: 'Nuwara Eliya Growers', expiryDate: days(3), isPerishable: true },
    { name: 'Cucumber', category: vegetables._id, unit: 'kg', stockQuantity: 45, lowStockThreshold: 12, retailPrice: 150, wholesalePrice: 110, minWholesaleQty: 20, supplierName: 'Negombo Farms', expiryDate: days(5), isPerishable: true },

    // --- Dairy & Eggs ---
    { name: 'Fresh Milk', category: dairy._id, unit: 'l', stockQuantity: 50, lowStockThreshold: 15, retailPrice: 380, wholesalePrice: 320, minWholesaleQty: 20, supplierName: 'Highland Dairy', expiryDate: days(4), isPerishable: true },
    { name: 'Curd', category: dairy._id, unit: 'unit', stockQuantity: 40, lowStockThreshold: 10, retailPrice: 220, wholesalePrice: 180, minWholesaleQty: 20, supplierName: 'Ambewela Farms', expiryDate: days(6), isPerishable: true },
    { name: 'Farm Eggs', category: dairy._id, unit: 'dozen', stockQuantity: 60, lowStockThreshold: 15, retailPrice: 480, wholesalePrice: 400, minWholesaleQty: 20, supplierName: 'Negombo Poultry', expiryDate: days(18), isPerishable: true },
    { name: 'Cheddar Cheese', category: dairy._id, unit: 'pack', stockQuantity: 25, lowStockThreshold: 8, retailPrice: 950, wholesalePrice: 800, minWholesaleQty: 10, supplierName: 'Highland Dairy', expiryDate: days(30), isPerishable: true },
    { name: 'Butter', category: dairy._id, unit: 'pack', stockQuantity: 30, lowStockThreshold: 10, retailPrice: 620, wholesalePrice: 520, minWholesaleQty: 15, supplierName: 'Highland Dairy', expiryDate: days(45), isPerishable: true },

    // --- Rice & Grains ---
    { name: 'Samba Rice', category: grains._id, unit: 'kg', stockQuantity: 200, lowStockThreshold: 40, retailPrice: 260, wholesalePrice: 210, minWholesaleQty: 50, supplierName: 'Polonnaruwa Millers', isPerishable: false },
    { name: 'Nadu Rice', category: grains._id, unit: 'kg', stockQuantity: 180, lowStockThreshold: 40, retailPrice: 230, wholesalePrice: 185, minWholesaleQty: 50, supplierName: 'Polonnaruwa Millers', isPerishable: false },
    { name: 'Red Rice', category: grains._id, unit: 'kg', stockQuantity: 90, lowStockThreshold: 20, retailPrice: 310, wholesalePrice: 260, minWholesaleQty: 30, supplierName: 'Kurunegala Traditional Mills', isPerishable: false },
    { name: 'Red Lentils (Dhal)', category: grains._id, unit: 'kg', stockQuantity: 75, lowStockThreshold: 20, retailPrice: 420, wholesalePrice: 350, minWholesaleQty: 25, supplierName: 'Imported - Wholesale Grain Co.', isPerishable: false },
    { name: 'Wheat Flour', category: grains._id, unit: 'kg', stockQuantity: 120, lowStockThreshold: 30, retailPrice: 280, wholesalePrice: 230, minWholesaleQty: 30, supplierName: 'Prima Mills', isPerishable: false },
    { name: 'Rolled Oats', category: grains._id, unit: 'pack', stockQuantity: 45, lowStockThreshold: 15, retailPrice: 650, wholesalePrice: 540, minWholesaleQty: 15, supplierName: 'Imported - Wholesale Grain Co.', isPerishable: false },

    // --- Spices & Herbs ---
    { name: 'Ceylon Cinnamon', category: spices._id, unit: 'pack', stockQuantity: 35, lowStockThreshold: 10, retailPrice: 550, wholesalePrice: 460, minWholesaleQty: 15, supplierName: 'Matara Spice Growers', isPerishable: false },
    { name: 'Black Pepper', category: spices._id, unit: 'pack', stockQuantity: 4, lowStockThreshold: 10, retailPrice: 480, wholesalePrice: 400, minWholesaleQty: 15, supplierName: 'Matale Spice Estate', isPerishable: false },
    { name: 'Turmeric Powder', category: spices._id, unit: 'pack', stockQuantity: 50, lowStockThreshold: 15, retailPrice: 320, wholesalePrice: 260, minWholesaleQty: 20, supplierName: 'Matale Spice Estate', isPerishable: false },
    { name: 'Fresh Ginger', category: spices._id, unit: 'kg', stockQuantity: 20, lowStockThreshold: 8, retailPrice: 640, wholesalePrice: 540, minWholesaleQty: 10, supplierName: 'Kandy Hill Farms', expiryDate: days(15), isPerishable: true },
    { name: 'Curry Leaves (Bunch)', category: spices._id, unit: 'bunch', stockQuantity: 60, lowStockThreshold: 15, retailPrice: 40, wholesalePrice: 25, minWholesaleQty: 40, supplierName: 'Negombo Farms', expiryDate: days(3), isPerishable: true },

    // --- Bakery ---
    { name: 'White Bread Loaf', category: bakery._id, unit: 'unit', stockQuantity: 40, lowStockThreshold: 15, retailPrice: 130, wholesalePrice: 100, minWholesaleQty: 30, supplierName: 'Negombo Bakers', expiryDate: days(3), isPerishable: true },
    { name: 'Whole Wheat Bread', category: bakery._id, unit: 'unit', stockQuantity: 25, lowStockThreshold: 10, retailPrice: 180, wholesalePrice: 140, minWholesaleQty: 20, supplierName: 'Negombo Bakers', expiryDate: days(3), isPerishable: true },
    { name: 'Butter Buns (Pack of 6)', category: bakery._id, unit: 'pack', stockQuantity: 30, lowStockThreshold: 10, retailPrice: 240, wholesalePrice: 190, minWholesaleQty: 20, supplierName: 'Negombo Bakers', expiryDate: days(2), isPerishable: true },

    // --- Beverages ---
    { name: 'Ceylon Black Tea (250g)', category: beverages._id, unit: 'pack', stockQuantity: 55, lowStockThreshold: 15, retailPrice: 420, wholesalePrice: 350, minWholesaleQty: 20, supplierName: 'Nuwara Eliya Tea Estate', isPerishable: false },
    { name: 'Fresh King Coconut Water (Bottled)', category: beverages._id, unit: 'l', stockQuantity: 30, lowStockThreshold: 10, retailPrice: 280, wholesalePrice: 220, minWholesaleQty: 20, supplierName: 'Local Estate', expiryDate: days(10), isPerishable: true },
    { name: 'Fresh Orange Juice (Bottled)', category: beverages._id, unit: 'l', stockQuantity: 20, lowStockThreshold: 8, retailPrice: 450, wholesalePrice: 380, minWholesaleQty: 15, supplierName: 'Negombo Farms', expiryDate: days(5), isPerishable: true },

    // --- Seafood ---
    { name: 'Fresh Tuna Steaks', category: seafood._id, unit: 'kg', stockQuantity: 15, lowStockThreshold: 8, retailPrice: 1450, wholesalePrice: 1250, minWholesaleQty: 10, supplierName: 'Negombo Fish Market', expiryDate: days(1), isPerishable: true },
    { name: 'Prawns (Medium)', category: seafood._id, unit: 'kg', stockQuantity: 3, lowStockThreshold: 8, retailPrice: 1800, wholesalePrice: 1550, minWholesaleQty: 8, supplierName: 'Negombo Fish Market', expiryDate: days(1), isPerishable: true },
    { name: 'Blue Crab', category: seafood._id, unit: 'kg', stockQuantity: 10, lowStockThreshold: 5, retailPrice: 2200, wholesalePrice: 1900, minWholesaleQty: 6, supplierName: 'Negombo Lagoon Fishers', expiryDate: days(1), isPerishable: true },
  ]);

  console.log('\nSeed complete! Demo accounts:');
  console.log('  Admin:    admin@kbrfreshfoods.lk / Admin@123');
  console.log('  Staff:    staff@kbrfreshfoods.lk / Staff@123');
  console.log('  Driver:   driver@kbrfreshfoods.lk / Driver@123');
  console.log('  Customer: customer@example.com / Customer@123');
  console.log('  Wholesale (Keells demo): procurement@keells-demo.lk / Keells@123');
  console.log('\n8 categories and 35 products created across the full catalog.');

  await mongoose.disconnect();
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
