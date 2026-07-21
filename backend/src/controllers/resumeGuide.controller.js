'use strict';

const ResumeGuide      = require('../models/ResumeGuide.model');
const { sendResponse } = require('../utils/apiResponse');
const asyncHandler     = require('../utils/asyncHandler');

// ── GET /student/resume-guide ─────────────────────────────────────────────────
const getResumeGuide = asyncHandler(async (req, res) => {
  const items = await ResumeGuide.find()
    .sort({ order: 1 })
    .lean();

  return sendResponse(res, 200, {
    success: true,
    data: items,
    message: 'Resume guide retrieved.',
  });
});

module.exports = { getResumeGuide };
