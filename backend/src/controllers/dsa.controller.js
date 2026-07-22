const DsaTopic     = require('../models/DsaTopic.model');
const DsaProblem   = require('../models/DsaProblem.model');
const asyncHandler = require('../utils/asyncHandler');
const { sendResponse } = require('../utils/apiResponse');

// ── GET /api/v1/student/dsa/topics & /api/v1/admin/dsa/topics ────────────────
const getTopics = asyncHandler(async (req, res) => {
  const { track } = req.query;

  const topics = await DsaTopic.find().sort({ order: 1, createdAt: 1 }).lean();

  const matchStage = {};
  if (track && track !== 'all') {
    matchStage.track = track.toLowerCase();
  }

  // Aggregate problem counts per topic and track
  const problemCounts = await DsaProblem.aggregate([
    { $match: matchStage },
    { $group: { _id: '$topic', count: { $sum: 1 } } },
  ]);

  const countMap = {};
  problemCounts.forEach((pc) => {
    countMap[pc._id] = pc.count;
  });

  const topicsWithCounts = topics.map((t) => ({
    ...t,
    problemCount: countMap[t.name] || 0,
  }));

  // Aggregate track totals
  const trackCounts = await DsaProblem.aggregate([
    { $group: { _id: '$track', count: { $sum: 1 } } },
  ]);

  const trackTotals = { dsa: 0, programming: 0, total: 0 };
  trackCounts.forEach((tc) => {
    if (tc._id) trackTotals[tc._id] = tc.count;
    trackTotals.total += tc.count;
  });

  return sendResponse(res, 200, {
    success: true,
    data: {
      topics: topicsWithCounts,
      trackTotals,
    },
    message: 'DSA topics retrieved successfully.',
  });
});

// ── GET /api/v1/student/dsa/problems & /api/v1/admin/dsa/problems ──────────────
const getProblems = asyncHandler(async (req, res) => {
  const { track, topic, difficulty, source, search, page = 1, limit = 50 } = req.query;

  const query = {};

  if (track && track !== 'all') {
    query.track = track.toLowerCase();
  }
  if (topic && topic !== 'all') {
    query.topic = topic;
  }
  if (difficulty && difficulty !== 'all') {
    query.difficulty = difficulty.toLowerCase();
  }
  if (source && source !== 'all') {
    query.source = source.toLowerCase();
  }
  if (search && search.trim()) {
    query.$or = [
      { title: { $regex: search.trim(), $options: 'i' } },
      { topic: { $regex: search.trim(), $options: 'i' } },
      { patterns: { $regex: search.trim(), $options: 'i' } },
      { companies: { $regex: search.trim(), $options: 'i' } },
    ];
  }

  const pageNum  = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(200, Math.max(1, parseInt(limit, 10) || 50));
  const skip     = (pageNum - 1) * limitNum;

  const [problems, total] = await Promise.all([
    DsaProblem.find(query)
      .sort({ order: 1, createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean(),
    DsaProblem.countDocuments(query),
  ]);

  return sendResponse(res, 200, {
    success: true,
    data: {
      problems,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum) || 1,
      },
    },
    message: 'DSA problems retrieved successfully.',
  });
});

