'use strict';

const ResumeTemplate            = require('../../models/ResumeTemplate.model');
const ResumeGuideSection        = require('../../models/ResumeGuideSection.model');
const ResumeReference           = require('../../models/ResumeReference.model');
const AtsCheckerLink            = require('../../models/AtsCheckerLink.model');
const ResumeImprovementResource = require('../../models/ResumeImprovementResource.model');
const { sendResponse }          = require('../../utils/apiResponse');
const asyncHandler              = require('../../utils/asyncHandler');

const getTemplates = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.category) filter.category = req.query.category;
  const items = await ResumeTemplate.find(filter).sort({ order: 1 });
  return sendResponse(res, 200, { success: true, data: items });
});

const getBuildingGuide = asyncHandler(async (req, res) => {
  const items = await ResumeGuideSection.find().sort({ sectionOrder: 1 });
  return sendResponse(res, 200, { success: true, data: items });
});

const getReferences = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.category) filter.category = req.query.category;
  const items = await ResumeReference.find(filter).sort({ order: 1 });
  return sendResponse(res, 200, { success: true, data: items });
});

const getAtsLinks = asyncHandler(async (req, res) => {
  const items = await AtsCheckerLink.find().sort({ order: 1 });
  return sendResponse(res, 200, { success: true, data: items });
});

const getImprovementResources = asyncHandler(async (req, res) => {
  const items = await ResumeImprovementResource.find().sort({ order: 1 });
  return sendResponse(res, 200, { success: true, data: items });
});

module.exports = { getTemplates, getBuildingGuide, getReferences, getAtsLinks, getImprovementResources };
