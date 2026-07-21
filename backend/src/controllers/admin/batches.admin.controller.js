'use strict';

/**
 * batches.admin.controller.js
 *
 * Admin CRUD for Batch docs + member management.
 * Mounted at /api/v1/admin/batches (auth + requireRole('admin') already applied in index.js).
 */

const mongoose   = require('mongoose');
const Batch      = require('../../models/Batch.model');
const User       = require('../../models/User.model');
const { parseBatchMembersSheet } = require('../../services/excelImport.service');
const { sendResponse }  = require('../../utils/apiResponse');
const asyncHandler      = require('../../utils/asyncHandler');

// ─────────────────────────────────────────────────────────────────────────────
// SHARED HELPER — resolve members + validate year match + $addToSet
// Used by both single add-members and bulk-import endpoints.
// Returns { addedCount, errors }
// ─────────────────────────────────────────────────────────────────────────────
async function resolveMembersAndAdd(batch, candidates) {
  // candidates: array of { rollNo?, email? }
  const errors     = [];
  let   addedCount = 0;

  for (const cand of candidates) {
    const { rollNo, email } = cand;
    if (!rollNo && !email) {
      errors.push({ identifier: '-', reason: 'No rollNo or email provided.' });
      continue;
    }

    // Build lookup query
    const orClauses = [];
    if (rollNo) orClauses.push({ rollNo: rollNo.toUpperCase() });
    if (email)  orClauses.push({ email: email.toLowerCase() });

    const user = await User.findOne({ role: 'student', $or: orClauses }).lean();
    const label = rollNo || email;

    if (!user) {
      errors.push({ identifier: label, reason: `No registered student found for "${label}".` });
      continue;
    }

    // Year-mismatch validation — core business rule
    if (user.year !== batch.year) {
      errors.push({
        identifier: user.rollNo || label,
        reason: `Student "${user.name}" is Year ${user.year}, but this batch is Year ${batch.year}-only.`,
      });
      continue;
    }

    // $addToSet is idempotent — adding an already-member is a harmless no-op
    await User.updateOne({ _id: user._id }, { $addToSet: { batches: batch._id } });
    addedCount++;
  }

  return { addedCount, errors };
}

// ── GET /admin/batches?year= ─────────────────────────────────────────────────
const getBatches = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.year) {
    const yr = parseInt(req.query.year, 10);
    if (![3, 4].includes(yr)) {
      return sendResponse(res, 400, {
        success: false,
        message: 'Batches only exist for Year 3 or Year 4.',
        error: 'INVALID_YEAR',
      });
    }
    filter.year = yr;
  }

  // Aggregate to get live member counts without N+1
  const batches = await Batch.aggregate([
    { $match: filter },
    {
      $lookup: {
        from:         'users',
        localField:   '_id',
        foreignField: 'batches',
        as:           'members',
      },
    },
    {
      $project: {
        name:        1,
        year:        1,
        createdBy:   1,
        createdAt:   1,
        updatedAt:   1,
        memberCount: { $size: '$members' },
      },
    },
    { $sort: { year: 1, name: 1 } },
  ]);

  return sendResponse(res, 200, {
    success: true,
    data: batches,
    message: 'Batches retrieved successfully.',
  });
});

// ── POST /admin/batches ──────────────────────────────────────────────────────
const createBatch = asyncHandler(async (req, res) => {
  const { name, year } = req.body;

  if (!name || !year) {
    return sendResponse(res, 400, {
      success: false,
      message: 'name and year are required.',
      error: 'MISSING_FIELDS',
    });
  }

  const yr = parseInt(year, 10);
  if (![3, 4].includes(yr)) {
    return sendResponse(res, 400, {
      success: false,
      message: 'Batches can only be created for Year 3 or Year 4 students.',
      error: 'INVALID_YEAR',
    });
  }

  try {
    const batch = await Batch.create({
      name: name.trim(),
      year: yr,
      createdBy: req.user._id,
    });
    return sendResponse(res, 201, {
      success: true,
      data: batch,
      message: `Batch "${batch.name}" (Year ${batch.year}) created successfully.`,
    });
  } catch (err) {
    if (err.code === 11000) {
      return sendResponse(res, 409, {
        success: false,
        message: `A batch named "${name.trim()}" already exists for Year ${yr}.`,
        error: 'DUPLICATE_BATCH',
      });
    }
    throw err;
  }
});

// ── PATCH /admin/batches/:id — rename only ───────────────────────────────────
const renameBatch = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, year } = req.body;

  if (year !== undefined) {
    return sendResponse(res, 400, {
      success: false,
      message: 'Changing a batch\'s year is not allowed after creation (would orphan existing student memberships).',
      error: 'YEAR_LOCKED',
    });
  }

  if (!name || !name.trim()) {
    return sendResponse(res, 400, {
      success: false,
      message: 'A new name is required.',
      error: 'MISSING_FIELDS',
    });
  }

  const batch = await Batch.findByIdAndUpdate(
    id,
    { $set: { name: name.trim() } },
    { new: true, runValidators: true }
  );

  if (!batch) {
    return sendResponse(res, 404, {
      success: false,
      message: 'Batch not found.',
      error: 'NOT_FOUND',
    });
  }

  return sendResponse(res, 200, {
    success: true,
    data: batch,
    message: `Batch renamed to "${batch.name}" successfully.`,
  });
});

