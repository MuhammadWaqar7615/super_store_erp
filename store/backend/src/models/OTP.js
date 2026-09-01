const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true, // One OTP document per email
  },
  otp: {
    type: String, // Storing hashed OTP
    required: true,
  },
  attempts: {
    type: Number,
    default: 0,
  },
  requestCount: {
    type: Number,
    default: 1,
  },
  lastRequestedAt: {
    type: Date,
    default: Date.now,
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: 0 } // TTL index: automatically deletes document when expiresAt is reached
  }
}, { timestamps: true });

module.exports = mongoose.model('OTP', otpSchema);
