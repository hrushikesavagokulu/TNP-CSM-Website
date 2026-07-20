'use strict';

const express = require('express');
const router  = express.Router();
const controller = require('../../controllers/admin/departmentInfo.admin.controller');
const { createUploadMiddleware } = require('../../middleware/upload.middleware');

// ── Department vision/motto/mission ──────────────────────────────────────────
router.get('/',  controller.getDepartmentInfo);
router.patch('/', controller.updateDepartmentInfo);

router.post(
  '/upload-hero-image',
  createUploadMiddleware({
    fieldName: 'image',
    maxSizeBytes: 5 * 1024 * 1024, // 5MB limit
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
  }),
  controller.uploadHeroImage
);

router.post(
  '/upload-faculty-photo',
  createUploadMiddleware({
    fieldName: 'image',
    maxSizeBytes: 2 * 1024 * 1024, // 2MB limit
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
  }),
  controller.uploadFacultyPhoto
);

// ── Faculty links CRUD ────────────────────────────────────────────────────────
router.get('/faculty-links',     controller.getFacultyLinks);
router.post('/faculty-links',    controller.createFacultyLink);
router.patch('/faculty-links/:id',  controller.updateFacultyLink);
router.delete('/faculty-links/:id', controller.deleteFacultyLink);

// ── Scheme syllabus links CRUD ───────────────────────────────────────────────
router.get('/scheme-links',      controller.getSchemeLinks);
router.post('/scheme-links',     controller.createSchemeLink);
router.patch('/scheme-links/:id',   controller.updateSchemeLink);
router.delete('/scheme-links/:id',  controller.deleteSchemeLink);

module.exports = router;
