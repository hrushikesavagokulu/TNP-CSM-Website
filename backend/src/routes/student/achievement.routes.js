'use strict';

const express    = require('express');
const controller = require('../../controllers/achievement.controller');

const router = express.Router();

router.get('/', controller.getPublicAchievements);

module.exports = router;
