'use strict';

const bcrypt    = require('bcryptjs');
const OtpToken  = require('../models/OtpToken.model');
const { sendOtpEmail } = require('./email.service');
const { getRedisClient } = require('../config/redis');

const OTP_TTL_MINUTES  = 10;
const COOLDOWN_SECONDS = 60;
const MAX_ATTEMPTS     = 5;

/**
 * generateAndSendOtp(email, purpose)
 *
 * - Checks Redis for an active cooldown (60s between requests)
 * - Deletes any prior unverified OtpToken for that email+purpose
 * - Creates a new OtpToken with a 10-minute expiry
 * - Sets a 60s Redis cooldown key
 * - Sends the OTP via email.service
 */
async function generateAndSendOtp(email, purpose) {
  const redis       = getRedisClient();
  const cooldownKey = `otp-cooldown:${email}:${purpose}`;

  // Check cooldown
  const cooldown = await redis.get(cooldownKey);
  if (cooldown) {
    const ttl = await redis.ttl(cooldownKey);
    const err  = new Error(`Please wait ${ttl} seconds before requesting another OTP.`);
    err.statusCode = 429;
    throw err;
  }

  // Generate 6-digit numeric code
  const otpCode = String(Math.floor(100000 + Math.random() * 900000));

  // Hash the OTP (cost 10 — fast enough, code is short-lived anyway)
  const otpHash = await bcrypt.hash(otpCode, 10);

  // Remove any existing unverified OTP docs for this email+purpose
  await OtpToken.deleteMany({ email, purpose, verified: false });

  // Create new OTP doc
  const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);
  await OtpToken.create({ email, otpHash, purpose, expiresAt });

  // Set cooldown in Redis
  await redis.set(cooldownKey, '1', 'EX', COOLDOWN_SECONDS);

  // Send email (or log in dev)
  await sendOtpEmail(email, otpCode, purpose);

  console.log(`[OTP] Generated for ${email} (purpose: ${purpose})`);
}

/**
 * verifyOtp(email, purpose, submittedCode)
 *
 * - Fetches the latest OtpToken doc
 * - Checks expiry (belt-and-suspenders — TTL index handles this but race conditions exist)
 * - Blocks if attempts >= MAX_ATTEMPTS
 * - bcrypt.compare the submitted code
 * - On success marks verified:true (TTL index will clean up)
 * - Returns true on success; throws a descriptive error on failure
 */
async function verifyOtp(email, purpose, submittedCode) {
  const token = await OtpToken.findOne({ email, purpose }).sort({ createdAt: -1 });

  if (!token) {
    const err = new Error('No OTP found. Please request a new one.');
    err.statusCode = 400;
    throw err;
  }

  if (token.expiresAt < new Date()) {
    const err = new Error('OTP has expired. Please request a new one.');
    err.statusCode = 400;
    throw err;
  }

  if (token.attempts >= MAX_ATTEMPTS) {
    const err = new Error('Too many failed attempts. Please request a new OTP.');
    err.statusCode = 429;
    throw err;
  }

  const isValid = await bcrypt.compare(submittedCode, token.otpHash);

  if (!isValid) {
    token.attempts += 1;
    await token.save();
    const remaining = MAX_ATTEMPTS - token.attempts;
    const err = new Error(
      remaining > 0
        ? `Incorrect OTP. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`
        : 'Too many failed attempts. Please request a new OTP.'
    );
    err.statusCode = 400;
    err.attemptsRemaining = remaining;
    throw err;
  }

  // Mark verified — TTL will clean the doc up
  token.verified = true;
  await token.save();

  return true;
}

module.exports = { generateAndSendOtp, verifyOtp };
