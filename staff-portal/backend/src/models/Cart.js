const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  items: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    productName: String,
    quantity: { type: Number, min: 1 },
    unitPriceSnapshot: Number
  }],
  status: { type: String, enum: ['draft', 'submitted', 'finalized', 'cancelled'], default: 'draft' },
  submittedAt: Date,
  finalizedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  expiresAt: { type: Date, default: () => new Date(Date.now() + 30 * 60 * 1000) } // 30 min expiry
}, { timestamps: true });

// TTL Index
cartSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Cart', cartSchema);
