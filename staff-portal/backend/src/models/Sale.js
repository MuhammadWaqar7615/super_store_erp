const mongoose = require('mongoose');

const saleSchema = new mongoose.Schema({
  invoiceNumber: { type: String, required: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  cashierId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  cartId: { type: mongoose.Schema.Types.ObjectId, ref: 'Cart' },
  channel: { type: String, enum: ['pos', 'self-checkout'], required: true },
  items: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    productName: { type: String, required: true },
    quantity: { type: Number, required: true },
    unitPrice: { type: Number, required: true },
    purchaseCost: { type: Number, required: true }, // Snapshotted cost
    total: { type: Number, required: true }
  }],
  subtotal: { type: Number, required: true },
  total: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'completed', 'cancelled'], default: 'completed' },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'paid' },
}, { timestamps: true });

module.exports = mongoose.model('Sale', saleSchema);
