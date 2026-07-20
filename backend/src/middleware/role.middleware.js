'use strict';

const { sendResponse } = require('../utils/apiResponse');

/**
 * role.middleware.js
 *
 * Factory that returns a middleware enforcing that req.user.role is one of the
 * allowed roles. Must be used AFTER authenticate middleware.
 *
 * Usage: router.get('/admin-only', authenticate, requireRole('admin'), handler)
 */
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return sendResponse(res, 401, {
        success: false,
        message: 'Authentication required.',
        error:   'NOT_AUTHENTICATED',
      });
    }

    if (!roles.includes(req.user.role)) {
      return sendResponse(res, 403, {
        success: false,
        message: `Access denied. Required role: ${roles.join(' or ')}.`,
        error:   'FORBIDDEN',
      });
    }

    return next();
  };
}

module.exports = { requireRole };
