'use strict';

const express    = require('express');
const controller = require('../../controllers/admin/achievements.admin.controller');
const { createUploadMiddleware } = require('../../middleware/upload.middleware');

const router = express.Router();

router.get('/', controller.getAchievements);
router.post('/', controller.createAchievement);
router.patch('/:id', controller.updateAchievement);
router.delete('/:id', controller.deleteAchievement);

const mediaUpload = createUploadMiddleware({
  fieldName: 'media',
  maxSizeBytes: 10 * 1024 * 1024,
  allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
});

router.post('/upload-media', mediaUpload, controller.uploadMedia);

module.exports = router;
