'use strict';

const express    = require('express');
const mongoose   = require('mongoose');
const { getRedisClient } = require('../config/redis');
const asyncHandler       = require('../utils/asyncHandler');
const { sendResponse }   = require('../utils/apiResponse');

// ── Sub-routers ───────────────────────────────────────────────────────────────
const authRoutes    = require('./auth.routes');
const studentRoutes = require('./student/profile.routes');
const profileCtrl   = require('../controllers/profile.controller');
const authenticate  = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');

// Admin sub-routers
const adminStudents      = require('./admin/students.routes');
const adminAdmins        = require('./admin/admins.routes');
const adminDeptInfo      = require('./admin/departmentInfo.routes');
const adminBatches       = require('./admin/batches.routes');
const adminAnnouncements = require('./admin/announcements.routes');

// Public sub-router
const publicRoutes  = require('./public.routes');

// Student announcement sub-router
const studentAnnouncements = require('./student/announcement.routes');

const router = express.Router();

// Mount auth routes at /api/v1/auth
router.use('/auth', authRoutes);

// Mount student routes at /api/v1/student
router.use('/student', studentRoutes);

// Mount public routes at /api/v1/public (completely open)
router.use('/public', publicRoutes);

// Mount admin routes under /api/v1/admin (all gated by auth and admin role)
router.use('/admin/students',        authenticate, requireRole('admin'), adminStudents);
router.use('/admin/admins',          authenticate, requireRole('admin'), adminAdmins);
router.use('/admin/department-info', authenticate, requireRole('admin'), adminDeptInfo);
router.use('/admin/batches',         authenticate, requireRole('admin'), adminBatches);
router.use('/admin/announcements',   authenticate, requireRole('admin'), adminAnnouncements);

// Mount student announcement routes at /api/v1/student (auth applied inside the router)
router.use('/student', studentAnnouncements);

// Mount shared skills catalogue lookup (requires authentication)
router.get('/skills-catalogue', authenticate, profileCtrl.getSkillsCatalogue);

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
