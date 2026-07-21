'use strict';

const CompanyInfo      = require('../../models/CompanyInfo.model');
const { sendResponse } = require('../../utils/apiResponse');
const asyncHandler     = require('../../utils/asyncHandler');

// ── GET /admin/companies ────────────────────────────────────────────────────
const listCompanies = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.status) {
    filter.status = req.query.status;
  }
  if (req.query.year) {
    filter.academicYear = req.query.year;
  }

  const companies = await CompanyInfo.find(filter)
    .sort({ academicYear: -1, createdAt: -1 })
    .lean();

  return sendResponse(res, 200, {
    success: true,
    data: companies,
    message: 'Admin companies list retrieved.',
  });
});

// ── POST /admin/companies ───────────────────────────────────────────────────
const createCompany = asyncHandler(async (req, res) => {
  const payload = {
    ...req.body,
    createdBy: req.user._id,
  };

  const company = await CompanyInfo.create(payload);

  return sendResponse(res, 201, {
    success: true,
    data: company,
    message: 'Company created successfully.',
  });
});

// ── PATCH /admin/companies/:id ──────────────────────────────────────────────
const updateCompany = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const company = await CompanyInfo.findByIdAndUpdate(
    id,
    { $set: req.body },
    { new: true, runValidators: true }
  );

  if (!company) {
    return sendResponse(res, 404, {
      success: false,
      message: 'Company not found.',
      error: 'NOT_FOUND',
    });
  }

  return sendResponse(res, 200, {
    success: true,
    data: company,
    message: 'Company updated successfully.',
  });
});

// ── DELETE /admin/companies/:id ─────────────────────────────────────────────
const deleteCompany = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const company = await CompanyInfo.findByIdAndDelete(id);
  if (!company) {
    return sendResponse(res, 404, {
      success: false,
      message: 'Company not found.',
      error: 'NOT_FOUND',
    });
  }

  return sendResponse(res, 200, {
    success: true,
    message: 'Company deleted successfully.',
  });
});

// ── PATCH /admin/companies/:id/status ───────────────────────────────────────
const updateCompanyStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ['upcoming', 'ongoing', 'completed'];
  if (!status || !validStatuses.includes(status.toLowerCase())) {
    return sendResponse(res, 400, {
      success: false,
      message: 'Invalid status. Allowed values: upcoming, ongoing, completed',
      error: 'INVALID_INPUT',
    });
  }

  const company = await CompanyInfo.findByIdAndUpdate(
    id,
    { $set: { status: status.toLowerCase() } },
    { new: true }
  );

  if (!company) {
    return sendResponse(res, 404, {
      success: false,
      message: 'Company not found.',
      error: 'NOT_FOUND',
    });
  }

  return sendResponse(res, 200, {
    success: true,
    data: company,
    message: `Company status transitioned to ${company.status}.`,
  });
});

// ── POST /admin/companies/:id/link-alumni-repo ─────────────────────────────
const linkAlumniRepo = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { alumniRepoId } = req.body;

  if (!alumniRepoId) {
    return sendResponse(res, 400, {
      success: false,
      message: 'alumniRepoId is required.',
      error: 'INVALID_INPUT',
    });
  }

  const company = await CompanyInfo.findByIdAndUpdate(
    id,
    { $addToSet: { linkedAlumniRepos: alumniRepoId } },
    { new: true }
  ).populate('linkedAlumniRepos');

  if (!company) {
    return sendResponse(res, 404, {
      success: false,
      message: 'Company not found.',
      error: 'NOT_FOUND',
    });
  }

  return sendResponse(res, 200, {
    success: true,
    data: company,
    message: 'Alumni repository linked to company.',
  });
});

module.exports = {
  listCompanies,
  createCompany,
  updateCompany,
  deleteCompany,
  updateCompanyStatus,
  linkAlumniRepo,
};
