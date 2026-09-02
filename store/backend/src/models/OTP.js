const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  otp: { type: String, required: true },
  expiresAt: { type: Date, required: true }, // 15 minutes
  attempts: { type: Number, default: 0 },
  lastRequestedAt: Date,
  requestCount: { type: Number, default: 0 } // Rate limiting
}, { timestamps: true });

// TTL Index
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('OTP', otpSchema);
