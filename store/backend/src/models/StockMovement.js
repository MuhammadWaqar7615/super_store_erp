const mongoose = require('mongoose');

const stockMovementSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  type: String,
  quantity: Number,
  previousStock: Number,
  newStock: Number,
  referenceId: mongoose.Schema.Types.ObjectId
}, { timestamps: true });

module.exports = mongoose.model('StockMovement', stockMovementSchema);
