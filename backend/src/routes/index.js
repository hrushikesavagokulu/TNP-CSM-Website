'use strict';

const express    = require('express');
const mongoose   = require('mongoose');
const { getRedisClient } = require('../config/redis');
const asyncHandler       = require('../utils/asyncHandler');
const { sendResponse }   = require('../utils/apiResponse');

// ── Sub-routers ───────────────────────────────────────────────────────────────
const authRoutes = require('./auth.routes');

const router = express.Router();

// Mount auth routes at /api/v1/auth
router.use('/auth', authRoutes);

// ── GET /api/v1/health ────────────────────────────────────────────────────────
router.get(
  '/health',
  asyncHandler(async (_req, res) => {
    // Mongo status
    const mongoState = mongoose.connection.readyState;
    // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
    const mongoStatus = mongoState === 1 ? 'connected' : 'disconnected';

    // Redis status
    let redisStatus = 'disconnected';
    try {
      const redis  = getRedisClient();
      const pong   = await redis.ping();
      redisStatus  = pong === 'PONG' ? 'connected' : 'disconnected';
    } catch {
      redisStatus = 'disconnected';
    }

    const allHealthy = mongoStatus === 'connected' && redisStatus === 'connected';

    return sendResponse(res, allHealthy ? 200 : 503, {
      success: allHealthy,
      data: {
        status: allHealthy ? 'ok' : 'degraded',
        mongo:  mongoStatus,
        redis:  redisStatus,
        uptime: Math.floor(process.uptime()),
        timestamp: new Date().toISOString(),
      },
      message: allHealthy ? 'All systems operational' : 'One or more systems are unavailable',
    });
  })
);

module.exports = router;
