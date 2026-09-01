const app = require('../backend/src/app');
const mongoose = require('mongoose');

// Cache MongoDB connection (prevents multiple connections in serverless)
let cachedConnection = null;

module.exports = async (req, res) => {
  try {
    if (!cachedConnection) {
      cachedConnection = await mongoose.connect(process.env.MONGODB_URI);
      console.log('✅ MongoDB Connected (Serverless)');
    }
    // Pass request to Express app
    await app(req, res);
  } catch (error) {
    console.error('❌ Serverless Error:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};
