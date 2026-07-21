'use strict';

const express      = require('express');
const authenticate = require('../../middleware/auth.middleware');
const controller   = require('../../controllers/achievement.controller');

const router = express.Router();

router.use(authenticate);

router.get('/achievements', controller.getAchievements);

module.exports = router;
