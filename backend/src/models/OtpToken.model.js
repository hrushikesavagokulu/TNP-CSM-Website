'use strict';

const mongoose = require('mongoose');

const otpTokenSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    index: true,
  },
  otpHash: {
    type: String,
    required: true,
  },
  purpose: {
    type: String,
    enum: ['register', 'login-reset', 'profile-password-change'],
    required: true,
  },
  // Mongo TTL index: documents are auto-deleted when expiresAt is in the past
  expiresAt: {
    type: Date,
    required: true,
    index: { expireAfterSeconds: 0 },
  },
  // Tracks wrong attempts; 5+ blocks further verification
  attempts: {
    type: Number,
    default: 0,
  },
  // Marked true once the OTP is verified successfully
  verified: {
    type: Boolean,
    default: false,
  },
});

const OtpToken = mongoose.model('OtpToken', otpTokenSchema);

module.exports = OtpToken;
