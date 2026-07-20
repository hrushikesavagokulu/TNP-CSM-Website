'use strict';

const nodemailer = require('nodemailer');

/**
 * mailer.js — Nodemailer transporter singleton.
 * Built once from env vars; throws at startup if SMTP vars are missing in production.
 */

let transporter;

function getTransporter() {
  if (transporter) return transporter;

  // In development/test, fall back to Ethereal (fake SMTP) if no real creds provided
  if (!process.env.SMTP_HOST && process.env.NODE_ENV !== 'production') {
    console.warn('[Mailer] ⚠️  No SMTP_HOST set — OTP codes will be logged to console only');
    transporter = null;
    return null;
  }

  transporter = nodemailer.createTransport({
    host:   process.env.SMTP_HOST,
    port:   parseInt(process.env.SMTP_PORT || '587', 10),
    secure: parseInt(process.env.SMTP_PORT || '587', 10) === 465, // true for port 465
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  // Verify connection on first creation
  transporter.verify((err) => {
    if (err) console.error('[Mailer] ❌ SMTP verification failed:', err.message);
    else     console.log('[Mailer] ✅ SMTP transporter ready');
  });

  return transporter;
}

module.exports = { getTransporter };
