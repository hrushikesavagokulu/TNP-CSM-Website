'use strict';

const Joi = require('joi');

const ALLOWED_EMAIL_DOMAIN = process.env.ALLOWED_EMAIL_DOMAIN || 'gprec.ac.in';

// ── Register ──────────────────────────────────────────────────────────────────
const register = Joi.object({
  name: Joi.string().trim().min(2).max(80).required()
    .messages({ 'string.min': 'Name must be at least 2 characters' }),

  rollNo: Joi.string().trim().uppercase().min(3).max(20).required()
    .messages({ 'string.empty': 'Roll number is required' }),

  email: Joi.string().trim().lowercase().email().required()
    .custom((value, helpers) => {
      const domain = value.split('@')[1];
      if (domain !== ALLOWED_EMAIL_DOMAIN) {
        return helpers.error('any.invalid');
      }
      return value;
    })
    .messages({
      'any.invalid': `Only @${ALLOWED_EMAIL_DOMAIN} email addresses are allowed`,
      'string.email': 'Please enter a valid email address',
    }),

  phone: Joi.string().trim().pattern(/^[6-9]\d{9}$/).required()
    .messages({ 'string.pattern.base': 'Enter a valid 10-digit Indian mobile number' }),

  branch: Joi.string().trim().min(2).max(30).required(),

  year: Joi.number().integer().min(1).max(4).required(),

  password: Joi.string().min(8).max(64)
    .pattern(/[0-9]/, 'at least one number')
    .pattern(/[A-Za-z]/, 'at least one letter')
    .required()
    .messages({
      'string.min':              'Password must be at least 8 characters',
      'string.pattern.name':     'Password must contain {#name}',
    }),
});

// ── Login ─────────────────────────────────────────────────────────────────────
const login = Joi.object({
  email:    Joi.string().trim().lowercase().email().required(),
  password: Joi.string().required(),
});

// ── Verify OTP (register) ─────────────────────────────────────────────────────
const verifyOtp = Joi.object({
  email: Joi.string().trim().lowercase().email().required(),
  otp:   Joi.string().pattern(/^\d{6}$/).required()
    .messages({ 'string.pattern.base': 'OTP must be exactly 6 digits' }),
});

// ── Forgot password ───────────────────────────────────────────────────────────
const forgotPassword = Joi.object({
  email: Joi.string().trim().lowercase().email().required(),
});

// ── Verify reset OTP ──────────────────────────────────────────────────────────
const verifyResetOtp = Joi.object({
  email: Joi.string().trim().lowercase().email().required(),
  otp:   Joi.string().pattern(/^\d{6}$/).required()
    .messages({ 'string.pattern.base': 'OTP must be exactly 6 digits' }),
});

// ── Reset password ────────────────────────────────────────────────────────────
const resetPassword = Joi.object({
  resetToken:  Joi.string().required(),
  newPassword: Joi.string().min(8).max(64)
    .pattern(/[0-9]/, 'at least one number')
    .pattern(/[A-Za-z]/, 'at least one letter')
    .required()
    .messages({
      'string.min': 'Password must be at least 8 characters',
      'string.pattern.name': 'Password must contain {#name}',
    }),
});

// ── Check availability ────────────────────────────────────────────────────────
const checkAvailability = Joi.object({
  rollNo: Joi.string().trim().uppercase().optional(),
  email:  Joi.string().trim().lowercase().email().optional(),
}).or('rollNo', 'email'); // at least one must be present

module.exports = {
  register,
  login,
  verifyOtp,
  forgotPassword,
  verifyResetOtp,
  resetPassword,
  checkAvailability,
};
