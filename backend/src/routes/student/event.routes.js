'use strict';

const express = require('express');
const multer = require('multer');
const {
  getStudentEvents,
  getEventBySlug,
  submitStudentInfo,
  uploadCertificate,
  getMySubmission,
  deleteSingleCertificate,
} = require('../../controllers/event.controller');
const authenticate = require('../../middleware/auth.middleware');

// Multer memory storage configuration for certificate uploads (10MB max limit)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (_req, file, cb) => {
    const isImage = file.mimetype.startsWith('image/');
    const isPdf = file.mimetype === 'application/pdf';
    if (isImage || isPdf) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file format. Only Image files and PDF documents are allowed.'));
    }
  },
});

const router = express.Router();

// Open route: Fetch event by shareable slug
router.get('/events/by-slug/:shareableSlug', getEventBySlug);

// Auth required routes for students
router.use(authenticate);

router.get('/events', getStudentEvents);
router.post('/events/:id/submit-info', submitStudentInfo);
router.post('/events/:id/upload-certificate', upload.single('file'), uploadCertificate);
router.get('/events/:id/my-submission', getMySubmission);
router.delete('/events/:id/certificates/:certId', deleteSingleCertificate);

module.exports = router;