// ── POST /api/v1/admin/dsa/problems (Admin Only) ─────────────────────────────
const addProblem = asyncHandler(async (req, res) => {
  const {
    slugId,
    title,
    link,
    source,
    track,
    difficulty,
    topic,
    patterns,
    companies,
    frequency,
    sheetRefs,
    order,
  } = req.body;

  if (!title || !link || !topic) {
    return sendResponse(res, 400, {
      success: false,
      message: 'Title, link, and topic are required.',
    });
  }

  const problem = await DsaProblem.create({
    slugId: slugId || `${source || 'lc'}-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
    title: title.trim(),
    link: link.trim(),
    source: (source || 'leetcode').toLowerCase().trim(),
    track: (track || 'dsa').toLowerCase().trim(),
    difficulty: (difficulty || 'easy').toLowerCase().trim(),
    topic: topic.trim(),
    patterns: Array.isArray(patterns) ? patterns : [],
    companies: Array.isArray(companies) ? companies : [],
    frequency: (frequency || 'medium').toLowerCase().trim(),
    sheetRefs: Array.isArray(sheetRefs) ? sheetRefs : [],
    order: Number(order) || 0,
  });

  return sendResponse(res, 201, {
    success: true,
    data: problem,
    message: 'DSA problem added successfully.',
  });
});

// ── POST /api/v1/admin/dsa/problems/bulk (Admin Only) ────────────────────────
const bulkAddProblems = asyncHandler(async (req, res) => {
  const { problems } = req.body;

  if (!Array.isArray(problems) || problems.length === 0) {
    return sendResponse(res, 400, {
      success: false,
      message: 'Please provide a non-empty problems array.',
    });
  }

  const operations = problems.map((p, idx) => ({
    updateOne: {
      filter: { link: p.link.trim() },
      update: {
        $set: {
          slugId: p.slugId || `${p.source || 'lc'}-${p.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
          title: p.title.trim(),
          link: p.link.trim(),
          source: (p.source || 'leetcode').toLowerCase().trim(),
          track: (p.track || 'dsa').toLowerCase().trim(),
          difficulty: (p.difficulty || 'easy').toLowerCase().trim(),
          topic: p.topic.trim(),
          patterns: Array.isArray(p.patterns) ? p.patterns : [],
          companies: Array.isArray(p.companies) ? p.companies : [],
          frequency: (p.frequency || 'medium').toLowerCase().trim(),
          sheetRefs: Array.isArray(p.sheetRefs) ? p.sheetRefs : [],
          order: typeof p.order === 'number' ? p.order : idx,
        },
      },
      upsert: true,
    },
  }));

  const result = await DsaProblem.bulkWrite(operations);

  return sendResponse(res, 200, {
    success: true,
    data: {
      inserted: result.upsertedCount,
      modified: result.modifiedCount,
      matched: result.matchedCount,
      totalProcessed: problems.length,
    },
    message: `Successfully processed ${problems.length} DSA problems.`,
  });
});

// ── PATCH /api/v1/admin/dsa/problems/:id (Admin Only) ────────────────────────
const updateProblem = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  const problem = await DsaProblem.findByIdAndUpdate(id, updates, {
    new: true,
    runValidators: true,
  });

  if (!problem) {
    return sendResponse(res, 404, {
      success: false,
      message: 'DSA problem not found.',
    });
  }

  return sendResponse(res, 200, {
    success: true,
    data: problem,
    message: 'DSA problem updated successfully.',
  });
});

// ── DELETE /api/v1/admin/dsa/problems/:id (Admin Only) ──────────────────────
const deleteProblem = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const problem = await DsaProblem.findByIdAndDelete(id);

  if (!problem) {
    return sendResponse(res, 404, {
      success: false,
      message: 'DSA problem not found.',
    });
  }

  return sendResponse(res, 200, {
    success: true,
    data: { id },
    message: 'DSA problem deleted successfully.',
  });
});

// ── POST /api/v1/admin/dsa/topics (Admin Only) ───────────────────────────────
const addOrUpdateTopic = asyncHandler(async (req, res) => {
  const { name, referenceLinks, order } = req.body;

  if (!name || !name.trim()) {
    return sendResponse(res, 400, {
      success: false,
      message: 'Topic name is required.',
    });
  }

  const topic = await DsaTopic.findOneAndUpdate(
    { name: name.trim() },
    {
      name: name.trim(),
      referenceLinks: Array.isArray(referenceLinks) ? referenceLinks : [],
      order: typeof order === 'number' ? order : 0,
    },
    { upsert: true, new: true, runValidators: true }
  );

  return sendResponse(res, 200, {
    success: true,
    data: topic,
    message: 'DSA topic saved successfully.',
  });
});

// ── DELETE /api/v1/admin/dsa/topics/:id (Admin Only) ─────────────────────────
const deleteTopic = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const topic = await DsaTopic.findByIdAndDelete(id);

  if (!topic) {
    return sendResponse(res, 404, {
      success: false,
      message: 'DSA topic not found.',
    });
  }

  return sendResponse(res, 200, {
    success: true,
    data: { id },
    message: 'DSA topic deleted successfully.',
  });
});

module.exports = {
  getTopics,
  getProblems,
  addProblem,
  bulkAddProblems,
  updateProblem,
  deleteProblem,
  addOrUpdateTopic,
  deleteTopic,
};
