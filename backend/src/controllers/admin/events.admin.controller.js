'use strict';

const crypto = require('crypto');
const Event = require('../../models/Event.model');
const EventRegistration = require('../../models/EventRegistration.model');
const driveService = require('../../services/drive.service');
const certificateZipService = require('../../services/certificateZip.service');
const { deleteAllEventFiles } = require('../../utils/deleteEventStorage');
const { getServiceAccountEmail } = require('../../config/googleDrive');
const asyncHandler = require('../../utils/asyncHandler');
const { sendResponse } = require('../../utils/apiResponse');

/**
 * Helper to generate a clean shareable slug.
 */
function generateSlug(title) {
  const cleanTitle = (title || 'event')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 30);
  const randomSuffix = crypto.randomBytes(4).toString('hex');
  return `${cleanTitle}-${randomSuffix}`;
}

/**
 * GET /api/v1/admin/service-account-email
 * Returns the Google Service Account email for admin folder sharing.
 */
const getServiceAccountEmailHandler = asyncHandler(async (_req, res) => {
  const email = getServiceAccountEmail();
  return sendResponse(res, 200, {
    success: true,
    data: { email },
  });
});

/**
 * POST /api/v1/admin/events
 * Creates a new event with Google Drive folder verification.
 */
const createEvent = asyncHandler(async (req, res) => {
  const {
    title,
    semester,
    description,
    batchLabel,
    driveFolderLink,
    expiresAt,
    allowedUploadTypes,
  } = req.body;

  if (!title || !semester || !description || !driveFolderLink) {
    return sendResponse(res, 400, {
      success: false,
      message: 'Title, semester, description, and Google Drive folder link are required.',
    });
  }

  // 1. Extract folder ID
  const driveRootFolderId = driveService.extractFolderIdFromLink(driveFolderLink);

  // 2. Verify service account has Editor access to this folder
  await driveService.verifyFolderAccess(driveRootFolderId);

  // 3. Generate unique shareable slug
  const shareableSlug = generateSlug(title);

  // 4. Create Event document
  const event = await Event.create({
    title: title.trim(),
    semester: semester.trim(),
    description: description.trim(),
    batchLabel: batchLabel ? batchLabel.trim() : null,
    driveRootFolderId,
    driveRootFolderLink: driveFolderLink.trim(),
    yearFolderIds: new Map(),
    expiresAt: expiresAt ? new Date(expiresAt) : null,
    isClosed: false,
    allowedUploadTypes: allowedUploadTypes || ['image', 'pdf'],
    shareableSlug,
    createdBy: req.user ? req.user._id : null,
  });

  return sendResponse(res, 201, {
    success: true,
    data: event,
    message: 'Event created successfully. Google Drive folder verified.',
  });
});

/**
 * GET /api/v1/admin/events
 * Returns list of events with registration counts.
 */
const getAdminEvents = asyncHandler(async (_req, res) => {
  const events = await Event.find().sort({ createdAt: -1 }).lean();

  const eventsWithStats = await Promise.all(
    events.map(async (event) => {
      const registrationCount = await EventRegistration.countDocuments({ event: event._id });
      const regDocs = await EventRegistration.find({ event: event._id }).select('certificates').lean();
      const certificateCount = regDocs.reduce((acc, r) => acc + (r.certificates ? r.certificates.length : 0), 0);

      return {
        ...event,
        registrationCount,
        certificateCount,
      };
    })
  );

  return sendResponse(res, 200, {
    success: true,
    data: eventsWithStats,
  });
});

/**
 * PATCH /api/v1/admin/events/:id
 * Updates event configuration. Re-verifies Drive folder if link changed.
 */
