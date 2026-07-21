'use strict';

const LearningResource = require('../models/LearningResource.model');
const { sendResponse } = require('../utils/apiResponse');
const asyncHandler     = require('../utils/asyncHandler');

// ── GET /student/learning-resources ──────────────────────────────────────────
const getLearningResources = asyncHandler(async (req, res) => {
  const items = await LearningResource.find()
    .sort({ skillName: 1, order: 1 })
    .lean();

  return sendResponse(res, 200, {
    success: true,
    data: items,
    message: 'Learning resources retrieved.',
  });
});

module.exports = { getLearningResources };
