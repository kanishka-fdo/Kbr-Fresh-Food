/**
 * reseedProducts.js
 * Clears all existing products and re-seeds with ONLY the uploaded KBR Fresh Foods
 * product list (IT0001–IT0036, excluding IT0009).
 * Run: node reseedProducts.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const Product = require('./models/Product');
const Category = require('./models/Category');

// ── Image URLs per product code ────────────────────────────────────────────────
const IMAGES = {
  // Bananas
  IT0001: 'https://images.unsplash.com/photo-1528825871115-3581a5387919?auto=format&fit=crop&w=500&q=80',
  IT0002: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=500&q=80',
  IT0003: 'https://images.unsplash.com/photo-1528825871115-3581a5387919?auto=format&fit=crop&w=500&q=80',
  IT0004: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=500&q=80',
  IT0005: 'https://images.unsplash.com/photo-1528825871115-3581a5387919?auto=format&fit=crop&w=500&q=80',
  IT0006: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ae/Red_bananas.jpg/800px-Red_bananas.jpg',
  IT0007: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=500&q=80',
  IT0008: 'https://images.unsplash.com/photo-1528825871115-3581a5387919?auto=format&fit=crop&w=500&q=80',
  IT0015: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f7/Green_bananas_2.jpg/800px-Green_bananas_2.jpg',
  IT0018: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=500&q=80',
  IT0035: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=500&q=80',
  IT0036: 'https://images.unsplash.com/photo-1528825871115-3581a5387919?auto=format&fit=crop&w=500&q=80',

  // Fruits
  IT0011: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/28/Cantaloupe_and_cross_section.jpg/800px-Cantaloupe_and_cross_section.jpg',
  IT0012: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/28/Cantaloupe_and_cross_section.jpg/800px-Cantaloupe_and_cross_section.jpg',
  IT0016: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Mango_and_cross_section_edit.jpg/800px-Mango_and_cross_section_edit.jpg',
  IT0017: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Soursop%2C_Annona_muricata.jpg/800px-Soursop%2C_Annona_muricata.jpg',
  IT0019: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Sugar_apple_with_leaves.jpg/800px-Sugar_apple_with_leaves.jpg',
  IT0020: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Wood_apple_2.jpg/800px-Wood_apple_2.jpg',
  IT0021: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Passion_fruit_-_whole_and_halved.jpg/800px-Passion_fruit_-_whole_and_halved.jpg',
  IT0028: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Dosakaya_or_Yellow_Cucumber.jpg/800px-Dosakaya_or_Yellow_Cucumber.jpg',
  IT0032: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Pomegranate_fruit_and_seeds.jpg/800px-Pomegranate_fruit_and_seeds.jpg',
  IT0033: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Papaya_cross_section_BNC.jpg/800px-Papaya_cross_section_BNC.jpg',
  IT0034: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Papaya_cross_section_BNC.jpg/800px-Papaya_cross_section_BNC.jpg',

  // Vegetables
  IT0022: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/76/Solanum_melongena_24_08_2012.JPG/800px-Solanum_melongena_24_08_2012.JPG',
  IT0023: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Yardlong_bean.jpg/800px-Yardlong_bean.jpg',
  IT0024: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Moringa_oleifera_pods.jpg/800px-Moringa_oleifera_pods.jpg',
  IT0025: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Banana_flower.jpg/800px-Banana_flower.jpg',
  IT0026: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Lime_-_whole_and_halved.jpg/800px-Lime_-_whole_and_halved.jpg',
  IT0027: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Solanum_torvum_fruits.jpg/800px-Solanum_torvum_fruits.jpg',
  IT0029: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Green_Chili_Peppers.jpg/800px-Green_Chili_Peppers.jpg',
  IT0030: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Tomato_je.jpg/800px-Tomato_je.jpg',
  IT0031: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Scotch_Bonnet_peppers.jpg/800px-Scotch_Bonnet_peppers.jpg',

  // Others
  IT0010: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Bottle_gourd.jpg/800px-Bottle_gourd.jpg',
  IT0013: 'https://images.unsplash.com/photo-1627481977931-15fc3a5a7590?auto=format&fit=crop&w=500&q=80',
  IT0014: 'https://images.unsplash.com/photo-1627481977931-15fc3a5a7590?auto=format&fit=crop&w=500&q=80',
};

// ── All 35 products from the uploaded list ──────────────────────────────────────
const PRODUCT_DATA = [
  {
    itemCode: 'IT0001',
    name: 'Banana Sour No.1',
    description: 'Ambul Kesel No.1 (අඹුල් කෙසෙල්) — Premium Sri Lankan sour banana, Grade 1. Rich in potassium and natural sugars. Perfect for breakfast and traditional rice dishes. Sourced directly from local Negombo region farmers.',
    category: 'Banana', unit: 'kg', stockQuantity: 150, purchasePrice: 140, retailPrice: 200, wholesalePrice: 175,
  },
  {
    itemCode: 'IT0002',
    name: 'Banana KK',
    description: 'Kolikuttu (කොළිකුට්ටු) — A beloved Sri Lankan banana variety known for its sweet taste and creamy texture. Popular at local markets and used in traditional sweets.',
    category: 'Banana', unit: 'kg', stockQuantity: 120, purchasePrice: 340, retailPrice: 410, wholesalePrice: 380,
  },
  {
    itemCode: 'IT0003',
    name: 'Banana Sour No.2',
    description: 'Ambul Kesel No.2 (අඹුල් කෙසෙල් 2) — Second-grade Sri Lankan sour banana. Excellent for cooking, curries, and banana chips. A staple in every Sri Lankan household.',
    category: 'Banana', unit: 'kg', stockQuantity: 100, purchasePrice: 90, retailPrice: 140, wholesalePrice: 125,
  },
  {
    itemCode: 'IT0004',
    name: 'Banana KK No.2',
    description: 'Kolikuttu No.2 (කොළිකුට්ටු 2) — Grade 2 Kolikuttu banana. Ideal for smoothies, desserts, and traditional Sri Lankan banana fritters (kela pani).',
    category: 'Banana', unit: 'kg', stockQuantity: 100, purchasePrice: 200, retailPrice: 300, wholesalePrice: 270,
  },
  {
    itemCode: 'IT0005',
    name: 'Puwalu Banana',
    description: 'Puwalu (පූවාලු) — A smaller, sweeter banana variety unique to Sri Lanka. Often used in religious offerings and traditional Sri Lankan ceremonies.',
    category: 'Banana', unit: 'kg', stockQuantity: 80, purchasePrice: 80, retailPrice: 150, wholesalePrice: 130,
  },
  {
    itemCode: 'IT0006',
    name: 'Banana Red',
    description: 'Rath Kesel (රතු කෙසෙල්) — The vibrant red banana, a specialty of Sri Lanka. Sweeter than yellow bananas with a hint of raspberry flavor. Rich in antioxidants.',
    category: 'Banana', unit: 'kg', stockQuantity: 60, purchasePrice: 340, retailPrice: 400, wholesalePrice: 370,
  },
  {
    itemCode: 'IT0007',
    name: 'Banana (Regular)',
    description: 'Kesel (කෙසෙල්) — Fresh local banana from our partner farms. A daily essential for Sri Lankan families, perfect as a quick snack or added to your morning porridge.',
    category: 'Banana', unit: 'kg', stockQuantity: 200, purchasePrice: 150, retailPrice: 180, wholesalePrice: 165,
  },
  {
    itemCode: 'IT0008',
    name: 'Banana Sour Special',
    description: 'Ambul Kesel Special (අඹුල් කෙසෙල් විශේෂ) — Premium selection of sour bananas, hand-picked for quality. Perfect for traditional Sri Lankan banana curries and acharu (pickle).',
    category: 'Banana', unit: 'kg', stockQuantity: 80, purchasePrice: 150, retailPrice: 210, wholesalePrice: 190,
  },
  {
    itemCode: 'IT0010',
    name: 'Eithral (Bottle Gourd)',
    description: 'Eithral (ඇතිරාළ / බෝතල් හල්) — Traditional Sri Lankan bottle gourd. A cooling vegetable essential in local curries and dhal preparations. Known for its medicinal properties in Ayurvedic tradition.',
    category: 'OTHERS', unit: 'unit', stockQuantity: 20, purchasePrice: 410, retailPrice: 600, wholesalePrice: 540,
  },
  {
    itemCode: 'IT0011',
    name: 'Melon Rocky 475 No.2',
    description: 'Melon (ගෙමේල) — Juicy and refreshing rock melon, Grade 2. A popular tropical fruit enjoyed chilled during Sri Lanka\'s warm months. Rich in Vitamins A and C.',
    category: 'Fruit', unit: 'kg', stockQuantity: 50, purchasePrice: 35, retailPrice: 40, wholesalePrice: 36,
  },
  {
    itemCode: 'IT0012',
    name: 'Melon Tornaa',
    description: 'Tornaa Melon (ටෝනා ගෙමේල) — A variety of sweet melon with a golden-yellow skin. Refreshing and naturally sweet, perfect for fruit salads and fresh juice.',
    category: 'Fruit', unit: 'kg', stockQuantity: 50, purchasePrice: 100, retailPrice: 140, wholesalePrice: 125,
  },
  {
    itemCode: 'IT0013',
    name: 'Kuruluthuda Rice',
    description: 'Kuruluthuda Hal (කුරුළුතුඩ හාල්) — Traditional Sri Lankan heritage rice variety. A native short-grain rice with earthy aroma, highly nutritious and a staple at authentic Sri Lankan meals.',
    category: 'OTHERS', unit: 'kg', stockQuantity: 100, purchasePrice: 350, retailPrice: 390, wholesalePrice: 370,
  },
  {
    itemCode: 'IT0014',
    name: 'Red Rice',
    description: 'Rathu Hal (රතු හාල්) — Nutritious red rice, a cornerstone of traditional Sri Lankan diet. High in fiber and antioxidants. As eaten at every Sri Lankan household for centuries.',
    category: 'OTHERS', unit: 'kg', stockQuantity: 100, purchasePrice: 190, retailPrice: 210, wholesalePrice: 200,
  },
  {
    itemCode: 'IT0015',
    name: 'Banana Green',
    description: 'Kola Kesel (කොළ කෙසෙල්) — Fresh green raw bananas, a key ingredient in traditional Sri Lankan curries and kepela (green banana curry). Full of resistant starch with probiotic benefits.',
    category: 'Banana', unit: 'kg', stockQuantity: 80, purchasePrice: 220, retailPrice: 250, wholesalePrice: 230,
  },
  {
    itemCode: 'IT0016',
    name: 'Mango TJC',
    description: 'Amba TJC (අඹ) — Premium TJC mango variety, beloved across Sri Lanka. Sweet, fibrous and aromatic. Used fresh, in pickles (achcharu) and refreshing amba juice.',
    category: 'Fruit', unit: 'kg', stockQuantity: 80, purchasePrice: 280, retailPrice: 330, wholesalePrice: 305,
  },
  {
    itemCode: 'IT0017',
    name: 'Soursop',
    description: 'Katu Anoda (කටු අනෝදා) — The tropical soursop, known locally as katu anoda. Rich in Vitamin C and natural antioxidants. Used in fresh juices, smoothies, and traditional medicine.',
    category: 'Fruit', unit: 'kg', stockQuantity: 40, purchasePrice: 50, retailPrice: 150, wholesalePrice: 135,
  },
  {
    itemCode: 'IT0018',
    name: 'Cavendish Banana',
    description: 'Cavendish (කැවෙන්ඩිෂ්) — The globally popular Cavendish banana, grown locally in Sri Lanka. Mild, sweet taste with a creamy texture. A favorite for baking and smoothies.',
    category: 'Banana', unit: 'kg', stockQuantity: 150, purchasePrice: 110, retailPrice: 150, wholesalePrice: 135,
  },
  {
    itemCode: 'IT0019',
    name: 'Custard Apple',
    description: 'Aatha (ආතා) — The Sri Lankan custard apple, known locally as aatha. Its creamy, sweet flesh is eaten fresh or blended into milk shakes. A seasonal delight beloved by all.',
    category: 'Fruit', unit: 'kg', stockQuantity: 40, purchasePrice: 70, retailPrice: 150, wholesalePrice: 135,
  },
  {
    itemCode: 'IT0020',
    name: 'Wood Apple',
    description: 'Divul (දිවුල්) — The iconic Sri Lankan wood apple. Used to make traditional "divul kiri" drink and chutneys. A powerful source of Vitamins B and C with medicinal value in Ayurveda.',
    category: 'Fruit', unit: 'kg', stockQuantity: 40, purchasePrice: 100, retailPrice: 150, wholesalePrice: 135,
  },
  {
    itemCode: 'IT0021',
    name: 'Passion Fruit',
    description: 'Passion Pala (පෑශන් ගෙඩි) — Vibrant and aromatic passion fruits from Sri Lanka\'s hill country. Intensely flavored, perfect for juices, cocktails, and desserts.',
    category: 'Fruit', unit: 'kg', stockQuantity: 40, purchasePrice: 300, retailPrice: 400, wholesalePrice: 370,
  },
  {
    itemCode: 'IT0022',
    name: 'Brinjal (Eggplant)',
    description: 'Wambatu (වම්බටු) — Fresh Sri Lankan brinjal, a must-have vegetable in local cooking. Perfect for moju (pickle), curries, and stir-fries. Rich in antioxidants and fiber.',
    category: 'Vegetable', unit: 'kg', stockQuantity: 80, purchasePrice: 200, retailPrice: 220, wholesalePrice: 205,
  },
  {
    itemCode: 'IT0023',
    name: 'Beans Long',
    description: 'Maa Karal (මා කරල්) — Long beans (yard-long beans) fresh from local farms. An essential vegetable in Sri Lankan cuisine used in stir-fries, mallung, and curries.',
    category: 'Vegetable', unit: 'kg', stockQuantity: 60, purchasePrice: 110, retailPrice: 160, wholesalePrice: 145,
  },
  {
    itemCode: 'IT0024',
    name: 'Drumstick (Murunga)',
    description: 'Murunga (මුරුංගා) — The drumstick tree pods, a powerhouse of nutrition. Every part of the murunga tree is used in Sri Lankan cooking and Ayurvedic medicine. Rich in iron and calcium.',
    category: 'Vegetable', unit: 'kg', stockQuantity: 60, purchasePrice: 60, retailPrice: 100, wholesalePrice: 90,
  },
  {
    itemCode: 'IT0025',
    name: 'Banana Blossom',
    description: 'Kesel Muwa (කෙසෙල් මූව) — Fresh banana flower, a traditional Sri Lankan delicacy. Used in mallung (salad), curries, and as a meat substitute. Rich in potassium and dietary fiber.',
    category: 'Vegetable', unit: 'kg', stockQuantity: 40, purchasePrice: 80, retailPrice: 70, wholesalePrice: 65,
  },
  {
    itemCode: 'IT0026',
    name: 'Lime (Dehi)',
    description: 'Dehi (දෙහි) — Sri Lankan lime, an everyday essential in local cooking and Ayurvedic remedies. Used in devilled dishes, pol sambol (coconut relish), and refreshing lime juice.',
    category: 'Vegetable', unit: 'kg', stockQuantity: 60, purchasePrice: 300, retailPrice: 350, wholesalePrice: 325,
  },
  {
    itemCode: 'IT0027',
    name: 'Thibbatu',
    description: 'Thibbatu (තිබ්බටු) — Wild turkey berry, a traditional Sri Lankan vegetable with a distinctive bitter-sweet taste. Used in authentic local curries and valued in traditional medicine.',
    category: 'Vegetable', unit: 'kg', stockQuantity: 30, purchasePrice: 250, retailPrice: 300, wholesalePrice: 280,
  },
  {
    itemCode: 'IT0028',
    name: 'Pittu Kekiri',
    description: 'Pittu Kekiri (පිට්ටු කෙකිරි) — A traditional Sri Lankan melon variety with a soft, sweet flesh. Used in curries when unripe and enjoyed as a fresh fruit when mature.',
    category: 'Fruit', unit: 'kg', stockQuantity: 40, purchasePrice: 100, retailPrice: 150, wholesalePrice: 135,
  },
  {
    itemCode: 'IT0029',
    name: 'Chili Green',
    description: 'Miris (මිරිස්) — Fresh green chili, an essential spice in every Sri Lankan kitchen. Used in curries, sambols, and devilled dishes. Grown by local farmers in the Negombo region.',
    category: 'Vegetable', unit: 'kg', stockQuantity: 50, purchasePrice: 150, retailPrice: 160, wholesalePrice: 150,
  },
  {
    itemCode: 'IT0030',
    name: 'Tomato',
    description: 'Thakkali (තක්කාලි) — Fresh, ripe tomatoes. A versatile ingredient in Sri Lankan cooking used in curries, salads, sambols, and as a base for sauces. Rich in lycopene.',
    category: 'Vegetable', unit: 'kg', stockQuantity: 80, purchasePrice: 180, retailPrice: 180, wholesalePrice: 165,
  },
  {
    itemCode: 'IT0031',
    name: 'Nai Miris (Hot Chili)',
    description: 'Nai Miris (නාය් මිරිස්) — The fiery Sri Lankan hot chili, one of the spiciest varieties. A key ingredient in traditional pol sambol (coconut relish) and authentic curries.',
    category: 'Vegetable', unit: 'kg', stockQuantity: 30, purchasePrice: 800, retailPrice: 900, wholesalePrice: 850,
  },
  {
    itemCode: 'IT0032',
    name: 'Pomegranate (Local)',
    description: 'Delum (දෙළුම්) — Fresh local pomegranate. A prized fruit in Sri Lankan culture, offered at temples and valued for its powerful antioxidants. Naturally sweet-tart with jewel-like seeds.',
    category: 'Fruit', unit: 'kg', stockQuantity: 40, purchasePrice: 500, retailPrice: 700, wholesalePrice: 650,
  },
  {
    itemCode: 'IT0033',
    name: 'Papaw Taning',
    description: 'Papol Taning (පපොල්) — Half-ripe taning papaw, excellent for making green papaw salad and traditional Sri Lankan acharu (pickle). A popular ingredient in local cuisine.',
    category: 'Fruit', unit: 'kg', stockQuantity: 60, purchasePrice: 100, retailPrice: 150, wholesalePrice: 135,
  },
  {
    itemCode: 'IT0034',
    name: 'Papaw No.2',
    description: 'Papol No.2 (පපොල් 2) — Grade 2 ripe papaw. Rich in papain enzyme which aids digestion. A tropical fruit beloved across Sri Lanka, eaten fresh or with lime and chili.',
    category: 'Fruit', unit: 'kg', stockQuantity: 60, purchasePrice: 80, retailPrice: 130, wholesalePrice: 115,
  },
  {
    itemCode: 'IT0035',
    name: 'KK Banana No.3',
    description: 'Kolikuttu No.3 (කොළිකුට්ටු 3) — Grade 3 Kolikuttu banana. A budget-friendly option for bulk buyers and local restaurants. Same great taste, perfect for cooking and smoothies.',
    category: 'Banana', unit: 'kg', stockQuantity: 100, purchasePrice: 100, retailPrice: 180, wholesalePrice: 165,
  },
  {
    itemCode: 'IT0036',
    name: 'Banana Sour No.3',
    description: 'Ambul Kesel No.3 (අඹුල් කෙසෙල් 3) — Grade 3 sour banana, ideal for cooking and industrial use. Perfect for banana chips factories and traditional Sri Lankan banana murabba.',
    category: 'Banana', unit: 'kg', stockQuantity: 80, purchasePrice: 50, retailPrice: 100, wholesalePrice: 90,
  },
];

// ── Main seed function ─────────────────────────────────────────────────────────
const run = async () => {
  await connectDB();
  console.log('\n🌿 KBR Fresh Foods — Product Re-Seed Script');
  console.log('━'.repeat(50));

  // 1. Delete ALL existing products
  const deleted = await Product.deleteMany({});
  console.log(`✅ Cleared ${deleted.deletedCount} existing products`);

  // 2. Ensure categories exist
  const categoryNames = ['Banana', 'Fruit', 'Vegetable', 'OTHERS'];
  const categoryEmojis = { Banana: '🍌', Fruit: '🍎', Vegetable: '🥦', OTHERS: '📦' };
  const catMap = {};

  for (const name of categoryNames) {
    let cat = await Category.findOne({ name });
    if (!cat) {
      cat = await Category.create({ name, description: `${categoryEmojis[name]} ${name} products from KBR Fresh Foods` });
      console.log(`  📁 Created category: ${name}`);
    }
    catMap[name] = cat._id;
  }

  // 3. Insert all products
  let inserted = 0;
  for (const p of PRODUCT_DATA) {
    const catId = catMap[p.category];
    if (!catId) {
      console.warn(`  ⚠️  No category for ${p.itemCode} (${p.category}), skipping.`);
      continue;
    }

    const imageUrl = IMAGES[p.itemCode] || IMAGES['IT0007']; // fallback to generic banana

    await Product.findOneAndUpdate(
      { itemCode: p.itemCode },
      {
        itemCode: p.itemCode,
        name: p.name,
        description: p.description,
        category: catId,
        unit: p.unit || 'kg',
        stockQuantity: p.stockQuantity,
        minimumQty: 1,
        lowStockThreshold: 10,
        purchasePrice: p.purchasePrice,
        retailPrice: p.retailPrice,
        wholesalePrice: p.wholesalePrice,
        minWholesaleQty: 10,
        tax: 0,
        images: [imageUrl],
        isActive: true,
        status: 'Active',
        isPerishable: true,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    inserted++;
    process.stdout.write(`  ✓ ${p.itemCode}: ${p.name}\n`);
  }

  console.log('━'.repeat(50));
  console.log(`✅ Successfully seeded ${inserted} products into MongoDB`);
  console.log('🎉 Done! Your KBR Fresh Foods catalog is ready.\n');
  process.exit(0);
};

run().catch((err) => {
  console.error('❌ Seed error:', err.message);
  process.exit(1);
});
