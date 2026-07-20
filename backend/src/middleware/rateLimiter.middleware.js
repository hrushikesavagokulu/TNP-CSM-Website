'use strict';

const rateLimit    = require('express-rate-limit');
const { RedisStore } = require('rate-limit-redis');
const { getRedisClient } = require('../config/redis');

/**
 * rateLimiter.middleware.js
 *
 * Auth route limiter: max 10 requests per 15 minutes per IP.
 * Uses Redis as the store so limits are shared across all instances.
 *
 * IMPORTANT: The limiter is constructed LAZILY on first request, not at
 * module-load time. This ensures getRedisClient() is only called after
 * connectRedis() has completed in server.js startup.
 */

let authLimiter = null;

function getAuthLimiter() {
  if (authLimiter) return authLimiter;

  authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max:      10,
    message: {
      success: false,
      message: 'Too many requests from this IP. Please try again in 15 minutes.',
      error:   'RATE_LIMITED',
    },
    standardHeaders: true,
    legacyHeaders:   false,
    // Store is constructed inside the factory fn — Redis is guaranteed ready by now
    store: new RedisStore({
      sendCommand: (...args) => getRedisClient().call(...args),
    }),
    skipSuccessfulRequests: false,
  });

  return authLimiter;
}

/**
 * Returns a middleware that delegates to the lazily-built limiter.
 * Using a wrapper function means the limiter is only instantiated on first
 * actual HTTP request — well after connectRedis() has run.
 */
function authRateLimiter(req, res, next) {
  return getAuthLimiter()(req, res, next);
}

module.exports = { authRateLimiter };

