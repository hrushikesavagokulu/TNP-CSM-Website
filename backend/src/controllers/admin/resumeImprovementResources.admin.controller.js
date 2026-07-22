'use strict';

const ResumeImprovementResource = require('../../models/ResumeImprovementResource.model');
const { sendResponse }          = require('../../utils/apiResponse');
const asyncHandler              = require('../../utils/asyncHandler');

const list = asyncHandler(async (req, res) => {
  const items = await ResumeImprovementResource.find().sort({ order: 1, createdAt: -1 });
  return sendResponse(res, 200, { success: true, data: items });
});

const create = asyncHandler(async (req, res) => {
  const { title, contentBlocks, order } = req.body;
  if (!title) return sendResponse(res, 400, { success: false, message: 'Title is required.', error: 'MISSING_FIELDS' });
  const item = await ResumeImprovementResource.create({
    title, contentBlocks: contentBlocks || [],
    order: order !== undefined ? Number(order) : 0,
  });
  return sendResponse(res, 201, { success: true, data: item, message: 'Resource created.' });
});

const update = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updates = {};
  ['title', 'contentBlocks', 'order'].forEach((f) => {
    if (req.body[f] !== undefined) updates[f] = req.body[f];
  });
  if (updates.order !== undefined) updates.order = Number(updates.order);
  const item = await ResumeImprovementResource.findByIdAndUpdate(id, { $set: updates }, { new: true, runValidators: true });
  if (!item) return sendResponse(res, 404, { success: false, message: 'Resource not found.', error: 'NOT_FOUND' });
  return sendResponse(res, 200, { success: true, data: item, message: 'Resource updated.' });
});

const remove = asyncHandler(async (req, res) => {
  const item = await ResumeImprovementResource.findByIdAndDelete(req.params.id);
  if (!item) return sendResponse(res, 404, { success: false, message: 'Resource not found.', error: 'NOT_FOUND' });
  return sendResponse(res, 200, { success: true, message: 'Resource deleted.' });
});

module.exports = { list, create, update, remove };
