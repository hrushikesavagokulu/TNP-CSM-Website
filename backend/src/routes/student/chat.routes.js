'use strict';

const express      = require('express');
const authenticate = require('../../middleware/auth.middleware');
const {
  getSpaces,
  getMessages,
  sendMessage,
  toggleReaction,
  deleteMessageStudent,
} = require('../../controllers/chat.controller');

const router = express.Router();

router.use(authenticate);

router.get('/chat/spaces',                     getSpaces);
router.get('/chat/:spaceId/messages',          getMessages);
router.post('/chat/:spaceId/messages',         sendMessage);
router.post('/chat/messages/:id/react',        toggleReaction);
router.delete('/chat/messages/:id',            deleteMessageStudent);

module.exports = router;
