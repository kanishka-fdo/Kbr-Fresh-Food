const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');
const Category = require('./models/Category');

dotenv.config();

// ALL images use Unsplash only — reliable, no CORS issues, no 3D/animated
const exactProducts = [
  // === BANANA ===
  { code:'IT0001', name:'Banana Sour No.1',       cat:'Banana',    unit:'kg',     p:140, s:200, img:'https://images.unsplash.com/photo-1603833665858-e61d17a86224?w=600&fit=crop&auto=format' },
  { code:'IT0002', name:'Banana KK',               cat:'Banana',    unit:'kg',     p:340, s:410, img:'https://images.unsplash.com/photo-1528825871115-3581a5387915?w=600&fit=crop&auto=format' },
  { code:'IT0003', name:'Banana Sour No.2',        cat:'Banana',    unit:'kg',     p:90,  s:140, img:'https://images.unsplash.com/photo-1603833665858-e61d17a86224?w=600&fit=crop&auto=format' },
  { code:'IT0004', name:'Banana KK No.2',          cat:'Banana',    unit:'kg',     p:200, s:300, img:'https://images.unsplash.com/photo-1528825871115-3581a5387915?w=600&fit=crop&auto=format' },
  { code:'IT0005', name:'Puwalu',                  cat:'Banana',    unit:'kg',     p:80,  s:150, img:'https://images.unsplash.com/photo-1571508601891-ca5e7a713859?w=600&fit=crop&auto=format' },
  { code:'IT0006', name:'Banana Red',              cat:'Banana',    unit:'kg',     p:340, s:400, img:'https://images.unsplash.com/photo-1634467524884-897d0af5e104?w=600&fit=crop&auto=format' },
  { code:'IT0007', name:'Banana Sweet',            cat:'Banana',    unit:'kg',     p:150, s:180, img:'https://images.unsplash.com/photo-1587132137056-bfbf0166836e?w=600&fit=crop&auto=format' },
  { code:'IT0008', name:'Banana Sour Special',     cat:'Banana',    unit:'kg',     p:150, s:210, img:'https://images.unsplash.com/photo-1571508601891-ca5e7a713859?w=600&fit=crop&auto=format' },
  { code:'IT0015', name:'Banana Green',            cat:'Banana',    unit:'kg',     p:220, s:280, img:'https://images.unsplash.com/photo-1576088899849-514d232585f0?w=600&fit=crop&auto=format' },
  { code:'IT0018', name:'Cavendish',               cat:'Banana',    unit:'kg',     p:110, s:150, img:'https://images.unsplash.com/photo-1481349518771-20055b2a7b24?w=600&fit=crop&auto=format' },
  { code:'IT0035', name:'KK Banana No.3',          cat:'Banana',    unit:'kg',     p:100, s:180, img:'https://images.unsplash.com/photo-1528825871115-3581a5387915?w=600&fit=crop&auto=format' },
  { code:'IT0036', name:'Banana Sour No.3',        cat:'Banana',    unit:'kg',     p:50,  s:100, img:'https://images.unsplash.com/photo-1603833665858-e61d17a86224?w=600&fit=crop&auto=format' },

  // === FRUIT ===
  { code:'IT0011', name:'Melon Rocky 475 No.02',   cat:'Fruit',     unit:'kg',     p:35,  s:40,  img:'https://images.unsplash.com/photo-1571575173700-afb9492e6a50?w=600&fit=crop&auto=format' },
  { code:'IT0012', name:'Melon Tornaa',             cat:'Fruit',     unit:'kg',     p:100, s:140, img:'https://images.unsplash.com/photo-1587314168485-3236d6710814?w=600&fit=crop&auto=format' },
  { code:'IT0016', name:'Mango TJC',               cat:'Fruit',     unit:'kg',     p:280, s:330, img:'https://images.unsplash.com/photo-1553279768-865429fa0078?w=600&fit=crop&auto=format' },
  { code:'IT0017', name:'Sour Sop',                cat:'Fruit',     unit:'kg',     p:50,  s:150, img:'https://images.unsplash.com/photo-1623228943755-1f9b9a96afc4?w=600&fit=crop&auto=format' },
  { code:'IT0019', name:'Custard Apple',           cat:'Fruit',     unit:'kg',     p:70,  s:150, img:'https://images.unsplash.com/photo-1560015534-cee980ba7e13?w=600&fit=crop&auto=format' },
  { code:'IT0020', name:'Wood Apple',              cat:'Fruit',     unit:'kg',     p:100, s:150, img:'https://images.unsplash.com/photo-1587132137056-bfbf0166836e?w=600&fit=crop&auto=format' },
  { code:'IT0021', name:'Passion Fruit',           cat:'Fruit',     unit:'kg',     p:300, s:400, img:'https://images.unsplash.com/photo-1610486893699-b1d5bf5952db?w=600&fit=crop&auto=format' },
  { code:'IT0028', name:'Pittu Kekiri',            cat:'Fruit',     unit:'kg',     p:100, s:150, img:'https://images.unsplash.com/photo-1571575173700-afb9492e6a50?w=600&fit=crop&auto=format' },
  { code:'IT0032', name:'Pomegranate Local',       cat:'Fruit',     unit:'kg',     p:500, s:700, img:'https://images.unsplash.com/photo-1615486171448-4fb003759ace?w=600&fit=crop&auto=format' },
  { code:'IT0033', name:'Papaw Taning',            cat:'Fruit',     unit:'kg',     p:100, s:150, img:'https://images.unsplash.com/photo-1517282009859-f000ef1b4395?w=600&fit=crop&auto=format' },
  { code:'IT0034', name:'Papaw No.2',              cat:'Fruit',     unit:'kg',     p:80,  s:130, img:'https://images.unsplash.com/photo-1517282009859-f000ef1b4395?w=600&fit=crop&auto=format' },

  // === VEGETABLE ===
  { code:'IT0022', name:'Brinjal',                 cat:'Vegetable', unit:'kg',     p:200, s:220, img:'https://images.unsplash.com/photo-1601646736222-38666324db00?w=600&fit=crop&auto=format' },
  { code:'IT0023', name:'Beans Long',              cat:'Vegetable', unit:'kg',     p:110, s:160, img:'https://images.unsplash.com/photo-1596706927552-32a76f2b0928?w=600&fit=crop&auto=format' },
  { code:'IT0024', name:'Drumstick',               cat:'Vegetable', unit:'kg',     p:60,  s:100, img:'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&fit=crop&auto=format' },
  { code:'IT0025', name:'Banana Blossom',          cat:'Vegetable', unit:'kg',     p:80,  s:70,  img:'https://images.unsplash.com/photo-1612479536859-90d56b001d67?w=600&fit=crop&auto=format' },
  { code:'IT0026', name:'Lime',                    cat:'Vegetable', unit:'kg',     p:300, s:350, img:'https://images.unsplash.com/photo-1590502593747-42a996111139?w=600&fit=crop&auto=format' },
  { code:'IT0027', name:'Thibbatu',                cat:'Vegetable', unit:'kg',     p:250, s:300, img:'https://images.unsplash.com/photo-1596647907572-10f769d0387b?w=600&fit=crop&auto=format' },
  { code:'IT0029', name:'Chili Green',             cat:'Vegetable', unit:'kg',     p:150, s:160, img:'https://images.unsplash.com/photo-1596647907572-10f769d0387b?w=600&fit=crop&auto=format' },
  { code:'IT0030', name:'Tomato',                  cat:'Vegetable', unit:'kg',     p:180, s:180, img:'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&fit=crop&auto=format' },
  { code:'IT0031', name:'Nai Miris',               cat:'Vegetable', unit:'kg',     p:800, s:900, img:'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?w=600&fit=crop&auto=format' },

  // === OTHERS ===
  { code:'IT0010', name:'Eithral Bottle',          cat:'OTHERS',    unit:'pieces', p:410, s:600, img:'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&fit=crop&auto=format' },
  { code:'IT0013', name:'Kuruluthuda Rice',        cat:'OTHERS',    unit:'kg',     p:350, s:390, img:'https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?w=600&fit=crop&auto=format' },
  { code:'IT0014', name:'Red Rice',                cat:'OTHERS',    unit:'kg',     p:190, s:210, img:'https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?w=600&fit=crop&auto=format' },
];

