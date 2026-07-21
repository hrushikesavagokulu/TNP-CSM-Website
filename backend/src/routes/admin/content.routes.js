'use strict';

/**
 * content.routes.js
 *
 * Mounts all four Phase 7 admin content routers.
 * Auth + requireRole('admin') is applied at index.js when this router is mounted.
 *
 * All four use the SAME factory — createContentAdminController — NOT separate files.
 */

const express = require('express');

const SkillRoadmap     = require('../../models/SkillRoadmap.model');
const Certification    = require('../../models/Certification.model');
const LearningResource = require('../../models/LearningResource.model');
const ResumeGuide      = require('../../models/ResumeGuide.model');

const { createContentAdminController } = require('../../controllers/admin/content.admin.controller');

// ── Instantiate one controller set per model ──────────────────────────────────
const roadmapCtrl  = createContentAdminController(SkillRoadmap,     { sortFields: ['semester', 'order'] });
const certCtrl     = createContentAdminController(Certification,     { sortFields: ['semester', 'order'] });
const resourceCtrl = createContentAdminController(LearningResource,  { sortFields: ['skillName', 'order'] });
const resumeCtrl   = createContentAdminController(ResumeGuide,       { sortFields: ['order'] });

// ── Helper: build a small CRUD router from a controller set ───────────────────
function buildContentRouter(ctrl) {
  const r = express.Router();
  r.get('/',       ctrl.list);
  r.post('/',      ctrl.create);
  r.patch('/:id',  ctrl.update);
  r.delete('/:id', ctrl.remove);
  return r;
}

module.exports = {
  roadmapRouter:  buildContentRouter(roadmapCtrl),
  certRouter:     buildContentRouter(certCtrl),
  resourceRouter: buildContentRouter(resourceCtrl),
  resumeRouter:   buildContentRouter(resumeCtrl),
};
