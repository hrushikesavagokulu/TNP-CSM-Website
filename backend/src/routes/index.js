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
const adminAchievements  = require('./admin/achievements.routes');
const { getOverviewStats } = require('../controllers/admin/overview.admin.controller');

// Public sub-router
const publicRoutes  = require('./public.routes');

// Student announcement & achievement sub-routers
const studentAnnouncements = require('./student/announcement.routes');
const studentAchievements  = require('./student/achievement.routes');
const studentContent       = require('./student/content.routes');

// Phase 7 — content module admin routes (3 still use the factory; resume-guide replaced)
const { roadmapRouter, certRouter, resourceRouter } = require('./admin/content.routes');
// Resume Guide v2 — 5 dedicated admin routers
const adminResumeTemplates       = require('./admin/resumeTemplates.routes');
const adminResumeGuideSections   = require('./admin/resumeGuideSections.routes');
const adminResumeReferences      = require('./admin/resumeReferences.routes');
const adminAtsCheckerLinks       = require('./admin/atsCheckerLinks.routes');
const adminResumeImprovements    = require('./admin/resumeImprovementResources.routes');
// Student Resume Guide routes
const studentResumeGuide         = require('./student/resumeGuide.routes');
// Phase 8 & 10 admin routers
const adminCompanies   = require('./admin/companies.routes');
const adminAlumniRepos = require('./admin/alumniRepos.routes');
const adminChat        = require('./admin/chat.routes');

// Student Phase 8 & 10 routers
const studentCompanies   = require('./student/companyInfo.routes');
const studentAlumniRepos = require('./student/alumniRepo.routes');
const studentChat        = require('./student/chat.routes');

// Programming & DSA routes
const adminDsa   = require('./admin/dsa.routes');
const studentDsa = require('./student/dsa.routes');

const { uploadGeneric }     = require('../controllers/upload.controller');
const genericUpload         = require('../middleware/genericUpload.middleware');

const router = express.Router();

// Mount auth routes at /api/v1/auth
router.use('/auth', authRoutes);

// Universal File Upload Endpoints
router.post('/upload',         authenticate, genericUpload, uploadGeneric);
router.post('/student/upload', authenticate, genericUpload, uploadGeneric);
router.post('/admin/upload',   authenticate, requireRole('admin'), genericUpload, uploadGeneric);

// Mount student routes at /api/v1/student
router.use('/student', studentRoutes);

// Mount public routes at /api/v1/public (completely open)
router.use('/public', publicRoutes);

// Mount admin routes under /api/v1/admin (all gated by auth and admin role)
router.use('/admin/students',          authenticate, requireRole('admin'), adminStudents);
router.use('/admin/admins',            authenticate, requireRole('admin'), adminAdmins);
router.use('/admin/department-info',   authenticate, requireRole('admin'), adminDeptInfo);
router.use('/admin/batches',           authenticate, requireRole('admin'), adminBatches);
router.use('/admin/announcements',     authenticate, requireRole('admin'), adminAnnouncements);
router.use('/admin/achievements',      authenticate, requireRole('admin'), adminAchievements);
// Phase 7 — content module admin routes (skill roadmap, certs, learning resources)
router.use('/admin/skill-roadmap',     authenticate, requireRole('admin'), roadmapRouter);
router.use('/admin/certifications',    authenticate, requireRole('admin'), certRouter);
router.use('/admin/learning-resources', authenticate, requireRole('admin'), resourceRouter);
// Resume Guide v2 — 5 dedicated admin route groups
router.use('/admin/resume-templates',          authenticate, requireRole('admin'), adminResumeTemplates);
router.use('/admin/resume-guide-sections',     authenticate, requireRole('admin'), adminResumeGuideSections);
router.use('/admin/resume-references',         authenticate, requireRole('admin'), adminResumeReferences);
router.use('/admin/ats-checker-links',         authenticate, requireRole('admin'), adminAtsCheckerLinks);
router.use('/admin/resume-improvement-resources', authenticate, requireRole('admin'), adminResumeImprovements);
// Phase 8 — companies & alumni admin routes
router.use('/admin/companies',         authenticate, requireRole('admin'), adminCompanies);
router.use('/admin/alumni-repos',      authenticate, requireRole('admin'), adminAlumniRepos);
router.use('/admin/alumni',            authenticate, requireRole('admin'), adminAlumniRepos);
// Phase 10 — chat admin routes
router.use('/admin/chat',              authenticate, requireRole('admin'), adminChat);
router.use('/admin/connect-sphere',    authenticate, requireRole('admin'), adminChat);
// Programming & DSA admin routes
router.use('/admin/dsa',               authenticate, requireRole('admin'), adminDsa);
// Phase 11 — Admin overview stats
router.get('/admin/overview-stats',    authenticate, requireRole('admin'), asyncHandler(getOverviewStats));

// Mount student announcement & achievement routes at /api/v1/student
router.use('/student', studentAnnouncements);
router.use('/student', studentAchievements);
// Phase 7 — student content routes
router.use('/student', studentContent);
// Phase 8 — student company & alumni routes
router.use('/student', studentCompanies);
router.use('/student', studentAlumniRepos);
// Phase 10 — student chat routes
router.use('/student', studentChat);
// Resume Guide v2 — student routes
router.use('/student', studentResumeGuide);
// Programming & DSA student routes
router.use('/student', studentDsa);

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
