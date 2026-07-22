'use strict';

const AtsCheckerLink   = require('../../models/AtsCheckerLink.model');
const { sendResponse } = require('../../utils/apiResponse');
const asyncHandler     = require('../../utils/asyncHandler');

const list = asyncHandler(async (req, res) => {
  const items = await AtsCheckerLink.find().sort({ order: 1, createdAt: 1 });
  return sendResponse(res, 200, { success: true, data: items });
});

const create = asyncHandler(async (req, res) => {
  const { name, description, url, order } = req.body;
  if (!name || !url) return sendResponse(res, 400, { success: false, message: 'Name and URL are required.', error: 'MISSING_FIELDS' });
  const item = await AtsCheckerLink.create({
    name, description: description || '', url,
    order: order !== undefined ? Number(order) : 0,
  });
  return sendResponse(res, 201, { success: true, data: item, message: 'ATS link created.' });
});

const update = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updates = {};
  ['name', 'description', 'url', 'order'].forEach((f) => {
    if (req.body[f] !== undefined) updates[f] = req.body[f];
  });
  if (updates.order !== undefined) updates.order = Number(updates.order);
  const item = await AtsCheckerLink.findByIdAndUpdate(id, { $set: updates }, { new: true, runValidators: true });
  if (!item) return sendResponse(res, 404, { success: false, message: 'ATS link not found.', error: 'NOT_FOUND' });
  return sendResponse(res, 200, { success: true, data: item, message: 'ATS link updated.' });
});

const remove = asyncHandler(async (req, res) => {
  const item = await AtsCheckerLink.findByIdAndDelete(req.params.id);
  if (!item) return sendResponse(res, 404, { success: false, message: 'ATS link not found.', error: 'NOT_FOUND' });
  return sendResponse(res, 200, { success: true, message: 'ATS link deleted.' });
});

module.exports = { list, create, update, remove };
