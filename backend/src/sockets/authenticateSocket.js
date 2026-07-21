'use strict';

const jwt  = require('jsonwebtoken');
const User = require('../models/User.model');

/**
 * authenticateSocket — Shared socket authentication middleware.
 * Reads accessToken from cookie or handshake auth/headers.
 * Verifies JWT token and attaches user to socket.
 */
async function authenticateSocket(socket, next) {
  try {
    let token = null;

    // 1. Try handshake auth
    if (socket.handshake.auth && socket.handshake.auth.token) {
      token = socket.handshake.auth.token;
    }

    // 2. Try cookie header
    if (!token && socket.handshake.headers && socket.handshake.headers.cookie) {
      const cookies = socket.handshake.headers.cookie.split(';').reduce((acc, c) => {
        const [k, v] = c.trim().split('=');
        if (k && v) acc[k] = decodeURIComponent(v);
        return acc;
      }, {});
      token = cookies.accessToken;
    }

    // 3. Try Authorization header
    if (!token && socket.handshake.headers && socket.handshake.headers.authorization) {
      const parts = socket.handshake.headers.authorization.split(' ');
      if (parts[0] === 'Bearer' && parts[1]) {
        token = parts[1];
      }
    }

    if (!token) {
      return next(new Error('Authentication failed: Missing token'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId || decoded.id).select('-passwordHash').lean();

    if (!user || !user.isActive) {
      return next(new Error('Authentication failed: User invalid or inactive'));
    }

    socket.user = user;
    return next();
  } catch (err) {
    return next(new Error(`Authentication failed: ${err.message}`));
  }
}

module.exports = authenticateSocket;
