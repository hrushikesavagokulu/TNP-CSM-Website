'use strict';

/**
 * achievement.controller.js — Student & Public viewing of Department Achievements
 */

const Achievement = require('../models/Achievement.model');
const { sendResponse } = require('../utils/apiResponse');
const asyncHandler  = require('../utils/asyncHandler');

// ── GET /public/achievements (or /student/achievements) ──────────────────────
const getPublicAchievements = asyncHandler(async (req, res) => {
  const { search } = req.query;
  const now = new Date();

  // Safety net filter: exclude expired items
  const filter = {
    $or: [
      { neverExpires: true },
      { expiresAt: null },
      { expiresAt: { $gt: now } },
    ],
  };

  if (search && search.trim()) {
    const regex = new RegExp(search.trim(), 'i');
    filter.$and = [
      {
        $or: [
          { title: regex },
          { description: regex },
          { category: regex },
        ],
      },
    ];
  }

  const items = await Achievement.find(filter)
    .sort({ date: -1, order: 1 })
    .lean();

  return sendResponse(res, 200, {
    success: true,
    data: items,
    message: 'Department achievements retrieved.',
  });
});

module.exports = { getPublicAchievements };
