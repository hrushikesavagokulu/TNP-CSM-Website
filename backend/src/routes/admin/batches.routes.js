'use strict';

const express    = require('express');
const controller = require('../../controllers/admin/batches.admin.controller');
const { createUploadMiddleware } = require('../../middleware/upload.middleware');

const router = express.Router();

// Reuse the same spreadsheet upload config as student bulk-import (Phase 3)
const memberUpload = createUploadMiddleware({
  fieldName: 'file',
  maxSizeBytes: 10 * 1024 * 1024,
  allowedMimeTypes: [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'application/vnd.ms-excel',                                           // .xls
    'text/csv',
    'application/csv',
    'text/x-csv',
  ],
});

// ── Batch CRUD ────────────────────────────────────────────────────────────────
router.get('/',    controller.getBatches);
router.post('/',   controller.createBatch);
router.patch('/:id',  controller.renameBatch);
router.delete('/:id', controller.deleteBatch);

// ── Member management ─────────────────────────────────────────────────────────
router.get('/:id/members',                        controller.getMembers);
router.post('/:id/add-members',                   controller.addMembers);
router.post('/:id/add-members/bulk-import',  memberUpload, controller.bulkImportMembers);
router.post('/:id/remove-members',                controller.removeMembers);

module.exports = router;