// ── DELETE /admin/batches/:id ─────────────────────────────────────────────────
const deleteBatch = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const batch = await Batch.findByIdAndDelete(id);
  if (!batch) {
    return sendResponse(res, 404, {
      success: false,
      message: 'Batch not found.',
      error: 'NOT_FOUND',
    });
  }

  // Pull this batch's ID from every student's batches array
  const updateResult = await User.updateMany(
    { batches: batch._id },
    { $pull: { batches: batch._id } }
  );

  // NOTE: Announcements that targeted this batch are left as historical records.
  // They are no longer reachable via the group-list endpoint (no student can be
  // eligible for a deleted batch), but are preserved for audit purposes.

  return sendResponse(res, 200, {
    success: true,
    message: `Batch "${batch.name}" deleted. ${updateResult.modifiedCount} student membership(s) cleaned up.`,
  });
});

// ── GET /admin/batches/:id/members ───────────────────────────────────────────
const getMembers = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const batch = await Batch.findById(id).lean();
  if (!batch) {
    return sendResponse(res, 404, { success: false, message: 'Batch not found.', error: 'NOT_FOUND' });
  }

  const members = await User.find(
    { role: 'student', batches: batch._id },
    { name: 1, rollNo: 1, email: 1, year: 1, profileImage: 1 }
  ).sort({ rollNo: 1 });

  return sendResponse(res, 200, {
    success: true,
    data: { batch, members },
    message: `${members.length} member(s) found.`,
  });
});

// ── POST /admin/batches/:id/add-members ─────────────────────────────────────
const addMembers = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const batch = await Batch.findById(id).lean();
  if (!batch) {
    return sendResponse(res, 404, { success: false, message: 'Batch not found.', error: 'NOT_FOUND' });
  }

  const { rollNos, emails } = req.body;

  // Build candidates array from either rollNos or emails
  const candidates = [];
  if (Array.isArray(rollNos) && rollNos.length > 0) {
    rollNos.forEach((r) => candidates.push({ rollNo: r }));
  }
  if (Array.isArray(emails) && emails.length > 0) {
    emails.forEach((e) => candidates.push({ email: e }));
  }

  if (candidates.length === 0) {
    return sendResponse(res, 400, {
      success: false,
      message: 'Provide rollNos[] or emails[] (or both) to add members.',
      error: 'MISSING_FIELDS',
    });
  }

  const { addedCount, errors } = await resolveMembersAndAdd(batch, candidates);

  return sendResponse(res, 200, {
    success: true,
    data: { addedCount, errors },
    message: `Added ${addedCount} student(s). ${errors.length} error(s).`,
  });
});

// ── POST /admin/batches/:id/add-members/bulk-import ─────────────────────────
const bulkImportMembers = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const batch = await Batch.findById(id).lean();
  if (!batch) {
    return sendResponse(res, 404, { success: false, message: 'Batch not found.', error: 'NOT_FOUND' });
  }

  if (!req.file) {
    return sendResponse(res, 400, {
      success: false,
      message: 'No spreadsheet file provided.',
      error: 'NO_FILE',
    });
  }

  // Parse the sheet — reuses parseBatchMembersSheet (same pattern as Phase 3 student import)
  const { validRows: parsedRows, errors: parseErrors } = parseBatchMembersSheet(req.file.buffer);

  // Run each parsed row through the shared add-members helper (year-mismatch + $addToSet)
  const { addedCount, errors: addErrors } = await resolveMembersAndAdd(batch, parsedRows);

  const allErrors = [...parseErrors, ...addErrors];

  return sendResponse(res, 200, {
    success: true,
    data: { addedCount, errors: allErrors },
    message: `Bulk import complete. Added ${addedCount} student(s). ${allErrors.length} error(s).`,
  });
});

// ── POST /admin/batches/:id/remove-members ───────────────────────────────────
const removeMembers = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const batch = await Batch.findById(id).lean();
  if (!batch) {
    return sendResponse(res, 404, { success: false, message: 'Batch not found.', error: 'NOT_FOUND' });
  }

  const { rollNos, emails } = req.body;
  const orClauses = [];

  if (Array.isArray(rollNos) && rollNos.length > 0) {
    orClauses.push({ rollNo: { $in: rollNos.map((r) => r.toUpperCase()) } });
  }
  if (Array.isArray(emails) && emails.length > 0) {
    orClauses.push({ email: { $in: emails.map((e) => e.toLowerCase()) } });
  }

  if (orClauses.length === 0) {
    return sendResponse(res, 400, {
      success: false,
      message: 'Provide rollNos[] or emails[] (or both) to remove members.',
      error: 'MISSING_FIELDS',
    });
  }

  const result = await User.updateMany(
    { role: 'student', $or: orClauses },
    { $pull: { batches: batch._id } }
  );

  return sendResponse(res, 200, {
    success: true,
    data: { removedCount: result.modifiedCount },
    message: `Removed ${result.modifiedCount} student(s) from batch "${batch.name}".`,
  });
});

module.exports = {
  getBatches,
  createBatch,
  renameBatch,
  deleteBatch,
  getMembers,
  addMembers,
  bulkImportMembers,
  removeMembers,
};
