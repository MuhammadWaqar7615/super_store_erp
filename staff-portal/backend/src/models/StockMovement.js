const mongoose = require('mongoose');

const stockMovementSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  type: { type: String, enum: ['PURCHASE', 'SALE', 'ADJUSTMENT', 'RETURN'], required: true },
  quantity: { type: Number, required: true },
  previousStock: { type: Number, required: true },
  newStock: { type: Number, required: true },
  referenceType: String,
  referenceId: mongoose.Schema.Types.ObjectId,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reason: String,
}, { timestamps: true });

module.exports = mongoose.model('StockMovement', stockMovementSchema);
