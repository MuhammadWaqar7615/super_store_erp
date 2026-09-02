const mongoose = require('mongoose');

const saleSchema = new mongoose.Schema({
  invoiceNumber: { type: String, unique: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  walkInCustomerName: { type: String },
  walkInCustomerPhone: { type: String },
  cashierId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  cartId: { type: mongoose.Schema.Types.ObjectId, ref: 'Cart' },
  channel: { type: String, enum: ['pos', 'self-checkout'] },
  items: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    productName: String,
    quantity: Number,
    unitPrice: Number,
    purchaseCost: Number,
    total: Number
  }],
  subtotal: Number,
  total: Number, // No tax, no discount in v1
  status: { type: String, enum: ['pending', 'completed', 'failed', 'cancelled'], default: 'pending' },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' }
}, { timestamps: true });

module.exports = mongoose.model('Sale', saleSchema);
