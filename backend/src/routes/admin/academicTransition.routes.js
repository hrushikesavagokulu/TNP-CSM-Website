'use strict';

const express = require('express');
const router  = express.Router();

const {
  previewAcademicRollover,
  executeAcademicRollover,
  adjustStudentYear,
  bulkAdjustYear,
} = require('../../controllers/admin/academicTransition.admin.controller');

router.get('/preview', previewAcademicRollover);
router.post('/execute-rollover', executeAcademicRollover);
router.put('/students/:studentId/adjust-year', adjustStudentYear);
router.post('/bulk-adjust', bulkAdjustYear);

module.exports = router;
