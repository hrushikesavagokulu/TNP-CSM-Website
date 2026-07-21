'use strict';

const Certification    = require('../models/Certification.model');
const { sendResponse } = require('../utils/apiResponse');
const asyncHandler     = require('../utils/asyncHandler');

// ── GET /student/certifications?semester= ────────────────────────────────────
const getCertifications = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.semester) {
    filter.semester = parseInt(req.query.semester, 10);
  }

  const items = await Certification.find(filter)
    .sort({ semester: 1, order: 1 })
    .lean();

  return sendResponse(res, 200, {
    success: true,
    data: items,
    message: 'Certifications retrieved.',
  });
});

module.exports = { getCertifications };
