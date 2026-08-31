const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
  },
  purchasePrice: {
    type: Number,
    required: true,
    min: 0,
  },
  sellingPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  stockQuantity: {
    type: Number,
    required: true,
    default: 0,
    min: 0,
  },
  minimumStock: {
    type: Number,
    required: true,
    default: 10,
    min: 0,
  },
  unit: {
    type: String,
    required: true, // e.g., kg, pcs, lit
  },
  image: {
    type: String, // Cloudinary URL
  },
  isActive: {
    type: Boolean,
    default: true,
  }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
