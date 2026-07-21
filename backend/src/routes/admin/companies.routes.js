'use strict';

const express = require('express');
const {
  listCompanies,
  createCompany,
  updateCompany,
  deleteCompany,
  updateCompanyStatus,
  linkAlumniRepo,
} = require('../../controllers/admin/companies.admin.controller');

const router = express.Router();

router.get('/',                    listCompanies);
router.post('/',                   createCompany);
router.patch('/:id',               updateCompany);
router.delete('/:id',              deleteCompany);
router.patch('/:id/status',        updateCompanyStatus);
router.post('/:id/link-alumni-repo', linkAlumniRepo);

module.exports = router;
