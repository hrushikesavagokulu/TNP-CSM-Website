'use strict';

const multer = require('multer');

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 15 * 1024 * 1024, // 15MB max limit for documents/images/videos
  },
});

// Middleware that accepts file under ANY field name
const genericUpload = upload.any();

module.exports = (req, res, next) => {
  genericUpload(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'File size exceeds max limit of 15MB.',
          error: 'FILE_TOO_LARGE',
        });
      }
      return res.status(400).json({
        success: false,
        message: err.message || 'File upload error.',
        error: 'UPLOAD_ERROR',
      });
    }

    // Attach single file to req.file if array was populated
    if (req.files && req.files.length > 0) {
      req.file = req.files[0];
    }
    next();
  });
};
