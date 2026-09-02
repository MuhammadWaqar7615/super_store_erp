const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  method: { type: String, enum: ['CASH', 'CARD', 'STRIPE', 'OTHER', 'stripe'], required: true },
  referenceType: { type: String, enum: ['SALE', 'PURCHASE'] },
  referenceId: mongoose.Schema.Types.ObjectId,
  
  // Added fields to match store app's schema for cross-compatibility
  saleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Sale' },
  stripeClientSecret: String,
  currency: { type: String, default: 'pkr' },
  transactionReference: String,
  webhookEventId: String,
  webhookProcessedAt: Date,
  paidAt: Date,
  
  stripePaymentIntentId: String,
  status: { type: String, enum: ['PENDING', 'COMPLETED', 'FAILED', 'pending', 'processing', 'succeeded', 'failed', 'cancelled'], default: 'PENDING' }
}, { timestamps: true, strict: false });

module.exports = mongoose.model('Payment', paymentSchema);
