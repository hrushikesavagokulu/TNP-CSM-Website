'use strict';

const AlumniRepo       = require('../models/AlumniRepo.model');
const { sendResponse } = require('../utils/apiResponse');
const asyncHandler     = require('../utils/asyncHandler');

// ── GET /student/alumni-repos?company= ───────────────────────────────────────
const getAlumniRepos = asyncHandler(async (req, res) => {
  const filter = {};

  if (req.query.company) {
    filter['companiesSecured.company'] = req.query.company;
  }

  const alumni = await AlumniRepo.find(filter)
    .populate({
      path: 'companiesSecured.company',
      select: 'name status academicYear ctc',
    })
    .sort({ createdAt: -1 })
    .lean();

  return sendResponse(res, 200, {
    success: true,
    data: alumni,
    message: 'Alumni repository retrieved.',
  });
});

module.exports = { getAlumniRepos };
