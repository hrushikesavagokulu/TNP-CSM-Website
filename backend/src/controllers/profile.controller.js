'use strict';

const fs             = require('fs');
const path           = require('path');
const crypto         = require('crypto');
const bcrypt         = require('bcryptjs');
const User           = require('../models/User.model');
const SkillsCatalogue = require('../models/SkillsCatalogue.model');
const otpService     = require('../services/otp.service');
const { sendResponse } = require('../utils/apiResponse');
const asyncHandler   = require('../utils/asyncHandler');

// ── GET /student/profile/me ──────────────────────────────────────────────────
const getMe = asyncHandler(async (req, res) => {
  return sendResponse(res, 200, {
    success: true,
    data: req.user,
    message: 'Profile retrieved successfully',
  });
});

// ── GET /student/profile/:rollNo ──────────────────────────────────────────────
const getProfileByRollNo = asyncHandler(async (req, res) => {
  const rollNo = req.params.rollNo.toUpperCase();

  const profileUser = await User.findOne({ rollNo }).select('+passwordHash');
  if (!profileUser) {
    return sendResponse(res, 404, {
      success: false,
      message: 'Student profile not found',
      error: 'NOT_FOUND',
    });
  }

  const isOwner = req.user.rollNo === rollNo;
  const isAdmin = req.user.role === 'admin';

  let responseData = profileUser.toObject();
  delete responseData.passwordHash; // Safe fallback

  if (isOwner || isAdmin) {
    // Owner or Admin gets full profile
    return sendResponse(res, 200, {
      success: true,
      data: responseData,
      message: 'Full profile retrieved successfully',
    });
  } else {
    // Peer viewing another student profile: hide private details
    responseData.phone = 'Private';
    responseData.parentPhone = 'Private';
    responseData.profileImage = null;
    responseData.isPhotoHidden = true;

    return sendResponse(res, 200, {
      success: true,
      data: responseData,
      message: 'Public profile retrieved successfully',
    });
  }
});

// ── PATCH /student/profile/me ────────────────────────────────────────────────
const updateMe = asyncHandler(async (req, res) => {
  const updates = req.body;

  // EXPLICITLY reject email or rollNo changes
  if ('email' in updates || 'rollNo' in updates) {
    const invalidField = 'email' in updates ? 'email' : 'rollNo';
    return sendResponse(res, 400, {
      success: false,
      message: `Modification of ${invalidField} is not allowed.`,
      error: 'FIELD_LOCKED',
    });
  }

  // Allowed fields for update
  const allowedFields = [
    'phone', 'parentPhone', 'branch', 'isHostel',
    'laptopAvailable', 'mncOrHigherEd', 'skills',
    'links', 'projectLinks', 'profileImage', 'achievements'
  ];

  const filteredUpdates = {};
  for (const field of allowedFields) {
    if (field in updates) {
      filteredUpdates[field] = updates[field];
    }
  }

  // Update in MongoDB
  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    { $set: filteredUpdates },
    { new: true, runValidators: true }
  );

  return sendResponse(res, 200, {
    success: true,
    data: updatedUser,
    message: 'Profile updated successfully',
  });
});

// ── POST /student/profile/change-password ────────────────────────────────────
const changePassword = asyncHandler(async (req, res) => {
  const { action = 'request', otp, newPassword } = req.body;

  if (action === 'request') {
    // Generate and send OTP for password change
    await otpService.generateAndSendOtp(req.user.email, 'profile-password-change');
    return sendResponse(res, 200, {
      success: true,
      message: 'OTP sent to your registered email.',
    });
  }

  if (action === 'verify') {
    if (!otp || !newPassword) {
      return sendResponse(res, 400, {
        success: false,
        message: 'OTP and new password are required.',
        error: 'MISSING_FIELDS',
      });
    }

    if (newPassword.length < 8) {
      return sendResponse(res, 400, {
        success: false,
        message: 'Password must be at least 8 characters.',
        error: 'INVALID_PASSWORD',
      });
    }

    // Verify OTP
    await otpService.verifyOtp(req.user.email, 'profile-password-change', otp);

    // Hash and save new password
    const passwordHash = await bcrypt.hash(newPassword, 12);
    await User.updateOne({ _id: req.user._id }, { passwordHash });

    return sendResponse(res, 200, {
      success: true,
      message: 'Password changed successfully.',
    });
  }

  return sendResponse(res, 400, {
    success: false,
    message: 'Invalid action. Must be request or verify.',
    error: 'INVALID_ACTION',
  });
});

// ── GET /student/search ──────────────────────────────────────────────────────
const searchStudents = asyncHandler(async (req, res) => {
  const query = req.query.query || '';

  if (!query.trim()) {
    return sendResponse(res, 200, {
      success: true,
      data: [],
      message: 'Empty query returned no results',
    });
  }

  // Case insensitive match on name OR rollNo
  const regex = new RegExp(query, 'i');
  const results = await User.find({
    $and: [
      { _id: { $ne: req.user._id } }, // Exclude caller
      { isActive: true },
      { role: 'student' },
      {
        $or: [
          { name: { $regex: regex } },
          { rollNo: { $regex: regex } }
        ]
      }
    ]
  })
  .select('name rollNo profileImage')
  .limit(20);

  return sendResponse(res, 200, {
    success: true,
    data: results,
    message: `Found ${results.length} students`,
  });
});

// ── GET /skills-catalogue ────────────────────────────────────────────────────
const getSkillsCatalogue = asyncHandler(async (req, res) => {
  const list = await SkillsCatalogue.find().sort({ name: 1 });
  const names = list.map(item => item.name);
  return sendResponse(res, 200, {
    success: true,
    data: names,
    message: 'Skills catalogue loaded',
  });
});

// ── File Helpers and Upload Enpoints ──────────────────────────────────────────
const saveUploadedFile = (file, folderName) => {
  // Determine absolute path to root directory
  const rootDir = path.join(__dirname, '..', '..');
  const uploadDir = path.join(rootDir, 'uploads', folderName);

  // Ensure directories exist
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  // Create unique filename
  const ext = path.extname(file.originalname);
  const randomName = crypto.randomBytes(16).toString('hex') + ext;
  const destPath = path.join(uploadDir, randomName);

  // Write file buffer
  fs.writeFileSync(destPath, file.buffer);

  // Return public path url
  return `/uploads/${folderName}/${randomName}`;
};

const uploadPhoto = asyncHandler(async (req, res) => {
  if (!req.file) {
    return sendResponse(res, 400, {
      success: false,
      message: 'No photo file provided.',
      error: 'NO_FILE',
    });
  }

  const fileUrl = saveUploadedFile(req.file, 'profile-photos');

  return sendResponse(res, 200, {
    success: true,
    data: { fileUrl },
    message: 'Photo uploaded successfully.',
  });
});

const uploadAchievement = asyncHandler(async (req, res) => {
  if (!req.file) {
    return sendResponse(res, 400, {
      success: false,
      message: 'No document file provided.',
      error: 'NO_FILE',
    });
  }

  const fileUrl = saveUploadedFile(req.file, 'achievements');

  return sendResponse(res, 200, {
    success: true,
    data: { fileUrl },
    message: 'Achievement document uploaded successfully.',
  });
});

module.exports = {
  getMe,
  getProfileByRollNo,
  updateMe,
  changePassword,
  searchStudents,
  getSkillsCatalogue,
  uploadPhoto,
  uploadAchievement,
};