const categoryDetails = [
  { name:'Banana',    type:'fruit',     description:'Sri Lankan banana varieties',          image:'https://images.unsplash.com/photo-1571508601891-ca5e7a713859?w=400&fit=crop&auto=format' },
  { name:'Fruit',     type:'fruit',     description:'Fresh seasonal tropical fruits',        image:'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=400&fit=crop&auto=format' },
  { name:'Vegetable', type:'vegetable', description:'Farm-fresh local vegetables',           image:'https://images.unsplash.com/photo-1598046937895-25e24c297cb7?w=400&fit=crop&auto=format' },
  { name:'OTHERS',    type:'other',     description:'Rice, bottles and other grocery items', image:'https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?w=400&fit=crop&auto=format' },
];

async function seedExactProducts() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected...');

    await Product.deleteMany({});
    await Category.deleteMany({});
    console.log('Cleared existing products and categories.');

    const categoryMap = {};
    for (const cData of categoryDetails) {
      const c = await Category.create(cData);
      categoryMap[c.name] = c._id;
    }
    console.log('Created 4 categories: Banana | Fruit | Vegetable | OTHERS');

    let created = 0;
    for (const p of exactProducts) {
      const stock = Math.floor(Math.random() * 80) + 10;
      const harvestDate = new Date(); harvestDate.setDate(harvestDate.getDate() - (Math.floor(Math.random() * 4) + 1));
      const expiryDate  = new Date(); expiryDate.setDate(expiryDate.getDate()  + (Math.floor(Math.random() * 8) + 2));
      const salesPrice  = p.s > 0 ? p.s : Math.round(p.p * 1.35);

      await Product.create({
        itemCode:         p.code,
        name:             p.name,
        category:         categoryMap[p.cat],
        images:           [p.img],
        unit:             p.unit,
        stockQuantity:    stock,
        minimumQty:       0,
        lowStockThreshold:15,
        purchasePrice:    p.p,
        retailPrice:      salesPrice,
        wholesalePrice:   Math.round(salesPrice * 0.82),
        harvestDate,
        arrivalDate:      harvestDate,
        expiryDate,
        isActive:         true,
        status:           'Active',
        warehouseZone:    p.cat === 'Banana' ? 'Banana Store' :
                          p.cat === 'Fruit'  ? 'Cold Room A'  :
                          p.cat === 'Vegetable' ? 'Cold Room B' : 'General Storage',
      });
      created++;
    }

    console.log(`\n✅  Seeded ${created} products — ALL using Unsplash real photos!\n`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err.message);
    process.exit(1);
  }
}

seedExactProducts();
