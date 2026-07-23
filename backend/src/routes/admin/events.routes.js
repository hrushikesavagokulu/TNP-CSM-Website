'use strict';

const express = require('express');
const {
  getServiceAccountEmailHandler,
  createEvent,
  getAdminEvents,
  updateEvent,
  getEventRegistrations,
  downloadEventZip,
  deleteEvent,
  getEventShareLink,
} = require('../../controllers/admin/events.admin.controller');

const router = express.Router();

router.get('/service-account-email', getServiceAccountEmailHandler);

router.route('/')
  .get(getAdminEvents)
  .post(createEvent);

router.route('/:id')
  .patch(updateEvent)
  .delete(deleteEvent);

router.get('/:id/registrations', getEventRegistrations);
router.get('/:id/download-zip', downloadEventZip);
router.get('/:id/share-link', getEventShareLink);

module.exports = router;
