'use strict';

const { verifyAccessToken }  = require('../utils/generateTokens');
const User                   = require('../models/User.model');
const { sendResponse }       = require('../utils/apiResponse');

/**
 * auth.middleware.js
 *
 * Reads the `accessToken` httpOnly cookie, verifies it, fetches the user from Mongo,
 * attaches it to req.user, then calls next().
 * On any failure → 401 Unauthorized.
 */
async function authenticate(req, res, next) {
  try {
    const token = req.cookies?.accessToken;

    if (!token) {
      return sendResponse(res, 401, {
        success: false,
        message: 'Authentication required. Please log in.',
        error:   'NO_TOKEN',
      });
    }

    const payload = verifyAccessToken(token);

    // Fetch user — excludes passwordHash by default (select:false)
    const user = await User.findById(payload.sub);

    if (!user) {
      return sendResponse(res, 401, {
        success: false,
        message: 'User not found.',
        error:   'USER_NOT_FOUND',
      });
    }

    if (!user.isActive) {
      return sendResponse(res, 401, {
        success: false,
        message: 'Your account has been deactivated. Please contact admin.',
        error:   'ACCOUNT_INACTIVE',
      });
    }

    req.user = user;
    return next();
  } catch (err) {
    const isExpired = err.name === 'TokenExpiredError';
    return sendResponse(res, 401, {
      success: false,
      message: isExpired ? 'Session expired. Please log in again.' : 'Invalid token.',
      error:   isExpired ? 'TOKEN_EXPIRED' : 'INVALID_TOKEN',
    });
  }
}

module.exports = authenticate;
