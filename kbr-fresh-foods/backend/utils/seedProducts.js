require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const Product = require('../models/Product');
const Category = require('../models/Category');

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('MONGO_URI is missing from .env');
  process.exit(1);
}

const initialCategories = [
  { name: 'Fresh Fruits', type: 'fruit', description: 'Farm fresh organic fruits' },
  { name: 'Vegetables', type: 'vegetable', description: 'Daily harvested vegetables' },
  { name: 'Dairy & Eggs', type: 'dairy', description: 'Fresh milk, cheese, and farm eggs' },
  { name: 'Grains & Pulses', type: 'grain', description: 'Premium rice, lentils, and oats' },
  { name: 'Spices', type: 'spice', description: 'Authentic Sri Lankan spices' },
  { name: 'Bakery', type: 'bakery', description: 'Fresh bread and baked goods' },
  { name: 'Beverages', type: 'beverage', description: 'Fresh juices and teas' },
  { name: 'Seafood', type: 'seafood', description: 'Fresh catch from Negombo lagoon' },
];

const seedProducts = [
  // Fruits
  { name: 'Organic Strawberries', catType: 'fruit', retail: 850, wholesale: 750, minQty: 10, unit: 'pack', stock: 50, images: ['https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&w=600&q=80'] },
  { name: 'Karthakolomban Mango', catType: 'fruit', retail: 450, wholesale: 380, minQty: 20, unit: 'kg', stock: 120, images: ['https://images.unsplash.com/photo-1591073113125-e46713c829ed?auto=format&fit=crop&w=600&q=80'] },
  { name: 'Kolikuttu Banana', catType: 'fruit', retail: 280, wholesale: 220, minQty: 15, unit: 'kg', stock: 200, images: ['https://images.unsplash.com/photo-1603833665858-e61d17a86224?auto=format&fit=crop&w=600&q=80'] },
  { name: 'Red Apple', catType: 'fruit', retail: 950, wholesale: 850, minQty: 10, unit: 'kg', stock: 80, images: ['https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?auto=format&fit=crop&w=600&q=80'] },
  
  // Vegetables
  { name: 'Carrots', catType: 'vegetable', retail: 320, wholesale: 260, minQty: 20, unit: 'kg', stock: 150, images: ['https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&w=600&q=80'] },
  { name: 'Tomatoes', catType: 'vegetable', retail: 450, wholesale: 380, minQty: 25, unit: 'kg', stock: 100, images: ['https://images.unsplash.com/photo-1546094096-0df4bcaaa337?auto=format&fit=crop&w=600&q=80'] },
  { name: 'Broccoli', catType: 'vegetable', retail: 1200, wholesale: 1000, minQty: 5, unit: 'kg', stock: 30, images: ['https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?auto=format&fit=crop&w=600&q=80'] },
  { name: 'Green Cabbage', catType: 'vegetable', retail: 280, wholesale: 220, minQty: 15, unit: 'kg', stock: 80, images: ['https://images.unsplash.com/photo-1600850997618-2b8ff3b17e11?auto=format&fit=crop&w=600&q=80'] },

  // Dairy
  { name: 'Fresh Cow Milk', catType: 'dairy', retail: 350, wholesale: 300, minQty: 20, unit: 'l', stock: 60, images: ['https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=600&q=80'] },
  { name: 'Farm Eggs', catType: 'dairy', retail: 600, wholesale: 540, minQty: 10, unit: 'dozen', stock: 100, images: ['https://images.unsplash.com/photo-1598965675045-45c5e72c7d05?auto=format&fit=crop&w=600&q=80'] },

  // Grains
  { name: 'Keeri Samba Rice', catType: 'grain', retail: 260, wholesale: 230, minQty: 50, unit: 'kg', stock: 500, images: ['https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?auto=format&fit=crop&w=600&q=80'] },
  { name: 'Red Lentils (Dhal)', catType: 'grain', retail: 380, wholesale: 330, minQty: 25, unit: 'kg', stock: 300, images: ['https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?auto=format&fit=crop&w=600&q=80'] },

  // Spices
  { name: 'Ceylon Cinnamon', catType: 'spice', retail: 4500, wholesale: 4000, minQty: 2, unit: 'kg', stock: 20, images: ['https://images.unsplash.com/photo-1498598457418-36ef20772bb9?auto=format&fit=crop&w=600&q=80'] },
  { name: 'Turmeric Powder', catType: 'spice', retail: 1200, wholesale: 1000, minQty: 5, unit: 'kg', stock: 40, images: ['https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=600&q=80'] },

  // Bakery
  { name: 'Whole Wheat Bread', catType: 'bakery', retail: 180, wholesale: 150, minQty: 20, unit: 'unit', stock: 40, images: ['https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80'] },
  
  // Beverages
  { name: 'King Coconut Water', catType: 'beverage', retail: 120, wholesale: 90, minQty: 50, unit: 'unit', stock: 200, images: ['https://images.unsplash.com/photo-1561051729-de4e0c09a8fd?auto=format&fit=crop&w=600&q=80'] },

  // Seafood
  { name: 'Fresh Tuna', catType: 'seafood', retail: 1800, wholesale: 1500, minQty: 10, unit: 'kg', stock: 40, images: ['https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=600&q=80'] },
  { name: 'Tiger Prawns', catType: 'seafood', retail: 2500, wholesale: 2200, minQty: 5, unit: 'kg', stock: 25, images: ['https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?auto=format&fit=crop&w=600&q=80'] },
];

async function runSeed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // 1. Create Categories if not exist
    console.log('Seeding Categories...');
    const catDocs = {};
    for (const cat of initialCategories) {
      let existing = await Category.findOne({ type: cat.type });
      if (!existing) {
        existing = await Category.create(cat);
      }
      catDocs[cat.type] = existing._id;
    }

    // 2. Clear old products & Seed new products
    console.log('Clearing old products...');
    await Product.deleteMany({});
    
    console.log(`Seeding ${seedProducts.length} Products...`);
    const formattedProducts = seedProducts.map(p => ({
      name: p.name,
      category: catDocs[p.catType],
      unit: p.unit,
      stockQuantity: p.stock,
      lowStockThreshold: 10,
      retailPrice: p.retail,
      wholesalePrice: p.wholesale,
      minWholesaleQty: p.minQty,
      images: p.images,
      supplierName: 'KBR Main Farm',
      isPerishable: true,
      expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    }));

    await Product.insertMany(formattedProducts);
    
    console.log('✅ Seeding Complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding Error:', error);
    process.exit(1);
  }
}

runSeed();
