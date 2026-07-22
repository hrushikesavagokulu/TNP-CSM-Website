'use strict';

const express = require('express');
const router  = express.Router();
const ctrl    = require('../../controllers/resumeGuide.controller');

// All routes mounted under /api/v1/student (auth applied at index.js)
router.get('/resume-guide/templates',             ctrl.getTemplates);
router.get('/resume-guide/building-guide',        ctrl.getBuildingGuide);
router.get('/resume-guide/references',            ctrl.getReferences);
router.get('/resume-guide/ats-links',             ctrl.getAtsLinks);
router.get('/resume-guide/improvement-resources', ctrl.getImprovementResources);

module.exports = router;
