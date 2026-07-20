'use strict';

const express = require('express');
const controller = require('../../controllers/admin/admins.admin.controller');

const router = express.Router();

router.get('/',        controller.getAdmins);
router.post('/',       controller.addAdminInvite);
router.post('/create-credentials', controller.createAdminCredentials);
router.delete('/:id', controller.deleteAdminOrInvite);

module.exports = router;
