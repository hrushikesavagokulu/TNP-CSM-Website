'use strict';

const multer = require('multer');

// Store file in memory first so we can validate it before writing to disk
const memoryStorage = multer.memoryStorage();

/**
 * createUploadMiddleware
 *
 * Parameterized helper to generate upload middleware for specific routes.
 *
 * @param {Object} options
 * @param {string} options.fieldName - Name of the form field (e.g. 'photo', 'document')
 * @param {number} options.maxSizeBytes - Max size in bytes (e.g. 5 * 1024 * 1024)
 * @param {string[]} options.allowedMimeTypes - Allowed MIME types (e.g. ['image/jpeg', 'image/png'])
 */
function createUploadMiddleware({ fieldName, maxSizeBytes, allowedMimeTypes }) {
  const upload = multer({
    storage: memoryStorage,
    limits: {
      fileSize: maxSizeBytes,
    },
    fileFilter: (req, file, cb) => {
      if (!allowedMimeTypes.includes(file.mimetype)) {
        const error = new Error(`Invalid file type. Allowed types: ${allowedMimeTypes.join(', ')}`);
        error.statusCode = 400;
        return cb(error, false);
      }
      cb(null, true);
    },
  }).single(fieldName);

  return (req, res, next) => {
    upload(req, res, (err) => {
      if (err) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          const limitMB = (maxSizeBytes / (1024 * 1024)).toFixed(0);
          const error = new Error(`File is too large. Max allowed size is ${limitMB}MB.`);
          error.statusCode = 400;
          return next(error);
        }
        return next(err);
      }
      next();
    });
  };
}

module.exports = { createUploadMiddleware };
