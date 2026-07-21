'use strict';

/**
 * skillRoadmap.controller.js — student-facing read + checklist toggle
 */

const SkillRoadmap = require('../models/SkillRoadmap.model');
const User         = require('../models/User.model');
const { recalculateCompletionPercent } = require('../services/progress.service');
const { sendResponse } = require('../utils/apiResponse');
const asyncHandler     = require('../utils/asyncHandler');

// ── GET /student/skill-roadmap?semester= ─────────────────────────────────────
const getSkillRoadmap = asyncHandler(async (req, res) => {
  const filter = { isActive: true };
  if (req.query.semester) {
    filter.semester = parseInt(req.query.semester, 10);
  }

  const items = await SkillRoadmap.find(filter)
    .sort({ semester: 1, order: 1 })
    .lean();

  return sendResponse(res, 200, {
    success: true,
    data: items,
    message: 'Skill roadmap retrieved.',
  });
});

// ── PATCH /student/roadmap-checklist/:itemId ──────────────────────────────────
const toggleChecklistItem = asyncHandler(async (req, res) => {
  const { itemId } = req.params;
  const userId     = req.user._id;

  // Verify the roadmap item exists
  const roadmapItem = await SkillRoadmap.findById(itemId).lean();
  if (!roadmapItem) {
    return sendResponse(res, 404, {
      success: false,
      message: 'Roadmap item not found.',
      error: 'NOT_FOUND',
    });
  }

  const user = await User.findById(userId);
  const checklist = user.progress.roadmapChecklist || [];

  const existingIdx = checklist.findIndex((c) => c.itemId === itemId);

  if (existingIdx === -1) {
    // First time toggling — mark as done
    user.progress.roadmapChecklist.push({ itemId, done: true, doneAt: new Date() });
  } else {
    // Toggle existing entry
    const current = user.progress.roadmapChecklist[existingIdx];
    current.done  = !current.done;
    current.doneAt = current.done ? new Date() : undefined;
  }

  await user.save();

  // Recalculate completion percent
  const completionPercent = await recalculateCompletionPercent(userId);

  return sendResponse(res, 200, {
    success: true,
    data: {
      itemId,
      done: existingIdx === -1 ? true : !checklist[existingIdx]?.done,
      completionPercent,
    },
    message: 'Checklist updated.',
  });
});

module.exports = { getSkillRoadmap, toggleChecklistItem };
