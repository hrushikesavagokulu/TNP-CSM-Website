'use strict';

const express = require('express');
const router  = express.Router();
const controller = require('../controllers/public.controller');

router.get('/department-info', controller.getDepartmentInfo);
router.get('/faculty-links',    controller.getFacultyLinks);
router.get('/scheme-links',     controller.getSchemeLinks);

module.exports = router;
