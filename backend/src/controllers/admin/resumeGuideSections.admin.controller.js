'use strict';

const ResumeGuideSection = require('../../models/ResumeGuideSection.model');
const { sendResponse }   = require('../../utils/apiResponse');
const asyncHandler       = require('../../utils/asyncHandler');

// ── List (sorted by sectionOrder) ──────────────────────────────────────────────
const list = asyncHandler(async (req, res) => {
  const items = await ResumeGuideSection.find().sort({ sectionOrder: 1 });
  return sendResponse(res, 200, { success: true, data: items });
});

// ── Create ─────────────────────────────────────────────────────────────────────
const create = asyncHandler(async (req, res) => {
  const { sectionTitle, sectionOrder, contentBlocks, isRequired } = req.body;
  if (!sectionTitle) return sendResponse(res, 400, { success: false, message: 'Section title is required.', error: 'MISSING_FIELDS' });

  // Default sectionOrder to last+1
  let order = sectionOrder;
  if (order === undefined) {
    const last = await ResumeGuideSection.findOne().sort({ sectionOrder: -1 });
    order = last ? last.sectionOrder + 1 : 0;
  }

  const item = await ResumeGuideSection.create({
    sectionTitle,
    sectionOrder: Number(order),
    contentBlocks: contentBlocks || [],
    isRequired: isRequired !== undefined ? isRequired : true,
  });
  return sendResponse(res, 201, { success: true, data: item, message: 'Section created.' });
});

// ── Update ─────────────────────────────────────────────────────────────────────
const update = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updates = {};
  const fields = ['sectionTitle', 'sectionOrder', 'contentBlocks', 'isRequired'];
  fields.forEach((f) => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });
  if (updates.sectionOrder !== undefined) updates.sectionOrder = Number(updates.sectionOrder);

  const item = await ResumeGuideSection.findByIdAndUpdate(id, { $set: updates }, { new: true, runValidators: true });
  if (!item) return sendResponse(res, 404, { success: false, message: 'Section not found.', error: 'NOT_FOUND' });
  return sendResponse(res, 200, { success: true, data: item, message: 'Section updated.' });
});

// ── Delete ─────────────────────────────────────────────────────────────────────
const remove = asyncHandler(async (req, res) => {
  const item = await ResumeGuideSection.findByIdAndDelete(req.params.id);
  if (!item) return sendResponse(res, 404, { success: false, message: 'Section not found.', error: 'NOT_FOUND' });
  return sendResponse(res, 200, { success: true, message: 'Section deleted.' });
});

// ── Bulk Reorder ────────────────────────────────────────────────────────────────
// Body: { items: [{ id, sectionOrder }, ...] }
const reorder = asyncHandler(async (req, res) => {
  const { items } = req.body;
  if (!Array.isArray(items) || items.length === 0) {
    return sendResponse(res, 400, { success: false, message: 'items array required.', error: 'MISSING_FIELDS' });
  }
  const ops = items.map(({ id, sectionOrder }) => ({
    updateOne: { filter: { _id: id }, update: { $set: { sectionOrder: Number(sectionOrder) } } },
  }));
  await ResumeGuideSection.bulkWrite(ops);
  return sendResponse(res, 200, { success: true, message: 'Sections reordered.' });
});

module.exports = { list, create, update, remove, reorder };
