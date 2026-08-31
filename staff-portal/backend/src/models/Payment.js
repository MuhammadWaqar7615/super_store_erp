const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  method: { type: String, enum: ['CASH', 'CARD', 'STRIPE', 'OTHER'], required: true },
  referenceType: { type: String, enum: ['SALE', 'PURCHASE'] },
  referenceId: mongoose.Schema.Types.ObjectId,
  stripePaymentIntentId: String,
  status: { type: String, enum: ['PENDING', 'COMPLETED', 'FAILED'], default: 'PENDING' }
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
