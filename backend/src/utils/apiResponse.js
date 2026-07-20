'use strict';

/**
 * apiResponse.js
 * 
 * Centralised response helper. Every controller must use this — never
 * call res.json() directly — so the response envelope stays consistent
 * across the entire API:
 *
 *   { success: boolean, data: any, message: string, error: any }
 *
 * Usage:
 *   sendResponse(res, 200, { success: true, data: { ... }, message: 'OK' });
 *   sendResponse(res, 400, { success: false, message: 'Validation failed', error: errors });
 */
function sendResponse(res, statusCode, { success = true, data = null, message = '', error = null } = {}) {
  const body = { success, message };

  if (data  !== null) body.data  = data;
  if (error !== null) body.error = error;

  return res.status(statusCode).json(body);
}

module.exports = { sendResponse };
