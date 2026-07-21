'use strict';

const Achievement      = require('../models/Achievement.model');
const { sendResponse } = require('../utils/apiResponse');
const asyncHandler     = require('../utils/asyncHandler');

// ── GET /student/achievements?search=&page=&limit= ─────────────────────────
const getAchievements = asyncHandler(async (req, res) => {
  const search = req.query.search?.trim();
  const page   = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit  = Math.max(1, Math.min(100, parseInt(req.query.limit, 10) || 20));
  const skip   = (page - 1) * limit;

  let query = {};

  if (search) {
    // Attempt text search with regex fallback for broad matching
    query = {
      $or: [
        { $text: { $search: search } },
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ],
    };
  }

  const total = await Achievement.countDocuments(query);
  const achievements = await Achievement.find(query)
    .populate('postedBy', 'name email role')
    .sort({ date: -1, createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  return sendResponse(res, 200, {
    success: true,
    data: achievements,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
    message: 'Achievements retrieved successfully.',
  });
});

module.exports = { getAchievements };
