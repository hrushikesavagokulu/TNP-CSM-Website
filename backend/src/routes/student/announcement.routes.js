'use strict';

const express    = require('express');
const controller = require('../../controllers/announcement.controller');
const authenticate = require('../../middleware/auth.middleware');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Group list (live unread counts included)
router.get('/announcement-groups',         controller.getAnnouncementGroups);
// Announcements for a specific group
router.get('/announcements',               controller.getAnnouncements);
// Mark an announcement as read
router.post('/announcements/:id/read',     controller.markAsRead);

module.exports = router;
