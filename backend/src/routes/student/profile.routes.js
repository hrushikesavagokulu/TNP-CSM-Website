'use strict';

const express    = require('express');
const controller = require('../../controllers/profile.controller');
const authenticate = require('../../middleware/auth.middleware');
const { createUploadMiddleware } = require('../../middleware/upload.middleware');

const router = express.Router();

// All student routes require authentication
router.use(authenticate);

// ── Profile views and update ──────────────────────────────────────────────────
router.get('/profile/me', controller.getMe);
router.get('/profile/:rollNo', controller.getProfileByRollNo);
router.patch('/profile/me', controller.updateMe);

// ── Password management ───────────────────────────────────────────────────────
router.post('/profile/change-password', controller.changePassword);

// ── Search directory ──────────────────────────────────────────────────────────
router.get('/search', controller.searchStudents);

// ── File uploads ──────────────────────────────────────────────────────────────

// Photo upload: 5MB limit, images only
const photoUpload = createUploadMiddleware({
  fieldName: 'photo',
  maxSizeBytes: 5 * 1024 * 1024,
  allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
});
router.post('/profile/upload-photo', photoUpload, controller.uploadPhoto);

// Achievement doc upload: 10MB limit, documents and images
const docUpload = createUploadMiddleware({
  fieldName: 'document',
  maxSizeBytes: 10 * 1024 * 1024,
  allowedMimeTypes: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png',
    'image/webp'
  ],
});
router.post('/profile/upload-achievement', docUpload, controller.uploadAchievement);

module.exports = router;
