'use strict';

const fs             = require('fs');
const path           = require('path');
const crypto         = require('crypto');
const DepartmentInfo = require('../../models/DepartmentInfo.model');
const FacultyLink    = require('../../models/FacultyLink.model');
const SchemeLink     = require('../../models/SchemeLink.model');
const { sendResponse } = require('../../utils/apiResponse');
const asyncHandler   = require('../../utils/asyncHandler');

// Helper to save file upload to disk under local directory
const saveUploadedFile = (file, folderName) => {
  const rootDir = path.join(__dirname, '..', '..', '..');
  const uploadDir = path.join(rootDir, 'uploads', folderName);

  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const ext = path.extname(file.originalname);
  const randomName = crypto.randomBytes(16).toString('hex') + ext;
  const destPath = path.join(uploadDir, randomName);

  fs.writeFileSync(destPath, file.buffer);
  return `/uploads/${folderName}/${randomName}`;
};

// ── Department Info Singleton CRUD ───────────────────────────────────────────

const getDepartmentInfo = asyncHandler(async (req, res) => {
  let info = await DepartmentInfo.findOne();
  if (!info) {
    info = await DepartmentInfo.create({ motto: '', vision: '', mission: '', heroImageUrl: '' });
  }
  return sendResponse(res, 200, {
    success: true,
    data: info,
    message: 'Department info loaded.',
  });
});

const updateDepartmentInfo = asyncHandler(async (req, res) => {
  const { motto, vision, mission, heroImageUrl } = req.body;

  const updates = {};
  if (motto !== undefined) updates.motto = motto;
  if (vision !== undefined) updates.vision = vision;
  if (mission !== undefined) updates.mission = mission;
  if (heroImageUrl !== undefined) updates.heroImageUrl = heroImageUrl;

  const info = await DepartmentInfo.findOneAndUpdate(
    {},
    { $set: updates },
    { upsert: true, new: true, runValidators: true }
  );

  return sendResponse(res, 200, {
    success: true,
    data: info,
    message: 'Department info updated successfully.',
  });
});

const uploadHeroImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    return sendResponse(res, 400, {
      success: false,
      message: 'No image file provided.',
      error: 'NO_FILE',
    });
  }

  const fileUrl = saveUploadedFile(req.file, 'department-hero');
  return sendResponse(res, 200, {
    success: true,
    data: { fileUrl },
    message: 'Hero image uploaded successfully.',
  });
});

// ── HOD / Faculty Links CRUD ──────────────────────────────────────────────────

const getFacultyLinks = asyncHandler(async (req, res) => {
  const list = await FacultyLink.find().sort({ order: 1 });
  return sendResponse(res, 200, {
    success: true,
    data: list,
  });
});

const createFacultyLink = asyncHandler(async (req, res) => {
  const {
    name,
    designation,
    qualifications,
    researchInterest,
    googleScholar,
    apaarId,
    vidwanProfile,
    email,
    isGuest,
    imageUrl,
    order,
  } = req.body;

  if (!name || !designation) {
    return sendResponse(res, 400, {
      success: false,
      message: 'Name and designation are required fields.',
      error: 'MISSING_FIELDS',
    });
  }

  const link = await FacultyLink.create({
    name,
    designation,
    qualifications: qualifications || '',
    researchInterest: researchInterest || '',
    googleScholar: googleScholar || '',
    apaarId: apaarId || '',
    vidwanProfile: vidwanProfile || '',
    email: email || '',
    isGuest: !!isGuest,
    imageUrl: imageUrl || '',
    order: order !== undefined ? Number(order) : 0,
  });

  return sendResponse(res, 201, {
    success: true,
    data: link,
    message: 'Faculty link created successfully.',
  });
});

