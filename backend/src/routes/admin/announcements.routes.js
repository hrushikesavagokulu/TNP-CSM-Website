'use strict';

const express    = require('express');
const controller = require('../../controllers/admin/announcements.admin.controller');

const router = express.Router();

const { createUploadMiddleware } = require('../../middleware/upload.middleware');

const attachmentUpload = createUploadMiddleware({
  fieldName: 'file',
  maxSizeBytes: 50 * 1024 * 1024, // 50MB max size limit
  allowedMimeTypes: [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'video/mp4', 'video/webm', 'video/ogg', 'video/quicktime',
    'application/pdf',
    'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain'
  ]
});

router.get('/',         controller.getAnnouncements);
router.post('/',        controller.createAnnouncement);
router.patch('/:id',    controller.updateAnnouncement);
router.delete('/:id',   controller.deleteAnnouncement);
router.post('/upload-attachment', attachmentUpload, controller.uploadAttachment);

module.exports = router;
