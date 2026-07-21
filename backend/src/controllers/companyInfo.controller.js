'use strict';

const CompanyInfo  = require('../models/CompanyInfo.model');
const { sendResponse } = require('../utils/apiResponse');
const asyncHandler     = require('../utils/asyncHandler');

/**
 * companyInfo.controller.js — Student-facing endpoints.
 *
 * GET /student/companies?status=&year=
 *   Returns flat list of companies matching filters, sorted by academicYear desc, driveDate desc.
 *   Note: For status=completed, client-side grouping by academicYear is used on the frontend
 *   to present summary cards and aggregated year-wise statistics (placed count, CTC range, roles).
 *
 * GET /student/companies/:id
 *   Returns single company with fully populated linkedAlumniRepos so students can view
 *   alumni repository entries linked to this specific recruitment drive at the bottom.
 */

// ── GET /student/companies ──────────────────────────────────────────────────
const getCompanies = asyncHandler(async (req, res) => {
  const filter = {};

  if (req.query.status) {
    const validStatuses = ['upcoming', 'ongoing', 'completed'];
    if (validStatuses.includes(req.query.status.toLowerCase())) {
      filter.status = req.query.status.toLowerCase();
    }
  }

  if (req.query.year) {
    filter.academicYear = req.query.year.trim();
  }

  const companies = await CompanyInfo.find(filter)
    .sort({ academicYear: -1, driveDate: -1, createdAt: -1 })
    .lean();

  return sendResponse(res, 200, {
    success: true,
    data: companies,
    message: 'Companies list retrieved.',
  });
});

// ── GET /student/companies/:id ──────────────────────────────────────────────
const getCompanyById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const company = await CompanyInfo.findById(id)
    .populate({
      path: 'linkedAlumniRepos',
      populate: {
        path: 'companiesSecured.company',
        select: 'name ctc status academicYear',
      },
    })
    .lean();

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
    message: 'Company details retrieved.',
  });
});

module.exports = { getCompanies, getCompanyById };