const updateFacultyLink = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    name,
    designation,
    qualifications,
    researchInterest,
    googleScholar,
    apaarId,
    vidwanProfile,
    email,
    isGuest,
    imageUrl,
    order,
  } = req.body;

  const updates = {};
  if (name !== undefined) updates.name = name;
  if (designation !== undefined) updates.designation = designation;
  if (qualifications !== undefined) updates.qualifications = qualifications;
  if (researchInterest !== undefined) updates.researchInterest = researchInterest;
  if (googleScholar !== undefined) updates.googleScholar = googleScholar;
  if (apaarId !== undefined) updates.apaarId = apaarId;
  if (vidwanProfile !== undefined) updates.vidwanProfile = vidwanProfile;
  if (email !== undefined) updates.email = email;
  if (isGuest !== undefined) updates.isGuest = !!isGuest;
  if (imageUrl !== undefined) updates.imageUrl = imageUrl;
  if (order !== undefined) updates.order = Number(order);

  const updated = await FacultyLink.findByIdAndUpdate(
    id,
    { $set: updates },
    { new: true, runValidators: true }
  );

  if (!updated) {
    return sendResponse(res, 404, {
      success: false,
      message: 'Faculty link not found.',
      error: 'NOT_FOUND',
    });
  }

  return sendResponse(res, 200, {
    success: true,
    data: updated,
    message: 'Faculty link updated successfully.',
  });
});

const deleteFacultyLink = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const deleted = await FacultyLink.findByIdAndDelete(id);

  if (!deleted) {
    return sendResponse(res, 404, {
      success: false,
      message: 'Faculty link not found.',
      error: 'NOT_FOUND',
    });
  }

  return sendResponse(res, 200, {
    success: true,
    message: 'Faculty link deleted successfully.',
  });
});

// ── Scheme / Syllabus Links CRUD ──────────────────────────────────────────────

const getSchemeLinks = asyncHandler(async (req, res) => {
  const list = await SchemeLink.find().sort({ order: 1 });
  return sendResponse(res, 200, {
    success: true,
    data: list,
  });
});

const createSchemeLink = asyncHandler(async (req, res) => {
  const { schemeYear, title, url, order } = req.body;

  if (!schemeYear || !title || !url) {
    return sendResponse(res, 400, {
      success: false,
      message: 'Scheme year, title, and PDF URL are required fields.',
      error: 'MISSING_FIELDS',
    });
  }

  const link = await SchemeLink.create({
    schemeYear,
    title,
    url,
    order: order !== undefined ? Number(order) : 0,
  });

  return sendResponse(res, 201, {
    success: true,
    data: link,
    message: 'Scheme syllabus link created successfully.',
  });
});

const updateSchemeLink = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { schemeYear, title, url, order } = req.body;

  const updates = {};
  if (schemeYear !== undefined) updates.schemeYear = schemeYear;
  if (title !== undefined) updates.title = title;
  if (url !== undefined) updates.url = url;
  if (order !== undefined) updates.order = Number(order);

  const updated = await SchemeLink.findByIdAndUpdate(
    id,
    { $set: updates },
    { new: true, runValidators: true }
  );

  if (!updated) {
    return sendResponse(res, 404, {
      success: false,
      message: 'Scheme link not found.',
      error: 'NOT_FOUND',
    });
  }

  return sendResponse(res, 200, {
    success: true,
    data: updated,
    message: 'Scheme syllabus link updated successfully.',
  });
});

const deleteSchemeLink = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const deleted = await SchemeLink.findByIdAndDelete(id);

  if (!deleted) {
    return sendResponse(res, 404, {
      success: false,
      message: 'Scheme link not found.',
      error: 'NOT_FOUND',
    });
  }

  return sendResponse(res, 200, {
    success: true,
    message: 'Scheme syllabus link deleted successfully.',
  });
});

const uploadFacultyPhoto = asyncHandler(async (req, res) => {
  if (!req.file) {
    return sendResponse(res, 400, {
      success: false,
      message: 'No image file provided.',
      error: 'NO_FILE',
    });
  }

  const fileUrl = saveUploadedFile(req.file, 'faculty-photos');
  return sendResponse(res, 200, {
    success: true,
    data: { fileUrl },
    message: 'Faculty photo uploaded successfully.',
  });
});

module.exports = {
  getDepartmentInfo,
  updateDepartmentInfo,
  uploadHeroImage,
  uploadFacultyPhoto,

  getFacultyLinks,
  createFacultyLink,
  updateFacultyLink,
  deleteFacultyLink,

  getSchemeLinks,
  createSchemeLink,
  updateSchemeLink,
  deleteSchemeLink,
};
