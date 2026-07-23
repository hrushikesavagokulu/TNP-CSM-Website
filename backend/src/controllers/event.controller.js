'use strict';

const path = require('path');
const Event = require('../models/Event.model');
const EventRegistration = require('../models/EventRegistration.model');
const driveService = require('../services/drive.service');
const asyncHandler = require('../utils/asyncHandler');
const { sendResponse } = require('../utils/apiResponse');

/**
 * GET /api/v1/student/events
 * Returns open, non-closed events.
 */
const getStudentEvents = asyncHandler(async (req, res) => {
  const events = await Event.find({ isClosed: false })
    .sort({ createdAt: -1 })
    .lean();

  return sendResponse(res, 200, {
    success: true,
    data: events,
  });
});

/**
 * GET /api/v1/student/events/by-slug/:shareableSlug
 * Fetch event details by unique shareable slug.
 */
const getEventBySlug = asyncHandler(async (req, res) => {
  const { shareableSlug } = req.params;

  const event = await Event.findOne({ shareableSlug }).lean();
  if (!event) {
    return sendResponse(res, 404, {
      success: false,
      message: 'Event not found or invalid link.',
    });
  }

  return sendResponse(res, 200, {
    success: true,
    data: event,
  });
});

/**
 * POST /api/v1/student/events/:id/submit-info
 * Submit or update student snapshot info for an event registration.
 */
const submitStudentInfo = asyncHandler(async (req, res) => {
  const { id: eventId } = req.params;
  const { submittedName, submittedRollNo, submittedEmail, submittedSection, submittedYear } = req.body;

  if (!submittedName || !submittedRollNo || !submittedEmail || !submittedSection || !submittedYear) {
    return sendResponse(res, 400, {
      success: false,
      message: 'All 5 student information fields (Name, Roll No, Email, Section, Year) are required.',
    });
  }

  const event = await Event.findById(eventId);
  if (!event) {
    return sendResponse(res, 404, {
      success: false,
      message: 'Event not found.',
    });
  }

  if (event.isClosed) {
    return sendResponse(res, 400, {
      success: false,
      message: 'This event is closed for new submissions.',
    });
  }

  let registration = await EventRegistration.findOne({
    event: eventId,
    user: req.user._id,
  });

  if (registration) {
    registration.submittedName = submittedName.trim();
    registration.submittedRollNo = submittedRollNo.trim();
    registration.submittedEmail = submittedEmail.trim();
    registration.submittedSection = submittedSection.trim();
    registration.submittedYear = String(submittedYear).trim();
    await registration.save();
  } else {
    registration = await EventRegistration.create({
      event: eventId,
      user: req.user._id,
      submittedName: submittedName.trim(),
      submittedRollNo: submittedRollNo.trim(),
      submittedEmail: submittedEmail.trim(),
      submittedSection: submittedSection.trim(),
      submittedYear: String(submittedYear).trim(),
      certificates: [],
    });
  }

  return sendResponse(res, 200, {
    success: true,
    data: registration,
    message: 'Student information saved successfully.',
  });
});

/**
 * POST /api/v1/student/events/:id/upload-certificate
 * Upload a certificate file to Google Drive under the year folder.
 */
const uploadCertificate = asyncHandler(async (req, res) => {
  const { id: eventId } = req.params;
  const { certificateName } = req.body;

  if (!req.file) {
    return sendResponse(res, 400, {
      success: false,
      message: 'Please select a certificate file (PDF or Image) to upload.',
    });
  }

  if (!certificateName || !certificateName.trim()) {
    return sendResponse(res, 400, {
      success: false,
      message: 'Certificate name / label is required.',
    });
  }

  const event = await Event.findById(eventId);
  if (!event) {
    return sendResponse(res, 404, {
      success: false,
      message: 'Event not found.',
    });
  }

  if (event.isClosed) {
    return sendResponse(res, 400, {
      success: false,
      message: 'This event is closed for uploads.',
    });
  }

  const registration = await EventRegistration.findOne({
    event: eventId,
    user: req.user._id,
  });

  if (!registration) {
    return sendResponse(res, 400, {
      success: false,
      message: 'Please submit your student information before uploading certificates.',
    });
  }

  // Get or create year folder in Drive
  const yearFolderId = await driveService.getOrCreateYearFolder({
    event,
    year: registration.submittedYear,
  });

  // Upload certificate file to Drive
  const uploadResult = await driveService.uploadCertificateFile({
    yearFolderId,
    fileBuffer: req.file.buffer,
    mimeType: req.file.mimetype,
    rollNo: registration.submittedRollNo,
    certificateName: certificateName.trim(),
    year: registration.submittedYear,
    originalExt: path.extname(req.file.originalname),
  });

  const isPdf = req.file.mimetype === 'application/pdf';
  const newCert = {
    certificateName: certificateName.trim(),
    driveFileId: uploadResult.driveFileId,
    driveFileLink: uploadResult.driveFileLink,
    fileType: isPdf ? 'pdf' : 'image',
    isFallback: Boolean(uploadResult.isFallback),
    uploadedAt: new Date(),
  };

  registration.certificates.push(newCert);
  await registration.save();

  return sendResponse(res, 201, {
    success: true,
    data: registration,
    message: 'Certificate uploaded successfully to Google Drive.',
  });
});

/**
 * GET /api/v1/student/events/:id/my-submission
 * Fetch current student's registration & certificates for an event.
 */
const getMySubmission = asyncHandler(async (req, res) => {
  const { id: eventId } = req.params;

  const registration = await EventRegistration.findOne({
    event: eventId,
    user: req.user._id,
  }).lean();

  return sendResponse(res, 200, {
    success: true,
    data: registration || null,
  });
});

/**
 * DELETE /api/v1/student/events/:id/certificates/:certId
 * Single certificate delete by student. Moves file to admin's Drive trash.
 */
const deleteSingleCertificate = asyncHandler(async (req, res) => {
  const { id: eventId, certId } = req.params;

  const registration = await EventRegistration.findOne({
    event: eventId,
    user: req.user._id,
  });

  if (!registration) {
    return sendResponse(res, 404, {
      success: false,
      message: 'Registration not found.',
    });
  }

  const certIndex = registration.certificates.findIndex(
    (c) => c._id.toString() === certId
  );

  if (certIndex === -1) {
    return sendResponse(res, 404, {
      success: false,
      message: 'Certificate not found.',
    });
  }

  const cert = registration.certificates[certIndex];

  // Call Drive delete API (moves file to owner's trash)
  if (cert.driveFileId) {
    await driveService.deleteFile(cert.driveFileId);
  }

  registration.certificates.splice(certIndex, 1);
  await registration.save();

  return sendResponse(res, 200, {
    success: true,
    data: registration,
    message: 'Certificate removed and moved to Google Drive trash.',
  });
});

module.exports = {
  getStudentEvents,
  getEventBySlug,
  submitStudentInfo,
  uploadCertificate,
  getMySubmission,
  deleteSingleCertificate,
};
