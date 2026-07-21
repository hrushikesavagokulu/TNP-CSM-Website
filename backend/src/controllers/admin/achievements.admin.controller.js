'use strict';

/**
 * achievements.admin.controller.js
 * Admin management of Department Achievements & Spotlights.
 */

const Achievement  = require('../../models/Achievement.model');
const storage      = require('../../services/storage.service');
const { sendResponse } = require('../../utils/apiResponse');
const asyncHandler = require('../../utils/asyncHandler');

function calculateAchievementExpiry(anchorDate, expiryMode, customExpiryDays, customExpiryDate) {
  const baseDate = anchorDate ? new Date(anchorDate) : new Date();

  if (expiryMode === 'custom') {
    let expiresAt = null;

    if (customExpiryDays !== undefined && customExpiryDays !== null && customExpiryDays !== '') {
      const days = parseInt(customExpiryDays, 10);
      if (isNaN(days) || days <= 0) {
        const err = new Error('customExpiryDays must be a positive number.');
        err.statusCode = 400;
        throw err;
      }
      expiresAt = new Date(baseDate.getTime() + days * 24 * 60 * 60 * 1000);

    } else if (customExpiryDate) {
      const targetDate = new Date(customExpiryDate);
      if (isNaN(targetDate.getTime())) {
        const err = new Error('Invalid customExpiryDate provided.');
        err.statusCode = 400;
        throw err;
      }
      if (targetDate <= baseDate) {
        const err = new Error('Custom expiry date must be in the future.');
        err.statusCode = 400;
        throw err;
      }
      expiresAt = targetDate;
    } else {
      const err = new Error('Custom expiry mode requires customExpiryDays or customExpiryDate.');
      err.statusCode = 400;
      throw err;
    }

    return { neverExpires: false, expiresAt, expiryMode: 'custom' };
  }

  // Default mode for achievements: Never expires (permanent historical record)
  return { neverExpires: true, expiresAt: null, expiryMode: 'never' };
}

function annotateAchievement(item) {
  const now = new Date();
  if (item.neverExpires || !item.expiresAt) {
    return { ...item, remainingDays: null, expiryMode: 'never' };
  }
  const diffMs = new Date(item.expiresAt).getTime() - now.getTime();
  const remainingDays = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
  return { ...item, remainingDays };
}

// ── GET /admin/achievements ──────────────────────────────────────────────────
const getAchievements = asyncHandler(async (req, res) => {
  const page  = parseInt(req.query.page,  10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const skip  = (page - 1) * limit;

  const [items, total] = await Promise.all([
    Achievement.find()
      .sort({ date: -1, order: 1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Achievement.countDocuments(),
  ]);

  const annotated = items.map(annotateAchievement);

  return sendResponse(res, 200, {
    success: true,
    data: {
      achievements: annotated,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    },
    message: 'Department achievements retrieved.',
  });
});

// ── POST /admin/achievements ─────────────────────────────────────────────────
const createAchievement = asyncHandler(async (req, res) => {
  const {
    title,
    description = '',
    date = new Date(),
    mediaUrl = '',
    category = 'General',
    order = 0,
    expiryMode = 'never', // Default for achievements is NEVER EXPIRES
    customExpiryDays,
    customExpiryDate,
  } = req.body;

  if (!title) {
    return sendResponse(res, 400, {
      success: false,
      message: 'Achievement title is required.',
      error: 'MISSING_FIELDS',
    });
  }

  const achievementDate = date ? new Date(date) : new Date();
  let expiryConfig;
  try {
    expiryConfig = calculateAchievementExpiry(achievementDate, expiryMode, customExpiryDays, customExpiryDate);
  } catch (err) {
    return sendResponse(res, err.statusCode || 400, {
      success: false,
      message: err.message,
      error: 'INVALID_EXPIRY_CONFIG',
    });
  }

  const achievement = await Achievement.create({
    title: title.trim(),
    description: description.trim(),
    date: achievementDate,
    mediaUrl,
    category,
    order: Number(order) || 0,
    expiresAt: expiryConfig.expiresAt,
    neverExpires: expiryConfig.neverExpires,
  });

  const annotated = annotateAchievement(achievement.toObject());

  return sendResponse(res, 201, {
    success: true,
    data: annotated,
    message: 'Department achievement created successfully.',
  });
});

// ── PATCH /admin/achievements/:id ────────────────────────────────────────────
const updateAchievement = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    title,
    description,
    date,
    mediaUrl,
    category,
    order,
    expiryMode,
    customExpiryDays,
    customExpiryDate,
  } = req.body;

  const existing = await Achievement.findById(id);
  if (!existing) {
    return sendResponse(res, 404, { success: false, message: 'Achievement not found.', error: 'NOT_FOUND' });
  }

  const updates = {};
  if (title       !== undefined) updates.title       = title.trim();
  if (description !== undefined) updates.description = description.trim();
  if (date        !== undefined) updates.date        = new Date(date);
  if (mediaUrl    !== undefined) updates.mediaUrl    = mediaUrl;
  if (category   !== undefined) updates.category    = category;
  if (order       !== undefined) updates.order       = Number(order);

  if (expiryMode !== undefined) {
    try {
      const anchorDate = updates.date || existing.date;
      const expiryConfig = calculateAchievementExpiry(anchorDate, expiryMode, customExpiryDays, customExpiryDate);
      updates.expiresAt    = expiryConfig.expiresAt;
      updates.neverExpires = expiryConfig.neverExpires;
    } catch (err) {
      return sendResponse(res, err.statusCode || 400, {
        success: false,
        message: err.message,
        error: 'INVALID_EXPIRY_CONFIG',
      });
    }
  }

  const updated = await Achievement.findByIdAndUpdate(
    id,
    { $set: updates },
    { new: true, runValidators: true }
  );

  const annotated = annotateAchievement(updated.toObject());

  return sendResponse(res, 200, {
    success: true,
    data: annotated,
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

  const achievementId = `tmp-${Date.now()}`;
  const key     = storage.buildAchievementMediaKey(achievementId, req.file.originalname);
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
