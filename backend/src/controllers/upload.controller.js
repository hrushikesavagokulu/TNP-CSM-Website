'use strict';

const path           = require('path');
const storage        = require('../services/storage.service');
const { sendResponse } = require('../utils/apiResponse');
const asyncHandler     = require('../utils/asyncHandler');

/**
 * uploadGeneric — Universal file upload handler.
 * Accepts any uploaded file (images, PDFs, documents, videos).
 * Uploads to MinIO storage and returns public fileUrl.
 */
const uploadGeneric = asyncHandler(async (req, res) => {
  const file = req.file;

  if (!file) {
    return sendResponse(res, 400, {
      success: false,
      message: 'No file uploaded. Please select a file to upload.',
      error: 'NO_FILE',
    });
  }

  const ext = path.extname(file.originalname).toLowerCase() || '.bin';
  const cleanName = file.originalname.replace(/[^a-zA-Z0-9_.-]/g, '_');
  const key = `uploads/${Date.now()}-${cleanName}`;

  const fileUrl = await storage.uploadFile({
    buffer: file.buffer,
    mimeType: file.mimetype,
    key,
  });

  return sendResponse(res, 200, {
    success: true,
    data: {
      url: fileUrl,
      fileUrl,
      key,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
    },
    message: 'File uploaded successfully.',
  });
});

module.exports = { uploadGeneric };
