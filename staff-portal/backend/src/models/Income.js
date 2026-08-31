const mongoose = require('mongoose');

const incomeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, required: true },
  amount: { type: Number, required: true },
  referenceType: { type: String },
  referenceId: { type: mongoose.Schema.Types.ObjectId },
  date: { type: Date, default: Date.now },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Income', incomeSchema);
