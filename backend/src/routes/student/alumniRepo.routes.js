'use strict';

const express      = require('express');
const authenticate = require('../../middleware/auth.middleware');
const { getAlumniRepos } = require('../../controllers/alumniRepo.controller');

const router = express.Router();

router.use(authenticate);

router.get('/alumni-repos', getAlumniRepos);

module.exports = router;
