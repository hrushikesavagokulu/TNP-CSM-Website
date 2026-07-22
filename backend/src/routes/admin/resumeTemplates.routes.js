'use strict';

const express    = require('express');
const router     = express.Router();
const ctrl       = require('../../controllers/admin/resumeTemplates.admin.controller');
const { createUploadMiddleware } = require('../../middleware/upload.middleware');

const fileUpload = createUploadMiddleware({
  fieldName: 'file',
  maxSizeBytes: 20 * 1024 * 1024,
  allowedMimeTypes: [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],
});

const imageUpload = createUploadMiddleware({
  fieldName: 'image',
  maxSizeBytes: 5 * 1024 * 1024,
  allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
});

router.get('/',                      ctrl.list);
router.post('/',                     ctrl.create);
router.patch('/:id',                 ctrl.update);
router.delete('/:id',                ctrl.remove);
router.post('/upload-file',          fileUpload,  ctrl.uploadTemplateFile);
router.post('/upload-preview',       imageUpload, ctrl.uploadPreviewImage);

module.exports = router;
