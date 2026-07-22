'use strict';

/**
 * content.routes.js
 *
 * Mounts Phase 7 admin content routers for Skill Roadmap, Certifications, and Learning Resources.
 * Resume Guide has been replaced by 5 dedicated routers in the Resume Guide v2 module.
 */

const express = require('express');

const SkillRoadmap     = require('../../models/SkillRoadmap.model');
const Certification    = require('../../models/Certification.model');
const LearningResource = require('../../models/LearningResource.model');

const { createContentAdminController } = require('../../controllers/admin/content.admin.controller');

// ── Instantiate one controller set per model ──────────────────────────────────
const roadmapCtrl  = createContentAdminController(SkillRoadmap,     { sortFields: ['semester', 'order'] });
const certCtrl     = createContentAdminController(Certification,     { sortFields: ['semester', 'order'] });
const resourceCtrl = createContentAdminController(LearningResource,  { sortFields: ['skillName', 'order'] });

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
};
