'use strict';

const express = require('express');
const {
  listAlumniRepos,
  createAlumniRepo,
  updateAlumniRepo,
  deleteAlumniRepo,
} = require('../../controllers/admin/alumniRepos.admin.controller');

const router = express.Router();

router.get('/',      listAlumniRepos);
router.post('/',     createAlumniRepo);
router.patch('/:id', updateAlumniRepo);
router.delete('/:id', deleteAlumniRepo);

module.exports = router;
