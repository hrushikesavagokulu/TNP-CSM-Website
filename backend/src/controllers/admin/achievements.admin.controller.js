'use strict';

const Achievement      = require('../../models/Achievement.model');
const storage          = require('../../services/storage.service');
const { sendResponse } = require('../../utils/apiResponse');
const asyncHandler     = require('../../utils/asyncHandler');

// ── GET /admin/achievements ──────────────────────────────────────────────────
const getAchievements = asyncHandler(async (req, res) => {
  const page   = parseInt(req.query.page,  10) || 1;
  const limit  = parseInt(req.query.limit, 10) || 50;
  const search = req.query.search?.trim();
  const skip   = (page - 1) * limit;

  let query = {};
  if (search) {
    query = {
      $or: [
        { $text: { $search: search } },
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ],
    };
  }

  const [items, total] = await Promise.all([
    Achievement.find(query)
      .populate('postedBy', 'name email role')
      .sort({ date: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Achievement.countDocuments(query),
  ]);

  return sendResponse(res, 200, {
    success: true,
    data: items,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    message: 'Department achievements retrieved.',
  });
});

// ── POST /admin/achievements ─────────────────────────────────────────────────
const createAchievement = asyncHandler(async (req, res) => {
  const { title, description = '', date = new Date(), media = [] } = req.body;

  if (!title?.trim()) {
    return sendResponse(res, 400, {
      success: false,
      message: 'Achievement title is required.',
      error: 'MISSING_FIELDS',
    });
  }

  const achievement = await Achievement.create({
    title: title.trim(),
    description: description.trim(),
    date: date ? new Date(date) : new Date(),
    media: Array.isArray(media) ? media : [],
    postedBy: req.user._id,
  });

  const populated = await Achievement.findById(achievement._id)
    .populate('postedBy', 'name email role')
    .lean();

  return sendResponse(res, 201, {
    success: true,
    data: populated,
    message: 'Department achievement created successfully.',
  });
});

// ── PATCH /admin/achievements/:id ────────────────────────────────────────────
const updateAchievement = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, description, date, media } = req.body;

  const existing = await Achievement.findById(id);
  if (!existing) {
    return sendResponse(res, 404, { success: false, message: 'Achievement not found.', error: 'NOT_FOUND' });
  }

  const updates = {};
  if (title       !== undefined) updates.title       = title.trim();
  if (description !== undefined) updates.description = description.trim();
  if (date        !== undefined) updates.date        = new Date(date);
  if (media       !== undefined) updates.media       = Array.isArray(media) ? media : [];

  const updated = await Achievement.findByIdAndUpdate(
    id,
    { $set: updates },
    { new: true, runValidators: true }
  ).populate('postedBy', 'name email role').lean();

  return sendResponse(res, 200, {
    success: true,
    data: updated,
    message: 'Achievement updated successfully.',
  });
});

// ── DELETE /admin/achievements/:id ──────────────────────────────────────────
const deleteAchievement = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const deleted = await Achievement.findByIdAndDelete(id);
  if (!deleted) {
    return sendResponse(res, 404, { success: false, message: 'Achievement not found.', error: 'NOT_FOUND' });
  }
  return sendResponse(res, 200, { success: true, message: 'Achievement deleted.' });
});

// ── POST /admin/achievements/upload-media ───────────────────────────────────
const uploadMedia = asyncHandler(async (req, res) => {
  if (!req.file) {
    return sendResponse(res, 400, {
      success: false,
      message: 'No file provided.',
      error: 'NO_FILE',
    });
  }

  const cleanName = req.file.originalname.replace(/[^a-zA-Z0-9_.-]/g, '_');
  const key     = `achievements-media/${Date.now()}-${cleanName}`;
  const fileUrl = await storage.uploadFile({
    buffer:   req.file.buffer,
    mimeType: req.file.mimetype,
    key,
  });

  return sendResponse(res, 200, {
    success: true,
    data: {
      url:      fileUrl,
      filename: req.file.originalname,
      mimeType: req.file.mimetype,
    },
    message: 'Achievement media uploaded successfully.',
  });
});

module.exports = {
  getAchievements,
  createAchievement,
  updateAchievement,
  deleteAchievement,
  uploadMedia,
};
