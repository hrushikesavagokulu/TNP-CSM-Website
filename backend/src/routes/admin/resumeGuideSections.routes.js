'use strict';

const express = require('express');
const router  = express.Router();
const ctrl    = require('../../controllers/admin/resumeGuideSections.admin.controller');

router.get('/',           ctrl.list);
router.post('/',          ctrl.create);
router.patch('/reorder',  ctrl.reorder);   // must be before /:id
router.patch('/:id',      ctrl.update);
router.delete('/:id',     ctrl.remove);

module.exports = router;
