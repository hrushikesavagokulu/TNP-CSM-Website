'use strict';

const AlumniRepo       = require('../../models/AlumniRepo.model');
const CompanyInfo      = require('../../models/CompanyInfo.model');
const { sendResponse } = require('../../utils/apiResponse');
const asyncHandler     = require('../../utils/asyncHandler');

// ── GET /admin/alumni-repos ──────────────────────────────────────────────────
const listAlumniRepos = asyncHandler(async (req, res) => {
  const alumni = await AlumniRepo.find()
    .populate({
      path: 'companiesSecured.company',
      select: 'name status academicYear ctc',
    })
    .sort({ createdAt: -1 })
    .lean();

  return sendResponse(res, 200, {
    success: true,
    data: alumni,
    message: 'Admin alumni repository list retrieved.',
  });
});

// ── POST /admin/alumni-repos ─────────────────────────────────────────────────
const createAlumniRepo = asyncHandler(async (req, res) => {
  const payload = {
    ...req.body,
    createdBy: req.user._id,
  };

  const alumnus = await AlumniRepo.create(payload);

  // Auto-link this alumnus to each secured company's linkedAlumniRepos array
  if (Array.isArray(payload.companiesSecured)) {
    for (const item of payload.companiesSecured) {
      if (item.company) {
        await CompanyInfo.findByIdAndUpdate(item.company, {
          $addToSet: { linkedAlumniRepos: alumnus._id },
        });
      }
    }
  }

  return sendResponse(res, 201, {
    success: true,
    data: alumnus,
    message: 'Alumnus repository created successfully.',
  });
});

// ── PATCH /admin/alumni-repos/:id ────────────────────────────────────────────
const updateAlumniRepo = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const alumnus = await AlumniRepo.findByIdAndUpdate(
    id,
    { $set: req.body },
    { new: true, runValidators: true }
  ).populate('companiesSecured.company');

  if (!alumnus) {
    return sendResponse(res, 404, {
      success: false,
      message: 'Alumnus repo not found.',
      error: 'NOT_FOUND',
    });
  }

  // Update linkedAlumniRepos on CompanyInfo docs
  if (Array.isArray(req.body.companiesSecured)) {
    for (const item of req.body.companiesSecured) {
      if (item.company) {
        await CompanyInfo.findByIdAndUpdate(item.company, {
          $addToSet: { linkedAlumniRepos: id },
        });
      }
    }
  }

  return sendResponse(res, 200, {
    success: true,
    data: alumnus,
    message: 'Alumnus repository updated successfully.',
  });
});

// ── DELETE /admin/alumni-repos/:id ───────────────────────────────────────────
const deleteAlumniRepo = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const alumnus = await AlumniRepo.findByIdAndDelete(id);
  if (!alumnus) {
    return sendResponse(res, 404, {
      success: false,
      message: 'Alumnus repo not found.',
      error: 'NOT_FOUND',
    });
  }

  // Remove reference from CompanyInfo documents
  await CompanyInfo.updateMany(
    { linkedAlumniRepos: id },
    { $pull: { linkedAlumniRepos: id } }
  );

  return sendResponse(res, 200, {
    success: true,
    message: 'Alumnus repository deleted successfully.',
  });
});

module.exports = {
  listAlumniRepos,
  createAlumniRepo,
  updateAlumniRepo,
  deleteAlumniRepo,
};