const updateEvent = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    title,
    semester,
    description,
    batchLabel,
    driveFolderLink,
    expiresAt,
    isClosed,
    allowedUploadTypes,
  } = req.body;

  const event = await Event.findById(id);
  if (!event) {
    return sendResponse(res, 404, {
      success: false,
      message: 'Event not found.',
    });
  }

  if (title) event.title = title.trim();
  if (semester) event.semester = semester.trim();
  if (description) event.description = description.trim();
  if (batchLabel !== undefined) event.batchLabel = batchLabel ? batchLabel.trim() : null;
  if (typeof isClosed === 'boolean') event.isClosed = isClosed;
  if (expiresAt !== undefined) event.expiresAt = expiresAt ? new Date(expiresAt) : null;
  if (allowedUploadTypes) event.allowedUploadTypes = allowedUploadTypes;

  if (driveFolderLink && driveFolderLink.trim() !== event.driveRootFolderLink) {
    const newFolderId = driveService.extractFolderIdFromLink(driveFolderLink);
    await driveService.verifyFolderAccess(newFolderId);
    event.driveRootFolderId = newFolderId;
    event.driveRootFolderLink = driveFolderLink.trim();
    event.yearFolderIds = new Map(); // reset cached year subfolders
  }

  await event.save();

  return sendResponse(res, 200, {
    success: true,
    data: event,
    message: 'Event updated successfully.',
  });
});

/**
 * GET /api/v1/admin/events/:id/registrations
 * Returns all student registrations and certificates for an event.
 */
const getEventRegistrations = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const event = await Event.findById(id).lean();
  if (!event) {
    return sendResponse(res, 404, {
      success: false,
      message: 'Event not found.',
    });
  }

  const registrations = await EventRegistration.find({ event: id })
    .populate('user', 'name rollNo email section year profilePhoto')
    .sort({ createdAt: -1 })
    .lean();

  return sendResponse(res, 200, {
    success: true,
    data: {
      event,
      registrations,
    },
  });
});

/**
 * GET /api/v1/admin/events/:id/download-zip
 * Non-destructive: Streams ZIP archive of all event certificates to admin.
 */
const downloadEventZip = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await certificateZipService.streamEventCertificatesZip({ eventId: id, res });
});

/**
 * DELETE /api/v1/admin/events/:id
 * Destructive delete lifecycle with safe order of operations:
 * 1. Stream ZIP response body to client.
 * 2. ONLY after confirmed successful delivery (res 'finish' event), move Drive files to trash,
 *    and delete Mongo EventRegistration + Event documents.
 */
const deleteEvent = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const event = await Event.findById(id);
  if (!event) {
    return sendResponse(res, 404, {
      success: false,
      message: 'Event not found.',
    });
  }

  // Hook finish event to execute deletion ONLY after zip is fully delivered
  res.on('finish', async () => {
    try {
      // Move files & year subfolders to Google Drive trash
      await deleteAllEventFiles(event);

      // Delete all Mongo registrations
      await EventRegistration.deleteMany({ event: id });

      // Delete Event document
      await Event.findByIdAndDelete(id);

      console.log(`[Event Delete] Successfully deleted Event ${id} and moved files to Drive trash after ZIP delivery.`);
    } catch (err) {
      console.error(`[Event Delete Error] Cleanup failed for Event ${id}:`, err.message);
    }
  });

  // Stream ZIP file as HTTP response
  await certificateZipService.streamEventCertificatesZip({ eventId: id, res });
});

/**
 * GET /api/v1/admin/events/:id/share-link
 * Returns the shareable submission URL link for an event.
 */
const getEventShareLink = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const event = await Event.findById(id).lean();
  if (!event) {
    return sendResponse(res, 404, {
      success: false,
      message: 'Event not found.',
    });
  }

  const frontendOrigin = process.env.FRONTEND_ORIGIN || 'http://localhost:3000';
  const shareableUrl = `${frontendOrigin}/events/submit/${event.shareableSlug}`;

  return sendResponse(res, 200, {
    success: true,
    data: {
      shareableSlug: event.shareableSlug,
      shareableUrl,
    },
  });
});

module.exports = {
  getServiceAccountEmailHandler,
  createEvent,
  getAdminEvents,
  updateEvent,
  getEventRegistrations,
  downloadEventZip,
  deleteEvent,
  getEventShareLink,
};
