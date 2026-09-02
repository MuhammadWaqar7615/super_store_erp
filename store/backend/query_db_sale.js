require('dotenv').config();
const mongoose = require('mongoose');
const Sale = require('./src/models/Sale');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const latestSales = await Sale.find().sort({ createdAt: -1 }).limit(3);
  console.log('Latest Sales:', latestSales.map(s => ({ invoiceNumber: s.invoiceNumber, status: s.status, paymentStatus: s.paymentStatus })));
  process.exit(0);
});
