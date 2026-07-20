'use strict';

const express = require('express');
const controller = require('../../controllers/admin/students.admin.controller');
const { createUploadMiddleware } = require('../../middleware/upload.middleware');

const router = express.Router();

// Bulk spreadsheet nominal upload: 10MB, xlsx/csv/xls formats
const rosterUpload = createUploadMiddleware({
  fieldName: 'file',
  maxSizeBytes: 10 * 1024 * 1024,
  allowedMimeTypes: [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'application/vnd.ms-excel',                                         // .xls
    'text/csv',                                                          // .csv
    'application/csv',
    'text/x-csv',
  ],
});

router.get('/',                  controller.getStudents);
router.post('/',                 controller.addStudentNominal);
router.post('/bulk-import',      rosterUpload, controller.bulkImportStudents);
router.patch('/:id',             controller.updateStudent);
router.delete('/:id',           controller.deleteStudent);

module.exports = router;
