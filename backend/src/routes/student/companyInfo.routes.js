'use strict';

const express      = require('express');
const authenticate = require('../../middleware/auth.middleware');
const { getCompanies, getCompanyById } = require('../../controllers/companyInfo.controller');

const router = express.Router();

router.use(authenticate);

router.get('/companies',     getCompanies);
router.get('/companies/:id', getCompanyById);

module.exports = router;
