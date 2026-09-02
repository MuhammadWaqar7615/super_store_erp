const mongoose = require('mongoose');

const incomeSchema = new mongoose.Schema({
  title: String,
  source: String,
  amount: Number,
  referenceType: String,
  referenceId: mongoose.Schema.Types.ObjectId,
  date: Date
}, { timestamps: true });

module.exports = mongoose.model('Income', incomeSchema);
