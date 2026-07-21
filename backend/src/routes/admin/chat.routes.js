'use strict';

const express = require('express');
const {
  listSpacesAdmin,
  createSpaceAdmin,
  toggleLockSpace,
  deleteSpaceAdmin,
  deleteMessageAdmin,
  removeMemberAdmin,
  postMessageAdmin,
} = require('../../controllers/admin/chat.admin.controller');

const router = express.Router();

router.get('/spaces',                    listSpacesAdmin);
router.post('/spaces',                   createSpaceAdmin);
router.patch('/spaces/:id/lock',         toggleLockSpace);
router.delete('/spaces/:id',             deleteSpaceAdmin);
router.delete('/messages/:id',           deleteMessageAdmin);
router.post('/spaces/:id/remove-member', removeMemberAdmin);
router.post('/spaces/:spaceId/messages', postMessageAdmin);

module.exports = router;
