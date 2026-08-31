const mongoose = require('mongoose');

const purchaseSchema = new mongoose.Schema({
  supplierId: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier' },
  invoiceNumber: String,
  items: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    quantity: Number,
    unitCost: Number,
    total: Number
  }],
  totalAmount: Number,
  status: { type: String, enum: ['PENDING', 'RECEIVED', 'CANCELLED'], default: 'PENDING' },
  paymentStatus: { type: String, enum: ['UNPAID', 'PARTIAL', 'PAID'], default: 'UNPAID' }
}, { timestamps: true });

module.exports = mongoose.model('Purchase', purchaseSchema);
