'use strict';

/**
 * announcements.admin.controller.js
 *
 * Admin management of announcements.
 * Mounted at /api/v1/admin/announcements (auth + requireRole('admin') applied in index.js).
 *
 * Targeting shape:
 *   isGeneral: boolean — reaches ALL students regardless of year/batch
 *   targetYears: number[] — reaches students in those year groups
 *   targetBatches: ObjectId[] — reaches members of those specific batches
 *
 * At least ONE of the three must be set to a non-empty/non-false value.
 * Socket.io push is emitted to all matching users' /notify rooms on creation.
 */

const Announcement   = require('../../models/Announcement.model');
const User           = require('../../models/User.model');
const storage        = require('../../services/storage.service');
const { sendResponse }    = require('../../utils/apiResponse');
const asyncHandler        = require('../../utils/asyncHandler');

// ── Helper: build Mongo query for user eligibility ───────────────────────────
function buildUserEligibilityQuery(isGeneral, targetYears, targetBatches) {
  if (isGeneral) {
    // General announcement — visible to every student
    return { role: 'student', isActive: true };
  }
  const orClauses = [];
  if (targetYears && targetYears.length > 0) {
    orClauses.push({ year: { $in: targetYears } });
  }
  if (targetBatches && targetBatches.length > 0) {
    orClauses.push({ batches: { $in: targetBatches } });
  }
  if (orClauses.length === 0) return null;
  return { role: 'student', isActive: true, $or: orClauses };
}

// ── GET /admin/announcements ──────────────────────────────────────────────────
const getAnnouncements = asyncHandler(async (req, res) => {
  const page  = parseInt(req.query.page,  10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const skip  = (page - 1) * limit;

  const [announcements, total] = await Promise.all([
    Announcement.find()
      .sort({ postedAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('postedBy', 'name email')
      .populate('targetBatches', 'name year')
      .lean(),
    Announcement.countDocuments(),
  ]);

  return sendResponse(res, 200, {
    success: true,
    data: {
      announcements,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    },
    message: 'Announcements retrieved.',
  });
});

// ── POST /admin/announcements ─────────────────────────────────────────────────
const createAnnouncement = asyncHandler(async (req, res) => {
  const {
    title,
    body,
    attachments = [],
    isGeneral   = false,
    targetYears = [],
    targetBatches = [],
  } = req.body;

  if (!title || !body) {
    return sendResponse(res, 400, {
      success: false,
      message: 'title and body are required.',
      error: 'MISSING_FIELDS',
    });
  }

  // Validate: at least one targeting field must be set
  const hasTarget = isGeneral || (targetYears.length > 0) || (targetBatches.length > 0);
  if (!hasTarget) {
    return sendResponse(res, 400, {
      success: false,
      message: 'An announcement must target at least one group: set isGeneral, targetYears, or targetBatches.',
      error: 'NO_TARGET',
    });
  }

  const announcement = await Announcement.create({
    title: title.trim(),
    body:  body.trim(),
    attachments,
    isGeneral:     !!isGeneral,
    targetYears:   Array.isArray(targetYears)   ? targetYears   : [],
    targetBatches: Array.isArray(targetBatches) ? targetBatches : [],
    postedBy: req.user._id,
    postedAt: new Date(),
  });

  // ── Socket.io push ──────────────────────────────────────────────────────────
  try {
    const userQuery = buildUserEligibilityQuery(isGeneral, targetYears, targetBatches);
    if (userQuery) {
      const io = req.app.get('io'); // Set in server.js as app.set('io', io)
      if (io) {
        const matchedUsers = await User.find(userQuery, { _id: 1 }).lean();
        const payload = {
          _id:        announcement._id,
          title:      announcement.title,
          isGeneral:  announcement.isGeneral,
          targetYears: announcement.targetYears,
          postedAt:   announcement.postedAt,
        };
        for (const u of matchedUsers) {
          io.to(`notify:${u._id}`).emit('announcement:new', payload);
        }
      }
    }
  } catch (socketErr) {
    // Socket push failure should not fail the API response
    console.error('[announcements] Socket push error:', socketErr.message);
  }

  return sendResponse(res, 201, {
    success: true,
    data: announcement,
    message: 'Announcement created and pushed to eligible students.',
  });
});

// ── PATCH /admin/announcements/:id ────────────────────────────────────────────
const updateAnnouncement = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    title,
    body,
    attachments,
    isGeneral,
    targetYears,
    targetBatches,
  } = req.body;

  const updates = {};
  if (title        !== undefined) updates.title        = title.trim();
  if (body         !== undefined) updates.body         = body.trim();
  if (attachments  !== undefined) updates.attachments  = attachments;
  if (isGeneral    !== undefined) updates.isGeneral    = !!isGeneral;
  if (targetYears  !== undefined) updates.targetYears  = targetYears;
  if (targetBatches !== undefined) updates.targetBatches = targetBatches;

  // Re-validate targeting if any targeting field changed
  const needsTargetCheck = (
    'isGeneral'     in updates ||
    'targetYears'   in updates ||
    'targetBatches' in updates
  );
  if (needsTargetCheck) {
    const existing = await Announcement.findById(id).lean();
    if (!existing) {
      return sendResponse(res, 404, { success: false, message: 'Announcement not found.', error: 'NOT_FOUND' });
    }
    const effectiveGeneral  = updates.isGeneral    ?? existing.isGeneral;
    const effectiveYears    = updates.targetYears  ?? existing.targetYears;
    const effectiveBatches  = updates.targetBatches ?? existing.targetBatches;
    const hasTarget = effectiveGeneral || effectiveYears.length > 0 || effectiveBatches.length > 0;
    if (!hasTarget) {
      return sendResponse(res, 400, {
        success: false,
        message: 'An announcement must target at least one group.',
        error: 'NO_TARGET',
      });
    }
  }

  const announcement = await Announcement.findByIdAndUpdate(
    id,
    { $set: updates },
    { new: true, runValidators: true }
  ).populate('postedBy', 'name').populate('targetBatches', 'name year');

  if (!announcement) {
    return sendResponse(res, 404, { success: false, message: 'Announcement not found.', error: 'NOT_FOUND' });
  }

  return sendResponse(res, 200, {
    success: true,
    data: announcement,
    message: 'Announcement updated.',
  });
});

// ── DELETE /admin/announcements/:id ──────────────────────────────────────────
const deleteAnnouncement = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const deleted = await Announcement.findByIdAndDelete(id);
  if (!deleted) {
    return sendResponse(res, 404, { success: false, message: 'Announcement not found.', error: 'NOT_FOUND' });
  }
  return sendResponse(res, 200, { success: true, message: 'Announcement deleted.' });
});

const uploadAttachment = asyncHandler(async (req, res) => {
  if (!req.file) {
    return sendResponse(res, 400, {
      success: false,
      message: 'No file provided.',
      error: 'NO_FILE',
    });
  }

  // Attachment is uploaded before the announcement doc is created, so use a timestamp as folder
  const announcementId = `tmp-${Date.now()}`;
  const key    = storage.buildAnnouncementAttachmentKey(announcementId, req.file.originalname);
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
      mimeType: req.file.mimetype
    },
    message: 'Attachment uploaded successfully.',
  });
});

module.exports = { getAnnouncements, createAnnouncement, updateAnnouncement, deleteAnnouncement, uploadAttachment };
