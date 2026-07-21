'use strict';

/**
 * content.admin.controller.js
 *
 * Generic controller FACTORY for all Phase 7 content models.
 * createContentAdminController(Model) → { list, create, update, remove }
 *
 * All four modules (SkillRoadmap, Certification, LearningResource, ResumeGuide)
 * are served by THIS function — do not write separate controller files.
 */

const { sendResponse } = require('../../utils/apiResponse');
const asyncHandler     = require('../../utils/asyncHandler');

/**
 * @param {mongoose.Model} Model - The mongoose model to operate on
 * @param {Object} opts
 * @param {string[]} opts.sortFields - Default sort e.g. ['semester','order']
 */
function createContentAdminController(Model, opts = {}) {
  const sortFields = opts.sortFields || ['order'];

  // Build sort object from sortFields array
  const buildSort = () => {
    const sort = {};
    for (const f of sortFields) sort[f] = 1;
    return sort;
  };

  // ── LIST ──────────────────────────────────────────────────────────────────
  const list = asyncHandler(async (req, res) => {
    const filter = {};
    // Optional ?semester= filter (applicable to SkillRoadmap, Certification)
    if (req.query.semester) {
      filter.semester = parseInt(req.query.semester, 10);
    }

    const items = await Model.find(filter).sort(buildSort()).lean();

    return sendResponse(res, 200, {
      success: true,
      data: items,
      message: `${Model.modelName} list retrieved.`,
    });
  });

  // ── CREATE ────────────────────────────────────────────────────────────────
  const create = asyncHandler(async (req, res) => {
    const payload = { ...req.body, createdBy: req.user._id };

    // Normalise contentBlocks order values if provided
    if (Array.isArray(payload.contentBlocks)) {
      payload.contentBlocks = payload.contentBlocks.map((b, idx) => ({
        ...b,
        order: b.order ?? idx,
      }));
    }

    const doc = await Model.create(payload);

    return sendResponse(res, 201, {
      success: true,
      data: doc,
      message: `${Model.modelName} created.`,
    });
  });

  // ── UPDATE ────────────────────────────────────────────────────────────────
  const update = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const updates = { ...req.body };

    // If contentBlocks are being replaced wholesale, normalize order values
    if (Array.isArray(updates.contentBlocks)) {
      updates.contentBlocks = updates.contentBlocks.map((b, idx) => ({
        ...b,
        order: b.order ?? idx,
      }));
    }

    const doc = await Model.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!doc) {
      return sendResponse(res, 404, {
        success: false,
        message: `${Model.modelName} not found.`,
        error: 'NOT_FOUND',
      });
    }

    return sendResponse(res, 200, {
      success: true,
      data: doc,
      message: `${Model.modelName} updated.`,
    });
  });

  // ── REMOVE ────────────────────────────────────────────────────────────────
  const remove = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const doc = await Model.findByIdAndDelete(id);
    if (!doc) {
      return sendResponse(res, 404, {
        success: false,
        message: `${Model.modelName} not found.`,
        error: 'NOT_FOUND',
      });
    }

    return sendResponse(res, 200, {
      success: true,
      message: `${Model.modelName} deleted.`,
    });
  });

  return { list, create, update, remove };
}

module.exports = { createContentAdminController };
