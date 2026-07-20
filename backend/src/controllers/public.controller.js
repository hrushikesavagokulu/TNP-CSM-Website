'use strict';

const DepartmentInfo = require('../models/DepartmentInfo.model');
const FacultyLink    = require('../models/FacultyLink.model');
const SchemeLink     = require('../models/SchemeLink.model');
const { sendResponse } = require('../utils/apiResponse');
const asyncHandler   = require('../utils/asyncHandler');

// ── GET /public/department-info ──────────────────────────────────────────────
const getDepartmentInfo = asyncHandler(async (req, res) => {
  let info = await DepartmentInfo.findOne();
  if (!info) {
    // Return a sensible default structure rather than throwing an error
    info = {
      motto: '',
      vision: '',
      mission: '',
      heroImageUrl: '',
    };
  }
  return sendResponse(res, 200, {
    success: true,
    data: info,
    message: 'Department info loaded successfully',
  });
});

// ── GET /public/faculty-links ────────────────────────────────────────────────
const getFacultyLinks = asyncHandler(async (req, res) => {
  const list = await FacultyLink.find().sort({ order: 1 });
  return sendResponse(res, 200, {
    success: true,
    data: list,
    message: 'Faculty links loaded successfully',
  });
});

// ── GET /public/scheme-links ─────────────────────────────────────────────────
const getSchemeLinks = asyncHandler(async (req, res) => {
  const list = await SchemeLink.find().sort({ order: 1 });
  return sendResponse(res, 200, {
    success: true,
    data: list,
    message: 'Scheme syllabus links loaded successfully',
  });
});

module.exports = {
  getDepartmentInfo,
  getFacultyLinks,
  getSchemeLinks,
};
