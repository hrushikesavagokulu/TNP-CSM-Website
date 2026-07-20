'use strict';

/**
 * asyncHandler.js
 *
 * Wraps async route handlers so that any rejected Promise is forwarded
 * to Express's next(err) instead of causing an UnhandledPromiseRejection.
 *
 * Usage:
 *   router.get('/path', asyncHandler(async (req, res) => {
 *     const data = await someAsyncOperation();
 *     sendResponse(res, 200, { data });
 *   }));
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
