'use strict';

const User           = require('../../models/User.model');
const AdminAllowList = require('../../models/AdminAllowList.model');
const { sendResponse } = require('../../utils/apiResponse');
const asyncHandler   = require('../../utils/asyncHandler');

// ── GET /admin/admins ────────────────────────────────────────────────────────
const getAdmins = asyncHandler(async (req, res) => {
  // 1. Fetch all registered admins
  const activeAdmins = await User.find({ role: 'admin' }).sort({ name: 1 });

  // 2. Fetch all allowed emails
  const allowList = await AdminAllowList.find().sort({ email: 1 });

  // 3. Separate pending invites (present in allowlist but not in User with role admin)
  const activeEmails = new Set(activeAdmins.map(admin => admin.email.toLowerCase()));
  
  const pendingInvites = allowList
    .filter(entry => !activeEmails.has(entry.email.toLowerCase()))
    .map(entry => ({
      _id: entry._id,
      email: entry.email,
      isPending: true,
      createdAt: entry.createdAt,
    }));

  return sendResponse(res, 200, {
    success: true,
    data: {
      activeAdmins: activeAdmins.map(admin => ({
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        rollNo: admin.rollNo,
        isPending: false,
        createdAt: admin.createdAt,
      })),
      pendingInvites,
    },
    message: 'Administrators and pending invites list retrieved successfully',
  });
});

// ── POST /admin/admins (Invite Admin / Allowlist Email) ──────────────────────
const addAdminInvite = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return sendResponse(res, 400, {
      success: false,
      message: 'Email address is required.',
      error: 'MISSING_EMAIL',
    });
  }

  const cleanEmail = email.trim().toLowerCase();

  // Check if already in allowlist
  const inviteExists = await AdminAllowList.exists({ email: cleanEmail });
  if (inviteExists) {
    return sendResponse(res, 409, {
      success: false,
      message: 'This email is already in the administrator allowlist.',
      error: 'ALLOWLIST_EXISTS',
    });
  }

  // Create allowlist invite
  const newInvite = await AdminAllowList.create({
    email: cleanEmail,
    addedBy: req.user._id,
  });

  // If a registered User with this email already exists, elevate role immediately
  const existingUser = await User.findOne({ email: cleanEmail });
  if (existingUser) {
    if (existingUser.role !== 'admin') {
      existingUser.role = 'admin';
      await existingUser.save();
    }
    return sendResponse(res, 201, {
      success: true,
      data: {
        _id: existingUser._id,
        name: existingUser.name,
        email: existingUser.email,
        rollNo: existingUser.rollNo,
        isPending: false,
        createdAt: existingUser.createdAt,
      },
      message: `Email added. User ${cleanEmail} role immediately elevated to administrator.`,
    });
  }

  return sendResponse(res, 201, {
    success: true,
    data: {
      _id: newInvite._id,
      email: newInvite.email,
      isPending: true,
      createdAt: newInvite.createdAt,
    },
    message: `Email ${cleanEmail} successfully added to admin allowlist (Invite Pending).`,
  });
});

// ── DELETE /admin/admins/:id (Remove Invite or Demote Admin) ─────────────────
const deleteAdminOrInvite = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Check if it corresponds to an allowlist entry (pending invite)
  const invite = await AdminAllowList.findById(id);

  if (invite) {
    // If it's a pending invite, just remove it from allowlist
    // But wait: check if there is an active registered user with this email to prevent removing active admins
    const registeredUser = await User.findOne({ email: invite.email.toLowerCase() });
    
    if (registeredUser && registeredUser.role === 'admin') {
      // Validate last remaining admin constraint before demoting active user
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount <= 1) {
        return sendResponse(res, 400, {
          success: false,
          message: 'Demotion blocked. You cannot remove the last administrator from the system.',
          error: 'LAST_ADMIN_PROTECTED',
        });
      }
      registeredUser.role = 'student';
      await registeredUser.save();
    }

    await invite.deleteOne();

    return sendResponse(res, 200, {
      success: true,
      message: 'Email invitation successfully removed.',
    });
  }

  // Check if it corresponds to an active User ID
  const registeredUser = await User.findById(id);

  if (registeredUser && registeredUser.role === 'admin') {
    // Validate last remaining admin constraint
    const adminCount = await User.countDocuments({ role: 'admin' });
    if (adminCount <= 1) {
      return sendResponse(res, 400, {
        success: false,
        message: 'Demotion blocked. You cannot remove the last administrator from the system.',
        error: 'LAST_ADMIN_PROTECTED',
      });
    }

    // Demote role back to student
    registeredUser.role = 'student';
    await registeredUser.save();

    // Also clear them from the allowlist so their next login does not auto-elevate them
    await AdminAllowList.deleteOne({ email: registeredUser.email.toLowerCase() });

    return sendResponse(res, 200, {
      success: true,
      message: `User ${registeredUser.email} demoted to student successfully.`,
    });
  }

  return sendResponse(res, 404, {
    success: false,
    message: 'Admin user or pending invite record not found.',
    error: 'NOT_FOUND',
  });
});

// ── POST /admin/admins/create-credentials ────────────────────────────────────
const bcrypt = require('bcryptjs');

const createAdminCredentials = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return sendResponse(res, 400, {
      success: false,
      message: 'Name, email, and password are required.',
      error: 'MISSING_FIELDS',
    });
  }

  const cleanEmail = email.trim().toLowerCase();

  // Validate email uniqueness
  const userExists = await User.exists({ email: cleanEmail });
  if (userExists) {
    return sendResponse(res, 400, {
      success: false,
      message: 'A user with this email address already exists.',
      error: 'EMAIL_IN_USE',
    });
  }

  // Validate password meets: min 8 characters, at least one number
  if (password.length < 8 || !/\d/.test(password)) {
    return sendResponse(res, 400, {
      success: false,
      message: 'Password must be at least 8 characters and contain at least one number.',
      error: 'WEAK_PASSWORD',
    });
  }

  // If email is present in allow-list as pending invite, remove it
  await AdminAllowList.deleteOne({ email: cleanEmail });

  // bcrypt hash (cost 12)
  const passwordHash = await bcrypt.hash(password, 12);

  // Create User directly (no rollNo is needed for admin role)
  const newAdmin = await User.create({
    name: name.trim(),
    email: cleanEmail,
    passwordHash,
    role: 'admin',
    isActive: true,
  });

  return sendResponse(res, 201, {
    success: true,
    data: {
      _id: newAdmin._id,
      name: newAdmin.name,
      email: newAdmin.email,
    },
    message: 'Administrator account created successfully.',
  });
});

module.exports = {
  getAdmins,
  addAdminInvite,
  deleteAdminOrInvite,
  createAdminCredentials,
};
