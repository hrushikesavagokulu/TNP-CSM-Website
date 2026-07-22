'use strict';

const ResumeTemplate     = require('../../models/ResumeTemplate.model');
const storage            = require('../../services/storage.service');
const { sendResponse }   = require('../../utils/apiResponse');
const asyncHandler       = require('../../utils/asyncHandler');

// ── List ─────────────────────────────────────────────────────────────────────
const list = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.category) filter.category = req.query.category;
  const items = await ResumeTemplate.find(filter).sort({ order: 1, createdAt: -1 });
  return sendResponse(res, 200, { success: true, data: items });
});

// ── Create ────────────────────────────────────────────────────────────────────
const create = asyncHandler(async (req, res) => {
  const { title, description, category, order, fileType } = req.body;
  if (!title) return sendResponse(res, 400, { success: false, message: 'Title is required.', error: 'MISSING_FIELDS' });

  // fileUrl comes via upload — stored by the upload route; accept as body param here after upload
  const { fileUrl, previewImageUrl } = req.body;
  if (!fileUrl) return sendResponse(res, 400, { success: false, message: 'Template file URL is required.', error: 'MISSING_FILE' });

  const item = await ResumeTemplate.create({
    title, description: description || '', category: category || 'general',
    previewImageUrl: previewImageUrl || '', fileUrl, fileType: fileType || 'docx',
    order: order !== undefined ? Number(order) : 0,
    createdBy: req.user._id,
  });
  return sendResponse(res, 201, { success: true, data: item, message: 'Template created.' });
});

// ── Update ────────────────────────────────────────────────────────────────────
const update = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updates = {};
  const fields = ['title', 'description', 'category', 'order', 'fileUrl', 'fileType', 'previewImageUrl'];
  fields.forEach((f) => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });
  if (updates.order) updates.order = Number(updates.order);

  const item = await ResumeTemplate.findByIdAndUpdate(id, { $set: updates }, { new: true, runValidators: true });
  if (!item) return sendResponse(res, 404, { success: false, message: 'Template not found.', error: 'NOT_FOUND' });
  return sendResponse(res, 200, { success: true, data: item, message: 'Template updated.' });
});

// ── Delete ────────────────────────────────────────────────────────────────────
const remove = asyncHandler(async (req, res) => {
  const item = await ResumeTemplate.findByIdAndDelete(req.params.id);
  if (!item) return sendResponse(res, 404, { success: false, message: 'Template not found.', error: 'NOT_FOUND' });
  return sendResponse(res, 200, { success: true, message: 'Template deleted.' });
});

// ── Upload template file ──────────────────────────────────────────────────────
const uploadTemplateFile = asyncHandler(async (req, res) => {
  if (!req.file) return sendResponse(res, 400, { success: false, message: 'No file provided.', error: 'NO_FILE' });
  const templateId = req.query.templateId || Date.now().toString();
  const key = `resume-templates/${templateId}/${req.file.originalname}`;
  const fileUrl = await storage.uploadFile({ buffer: req.file.buffer, mimeType: req.file.mimetype, key });
  const fileType = req.file.originalname.endsWith('.pdf') ? 'pdf' : 'docx';
  return sendResponse(res, 200, { success: true, data: { fileUrl, fileType }, message: 'Template file uploaded.' });
});

// ── Upload preview image ──────────────────────────────────────────────────────
const uploadPreviewImage = asyncHandler(async (req, res) => {
  if (!req.file) return sendResponse(res, 400, { success: false, message: 'No image provided.', error: 'NO_FILE' });
  const templateId = req.query.templateId || Date.now().toString();
  const ext = require('path').extname(req.file.originalname).toLowerCase();
  const key = `resume-templates/${templateId}/preview${ext}`;
  const fileUrl = await storage.uploadFile({ buffer: req.file.buffer, mimeType: req.file.mimetype, key });
  return sendResponse(res, 200, { success: true, data: { fileUrl }, message: 'Preview image uploaded.' });
});

module.exports = { list, create, update, remove, uploadTemplateFile, uploadPreviewImage };
