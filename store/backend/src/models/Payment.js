const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  saleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Sale' },
  amount: Number,
  currency: { type: String, default: 'pkr' },
  method: { type: String, default: 'stripe' },
  status: { type: String, enum: ['pending', 'processing', 'succeeded', 'failed', 'cancelled'] },
  stripePaymentIntentId: String,
  stripeClientSecret: String,  // For frontend confirmation
  transactionReference: String,
  webhookEventId: String,      // For idempotency
  webhookProcessedAt: Date,
  paidAt: Date
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
