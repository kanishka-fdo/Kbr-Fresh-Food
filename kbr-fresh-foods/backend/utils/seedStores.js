require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const Store = require('../models/Store');
const Product = require('../models/Product');

const seedStores = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected for seeding stores...');

    await Store.deleteMany({});

    // Get some products to add as inventory
    const products = await Product.find().limit(15);
    const makeInventory = () =>
      products.map((p) => ({
        product: p._id,
        stock: Math.floor(Math.random() * 80) + 15,
      }));

    const stores = [
      // ── KBR Retail ──────────────────────────────────────────────────────────
      {
        name: 'KBR Fresh Foods — Main Store',
        type: 'KBR Retail',
        address: '45 Senanayake Mawatha, Negombo',
        phone: '+94 77 977 9316',
        openHours: '6:00 AM – 8:00 PM',
        description: 'Our flagship store stocked with farm-fresh fruits, vegetables, dairy and more. Walk in and get the freshest produce in Negombo. WhatsApp orders also accepted.',
        imageUrl: 'https://images.unsplash.com/photo-1534723452862-4c874018d66d?w=800&fit=crop&q=80',
        location: { lat: 7.2083, lng: 79.8358 },
        inventory: makeInventory(),
      },

      // ── Keells Super ─────────────────────────────────────────────────────────
      {
        name: 'Keells Super — Negombo Town',
        type: 'Keells',
        address: '88 Colombo Road, Negombo',
        phone: '+94 31 222 4567',
        openHours: '8:00 AM – 10:00 PM',
        description: 'KBR Fresh Foods supplies the fresh produce section at this central Keells supermarket.',
        imageUrl: 'https://images.unsplash.com/photo-1604719312566-8912e9c8a213?w=600',
        location: { lat: 7.2172, lng: 79.8457 },
        inventory: makeInventory(),
      },
      {
        name: 'Keells Super — Negombo Beach Road',
        type: 'Keells',
        address: '12 Lewis Place, Negombo',
        phone: '+94 31 222 3309',
        openHours: '8:00 AM – 10:00 PM',
        description: 'Conveniently located near Negombo beach, this Keells stocks a full range of KBR-supplied fresh items.',
        imageUrl: 'https://images.unsplash.com/photo-1604719312566-8912e9c8a213?w=600',
        location: { lat: 7.2095, lng: 79.8369 },
        inventory: makeInventory(),
      },
      {
        name: 'Keells Super — Katunayake',
        type: 'Keells',
        address: '56 Airport Road, Katunayake',
        phone: '+94 11 225 7801',
        openHours: '7:00 AM – 11:00 PM',
        description: 'Serving the Katunayake area near the international airport with KBR fresh produce.',
        imageUrl: 'https://images.unsplash.com/photo-1604719312566-8912e9c8a213?w=600',
        location: { lat: 7.1697, lng: 79.8872 },
        inventory: makeInventory(),
      },

      // ── Food City ────────────────────────────────────────────────────────────
      {
        name: 'Food City — Negombo',
        type: 'Food City',
        address: '120 Old Chilaw Road, Negombo',
        phone: '+94 31 222 8800',
        openHours: '7:30 AM – 9:30 PM',
        description: 'KBR Fresh Foods is the exclusive fresh produce supplier for this Food City branch.',
        imageUrl: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=600',
        location: { lat: 7.2083, lng: 79.8271 },
        inventory: makeInventory(),
      },
      {
        name: 'Food City — Kochchikade',
        type: 'Food City',
        address: '89 Chilaw Road, Kochchikade',
        phone: '+94 31 227 0021',
        openHours: '7:30 AM – 9:00 PM',
        description: 'Serving the Kochchikade community with KBR-supplied daily fresh fruits and vegetables.',
        imageUrl: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=600',
        location: { lat: 7.2657, lng: 79.8603 },
        inventory: makeInventory(),
      },
      {
        name: 'Food City — Wattala',
        type: 'Food City',
        address: '35 Negombo Road, Wattala',
        phone: '+94 11 295 1234',
        openHours: '8:00 AM – 9:00 PM',
        description: 'KBR Fresh Foods delivers produce here every morning before 7 AM.',
        imageUrl: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=600',
        location: { lat: 6.9770, lng: 79.8883 },
        inventory: makeInventory(),
      },
    ];

    await Store.insertMany(stores);
    console.log(`✅ ${stores.length} stores seeded successfully!`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error seeding stores:', error);
    process.exit(1);
  }
};

seedStores();
