'use strict';

const express     = require('express');
const authenticate = require('../../middleware/auth.middleware');
const { getSkillRoadmap, toggleChecklistItem } = require('../../controllers/skillRoadmap.controller');
const { getCertifications }    = require('../../controllers/certification.controller');
const { getLearningResources } = require('../../controllers/learningResource.controller');
const { getResumeGuide }       = require('../../controllers/resumeGuide.controller');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

router.get('/skill-roadmap',       getSkillRoadmap);
router.patch('/roadmap-checklist/:itemId', toggleChecklistItem);

router.get('/certifications',      getCertifications);
router.get('/learning-resources',  getLearningResources);
router.get('/resume-guide',        getResumeGuide);

module.exports = router;
