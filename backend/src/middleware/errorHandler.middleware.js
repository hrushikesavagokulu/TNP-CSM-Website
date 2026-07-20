'use strict';

/**
 * errorHandler.middleware.js
 *
 * Centralised Express error handler — must be mounted LAST in app.js.
 * Catches any error forwarded via next(err) (including asyncHandler rejections).
 *
 * Response shape:
 *   { success: false, message: string, error: string | object }
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  // Always log the full error server-side
  console.error(`[ErrorHandler] ${err.stack || err.message}`);

  // Determine HTTP status code
  let statusCode = err.statusCode || err.status || 500;

  // Mongoose validation error → 400
  if (err.name === 'ValidationError') {
    statusCode = 400;
  }

  // Mongoose duplicate key error → 409
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    err.message = `Duplicate value for ${field}`;
  }

  // JWT errors → 401
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    statusCode = 401;
    err.message = err.name === 'TokenExpiredError' ? 'Token expired' : 'Invalid token';
  }

  // Never leak internal details in production
  const isDev  = process.env.NODE_ENV !== 'production';
  const errOut = isDev ? (err.stack || err.message) : err.message;

  return res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal server error',
    error:   errOut,
  });
};

module.exports = errorHandler;
