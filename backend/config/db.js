const mongoose = require('mongoose');

mongoose.connection.on('error', (err) => {
  console.error(`[Mongoose] Connection error: ${err.message}`);
});


const connectDB = async () => {
  const RETRY_INTERVAL_MS = 5000;

  const attempt = async () => {
    try {
      const conn = await mongoose.connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 8000,
      });
      console.log(`✅ MongoDB connected: ${conn.connection.host}`);
    } catch (error) {
      console.error(`❌ MongoDB connection failed: ${error.message}`);
      console.log(`⏳ Retrying in ${RETRY_INTERVAL_MS / 1000}s...`);
      setTimeout(attempt, RETRY_INTERVAL_MS);
    }
  };

  await attempt();
};

module.exports = connectDB;
