'use strict';

const jwt = require('jsonwebtoken');

const ACCESS_SECRET  = process.env.JWT_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const RESET_SECRET   = process.env.JWT_SECRET; // reuse — reset tokens are short-lived and scoped

// ── Access token (15 min) ─────────────────────────────────────────────────────
function generateAccessToken(userId, role) {
  return jwt.sign(
    { sub: userId, role },
    ACCESS_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRES || '15m' }
  );
}

function verifyAccessToken(token) {
  return jwt.verify(token, ACCESS_SECRET);
}

// ── Refresh token (7 days) ────────────────────────────────────────────────────
function generateRefreshToken(userId) {
  return jwt.sign(
    { sub: userId },
    REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES || '7d' }
  );
}

function verifyRefreshToken(token) {
  return jwt.verify(token, REFRESH_SECRET);
}

// ── Password-reset token (10 min, carries email for verification) ─────────────
function generateResetToken(email) {
  return jwt.sign(
    { email, purpose: 'password-reset' },
    RESET_SECRET,
    { expiresIn: '10m' }
  );
}

function verifyResetToken(token) {
  const payload = jwt.verify(token, RESET_SECRET);
  if (payload.purpose !== 'password-reset') {
    throw new Error('Invalid token purpose');
  }
  return payload;
}

// ── Cookie options ────────────────────────────────────────────────────────────
const COOKIE_BASE = {
  httpOnly: true,
  sameSite: 'strict',
  secure:   process.env.NODE_ENV === 'production', // HTTPS-only in prod
};

const ACCESS_COOKIE_OPTS = {
  ...COOKIE_BASE,
  maxAge: 15 * 60 * 1000, // 15 min in ms
};

const REFRESH_COOKIE_OPTS = {
  ...COOKIE_BASE,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
};

module.exports = {
  generateAccessToken,
  verifyAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  generateResetToken,
  verifyResetToken,
  ACCESS_COOKIE_OPTS,
  REFRESH_COOKIE_OPTS,
};
