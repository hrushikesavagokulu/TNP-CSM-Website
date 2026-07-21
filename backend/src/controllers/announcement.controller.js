'use strict';

/**
 * announcement.controller.js
 *
 * Student-facing announcement endpoints.
 * Mounted at /api/v1/student (auth middleware already applied in index.js).
 *
 * Endpoints:
 *   GET  /student/announcement-groups    — list eligible groups + unread counts
 *   GET  /student/announcements?group=   — fetch announcements for a group
 *   POST /student/announcements/:id/read — mark an announcement as read
 */

const Announcement  = require('../models/Announcement.model');
const User          = require('../models/User.model');
const { getEligibleGroups, isGroupEligible } = require('../services/announcementEligibility.service');
const { sendResponse } = require('../utils/apiResponse');
const asyncHandler  = require('../utils/asyncHandler');

// ── GET /student/announcement-groups ─────────────────────────────────────────
const getAnnouncementGroups = asyncHandler(async (req, res) => {
  // Re-derive groups from DB (never cached) — always live
  const user = await User.findById(req.user._id).populate('batches').lean();
  if (!user) {
    return sendResponse(res, 404, { success: false, message: 'User not found.', error: 'NOT_FOUND' });
  }

  const groups = await getEligibleGroups(user);

  return sendResponse(res, 200, {
    success: true,
    data: groups,
    message: 'Announcement groups retrieved.',
  });
});

// ── GET /student/announcements?group= ────────────────────────────────────────
const getAnnouncements = asyncHandler(async (req, res) => {
  const { group } = req.query;

  if (!group) {
    return sendResponse(res, 400, {
      success: false,
      message: 'group query parameter is required.',
      error: 'MISSING_GROUP',
    });
  }

  // Re-derive user with batches populated for eligibility check
  const user = await User.findById(req.user._id).populate('batches').lean();
  if (!user) {
    return sendResponse(res, 404, { success: false, message: 'User not found.', error: 'NOT_FOUND' });
  }

  // SECURITY: Re-validate server-side — never trust client-supplied group blindly
  const eligible = await isGroupEligible(user, group);
  if (!eligible) {
    return sendResponse(res, 403, {
      success: false,
      message: `You are not eligible for group "${group}".`,
      error: 'FORBIDDEN_GROUP',
    });
  }

  // Safety net query filter: exclude expired announcements (neverExpires: false AND expiresAt <= now)
  const now = new Date();
  const expiryFilter = {
    $or: [
      { neverExpires: true },
      { expiresAt: null },
      { expiresAt: { $gt: now } },
    ],
  };

  let announcementFilter = { ...expiryFilter };

  if (group === 'general') {
    announcementFilter.isGeneral = true;

  } else if (group.startsWith('year-')) {
    const yr = parseInt(group.replace('year-', ''), 10);
    announcementFilter.targetYears = yr;

  } else if (group.startsWith('batch-')) {
    const batchId = group.replace('batch-', '');
    announcementFilter.targetBatches = batchId;

  } else {
    return sendResponse(res, 400, {
      success: false,
      message: `Unknown group format: "${group}". Expected 'general', 'year-N', or 'batch-<id>'.`,
      error: 'INVALID_GROUP_FORMAT',
    });
  }

  const page  = parseInt(req.query.page,  10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const skip  = (page - 1) * limit;

  const [announcements, total] = await Promise.all([
    Announcement.find(announcementFilter)
      .sort({ postedAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('postedBy', 'name')
      .populate('targetBatches', 'name year')
      .lean(),
    Announcement.countDocuments(announcementFilter),
  ]);

  // Annotate each announcement with whether this user has read it
  const userId = req.user._id.toString();
  const annotated = announcements.map((a) => ({
    ...a,
    isRead: a.readBy.some((r) => r.user.toString() === userId),
    // Strip readBy array from client response (don't expose all user IDs)
    readBy: undefined,
  }));

  return sendResponse(res, 200, {
    success: true,
    data: {
      announcements: annotated,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    },
    message: 'Announcements retrieved.',
  });
});

// ── POST /student/announcements/:id/read ─────────────────────────────────────
const markAsRead = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  const announcement = await Announcement.findById(id);
  if (!announcement) {
    return sendResponse(res, 404, { success: false, message: 'Announcement not found.', error: 'NOT_FOUND' });
  }

  // Use $addToSet to ensure idempotency — marking as read twice is a no-op
  const alreadyRead = announcement.readBy.some(
    (r) => r.user.toString() === userId.toString()
  );

  if (!alreadyRead) {
    await Announcement.updateOne(
      { _id: id },
      { $addToSet: { readBy: { user: userId, readAt: new Date() } } }
    );
  }

  return sendResponse(res, 200, {
    success: true,
    message: alreadyRead ? 'Already marked as read.' : 'Marked as read.',
  });
});

module.exports = { getAnnouncementGroups, getAnnouncements, markAsRead };
