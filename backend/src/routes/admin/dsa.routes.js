const express = require('express');
const authenticate = require('../../middleware/auth.middleware');
const { requireRole } = require('../../middleware/role.middleware');
const {
  getTopics,
  getProblems,
  addProblem,
  bulkAddProblems,
  updateProblem,
  deleteProblem,
  addOrUpdateTopic,
  deleteTopic,
} = require('../../controllers/dsa.controller');

const router = express.Router();

router.get('/topics', authenticate, requireRole('admin'), getTopics);
router.post('/topics', authenticate, requireRole('admin'), addOrUpdateTopic);
router.delete('/topics/:id', authenticate, requireRole('admin'), deleteTopic);

router.get('/problems', authenticate, requireRole('admin'), getProblems);
router.post('/problems', authenticate, requireRole('admin'), addProblem);
router.post('/problems/bulk', authenticate, requireRole('admin'), bulkAddProblems);
router.patch('/problems/:id', authenticate, requireRole('admin'), updateProblem);
router.delete('/problems/:id', authenticate, requireRole('admin'), deleteProblem);

module.exports = router;
