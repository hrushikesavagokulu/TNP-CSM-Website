const express = require('express');
const authenticate = require('../../middleware/auth.middleware');
const { getTopics, getProblems } = require('../../controllers/dsa.controller');

const router = express.Router();

router.get('/dsa/topics', authenticate, getTopics);
router.get('/dsa/problems', authenticate, getProblems);

module.exports = router;
