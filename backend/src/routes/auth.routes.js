'use strict';

const express    = require('express');
const controller = require('../controllers/auth.controller');
const validate   = require('../middleware/validate.middleware');
const validators = require('../validators/auth.validators');
const authenticate = require('../middleware/auth.middleware');
const { authRateLimiter } = require('../middleware/rateLimiter.middleware');

const router = express.Router();

// Apply rate limiter to ALL auth routes (lazily initialised on first request)
router.use(authRateLimiter);

// ── Public auth routes ────────────────────────────────────────────────────────
router.post('/check-availability', validate(validators.checkAvailability), controller.checkAvailability);
router.post('/register',           validate(validators.register),          controller.register);
router.post('/verify-otp',         validate(validators.verifyOtp),         controller.verifyOtp);
router.post('/login',              validate(validators.login),              controller.login);
router.post('/forgot-password',    validate(validators.forgotPassword),    controller.forgotPassword);
router.post('/verify-reset-otp',   validate(validators.verifyResetOtp),   controller.verifyResetOtp);
router.post('/reset-password',     validate(validators.resetPassword),     controller.resetPassword);
router.post('/logout',             controller.logout);
router.post('/refresh-token',      controller.refreshToken);

// ── Protected: requires valid access token ────────────────────────────────────
router.get('/me', authenticate, controller.getMe);

module.exports = router;
