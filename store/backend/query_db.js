require('dotenv').config();
const mongoose = require('mongoose');
const Payment = require('./src/models/Payment');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const latestPayment = await Payment.findOne().sort({ createdAt: -1 });
  console.log('Latest Payment:', latestPayment);
  process.exit(0);
});
