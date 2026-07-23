'use strict';

const { Readable } = require('stream');
const { getDriveClient, getServiceAccountEmail } = require('../config/googleDrive');
const yearToRoman = require('../utils/yearToRoman');
const Event = require('../models/Event.model');

/**
 * Extracts a Google Drive Folder ID from a full URL or raw ID string.
 */
function extractFolderIdFromLink(driveLink) {
  if (!driveLink || typeof driveLink !== 'string') {
    throw new Error('Google Drive folder link is required');
  }

  const trimmed = driveLink.trim();

  // Match /folders/FOLDER_ID or /u/0/folders/FOLDER_ID
  const match = trimmed.match(/\/folders\/([a-zA-Z0-9_-]+)/);
  if (match && match[1]) {
    return match[1];
  }

  // Check if it's already a raw ID
  if (/^[a-zA-Z0-9_-]{10,}$/.test(trimmed)) {
    return trimmed;
  }

  throw new Error('Invalid Google Drive folder link format. Please paste a valid folder link.');
}

/**
 * Verifies that the service account has Editor access to the given Google Drive folder ID.
 */
async function verifyFolderAccess(folderId) {
  const drive = getDriveClient();
  const email = getServiceAccountEmail();

  try {
    const res = await drive.files.get({
      fileId: folderId,
      fields: 'id, name, mimeType, capabilities',
      supportsAllDrives: true,
    });

    if (res.data.mimeType !== 'application/vnd.google-apps.folder') {
      throw new Error('The provided Google Drive URL is a file, not a folder.');
    }

    return res.data;
  } catch (err) {
    if (err.message && err.message.includes('file, not a folder')) {
      throw err;
    }

    // Check for Google Drive API disabled in Google Cloud Console
    if (err.message && (err.message.includes('Google Drive API has not been used') || err.message.includes('SERVICE_DISABLED') || err.message.includes('disabled'))) {
      throw new Error(
        'The Google Drive API is not enabled in your Google Cloud Console project. ' +
        'Please enable the "Google Drive API" at: https://console.cloud.google.com/apis/library/drive.googleapis.com and wait 1-2 minutes.'
      );
    }

    throw new Error(
      `Cannot access Google Drive folder (${folderId}). ` +
      `Please ensure you have shared the folder with "${email}" as Editor.`
    );
  }
}

/**
 * Gets or creates a Year-N subfolder inside event.driveRootFolderId.
 * Caches the yearFolderId on event.yearFolderIds in MongoDB.
 */
async function getOrCreateYearFolder({ event, year }) {
  const yearStr = String(year);
  console.log(`\n=================== [getOrCreateYearFolder START] ===================`);
  console.log(`[getOrCreateYearFolder] Event ID: ${event._id}`);
  console.log(`[getOrCreateYearFolder] Target Year: "${yearStr}"`);
  console.log(`[getOrCreateYearFolder] Root Folder ID: "${event.driveRootFolderId}"`);
  console.log(`[getOrCreateYearFolder] In-memory event.yearFolderIds:`, event.yearFolderIds);

  // 1. Check if cached on event doc
  let cachedId = null;
  if (event.yearFolderIds && typeof event.yearFolderIds.get === 'function') {
    cachedId = event.yearFolderIds.get(yearStr);
    console.log(`[getOrCreateYearFolder] Check via Map.get("${yearStr}"): "${cachedId}"`);
  } else if (event.yearFolderIds && event.yearFolderIds[yearStr]) {
    cachedId = event.yearFolderIds[yearStr];
    console.log(`[getOrCreateYearFolder] Check via Object bracket["${yearStr}"]: "${cachedId}"`);
  }

  if (cachedId) {
    console.log(`[getOrCreateYearFolder] ✅ CACHE HIT! Returning cached folder ID: "${cachedId}"`);
    console.log(`=================== [getOrCreateYearFolder END] ===================\n`);
    return cachedId;
  }

  console.log(`[getOrCreateYearFolder] ⚠️ CACHE MISS! Querying Google Drive for existing folder...`);

  const drive = getDriveClient();
  const folderName = `Year-${yearStr}`;
  const query = `'${event.driveRootFolderId}' in parents and name = '${folderName}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;

  console.log(`[getOrCreateYearFolder] Drive List Query: "${query}"`);
  const searchRes = await drive.files.list({
    q: query,
    fields: 'files(id, name, trashed)',
    supportsAllDrives: true,
    includeItemsFromAllDrives: true,
  });

  console.log(`[getOrCreateYearFolder] Drive List Response files count:`, searchRes.data.files?.length || 0);
  console.log(`[getOrCreateYearFolder] Drive List Response raw files:`, JSON.stringify(searchRes.data.files, null, 2));

  let yearFolderId;
  if (searchRes.data.files && searchRes.data.files.length > 0) {
    yearFolderId = searchRes.data.files[0].id;
    console.log(`[getOrCreateYearFolder] ✅ FOUND EXISTING FOLDER IN DRIVE! ID: "${yearFolderId}"`);
  } else {
    console.log(`[getOrCreateYearFolder] ➕ Creating NEW folder in Drive: "${folderName}" under parent "${event.driveRootFolderId}"...`);
    const createRes = await drive.files.create({
      requestBody: {
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
        parents: [event.driveRootFolderId],
      },
      fields: 'id, name',
      supportsAllDrives: true,
    });
    yearFolderId = createRes.data.id;
    console.log(`[getOrCreateYearFolder] ✅ CREATED NEW DRIVE FOLDER! ID: "${yearFolderId}"`);
  }

  // 4. Cache folder ID on Event document and save
  console.log(`[getOrCreateYearFolder] Updating yearFolderIds on event document with key "${yearStr}" => "${yearFolderId}"...`);
  if (!event.yearFolderIds) {
    event.yearFolderIds = new Map();
  }

  if (typeof event.yearFolderIds.set === 'function') {
    event.yearFolderIds.set(yearStr, yearFolderId);
  } else {
    event.yearFolderIds[yearStr] = yearFolderId;
  }
  
  if (typeof event.markModified === 'function') {
    event.markModified('yearFolderIds');
  }

  console.log(`[getOrCreateYearFolder] Saving event document to MongoDB...`);
  await event.save();
  console.log(`[getOrCreateYearFolder] Event.save() complete!`);

  // FRESH RE-FETCH FROM MONGODB TO PROVE PERSISTENCE
  const freshEvent = await Event.findById(event._id);
  console.log(`[getOrCreateYearFolder] 🧪 FRESH MONGO READ event.yearFolderIds:`, freshEvent.yearFolderIds);
  console.log(`=================== [getOrCreateYearFolder END] ===================\n`);

  return yearFolderId;
}

/**
 * Sanitizes strings for safe filename usage.
 */
function sanitizeFilenamePart(str) {
  if (!str) return 'file';
  return String(str)
    .trim()
    .replace(/[^a-zA-Z0-9_-]/g, '-')
    .replace(/-+/g, '-');
}

/**
 * Uploads a certificate file buffer into the specified yearFolderId in Google Drive.
 * Filename format: {yearRoman}-{rollNo}-{certificateName}.{ext}
 */
async function uploadCertificateFile({
  yearFolderId,
  fileBuffer,
  mimeType,
  rollNo,
  certificateName,
  year,
  originalExt,
}) {
  console.log(`\n=================== [uploadCertificateFile START] ===================`);
  console.log(`[uploadCertificateFile] Target yearFolderId: "${yearFolderId}"`);
  console.log(`[uploadCertificateFile] Roll No: "${rollNo}", Cert Name: "${certificateName}", Year: "${year}"`);

  // Validate MIME type
  const isImage = mimeType && mimeType.startsWith('image/');
  const isPdf = mimeType === 'application/pdf';
  if (!isImage && !isPdf) {
    throw new Error('Only image files (PNG, JPG, etc.) and PDF documents are allowed.');
  }

  let ext = originalExt ? originalExt.replace(/^\./, '') : '';
  if (!ext) {
    ext = isPdf ? 'pdf' : 'jpg';
  }

  const roman = yearToRoman(year);
  const cleanRollNo = sanitizeFilenamePart(rollNo);
  const cleanCertName = sanitizeFilenamePart(certificateName);
  const fileName = `${roman}-${cleanRollNo}-${cleanCertName}.${ext}`;

  console.log(`[uploadCertificateFile] Final Target Filename: "${fileName}"`);

  const drive = getDriveClient();

  try {
    console.log(`[uploadCertificateFile] Executing drive.files.create for file upload...`);
    const res = await drive.files.create({
      requestBody: {
        name: fileName,
        parents: [yearFolderId],
      },
      media: {
        mimeType,
        body: Readable.from(fileBuffer),
      },
      fields: 'id, webViewLink, webContentLink',
      supportsAllDrives: true,
    });

    console.log(`[uploadCertificateFile] ✅ DRIVE UPLOAD SUCCESS! File ID: "${res.data.id}"`);
    console.log(`[uploadCertificateFile] File View Link: "${res.data.webViewLink}"`);

    const driveFileId = res.data.id;
    const driveFileLink =
      res.data.webViewLink ||
      res.data.webContentLink ||
      `https://drive.google.com/file/d/${driveFileId}/view`;

    console.log(`=================== [uploadCertificateFile END] ===================\n`);
    return {
      driveFileId,
      driveFileLink,
      fileName,
    };
  } catch (driveErr) {
    console.error(`[uploadCertificateFile] ❌ DRIVE UPLOAD FAILED! Error Message:`, driveErr.message);
    if (driveErr.response) {
      console.error(`[uploadCertificateFile] HTTP Status:`, driveErr.response.status);
      console.error(`[uploadCertificateFile] Raw Response Data:`, JSON.stringify(driveErr.response.data, null, 2));
    }

    console.warn(`\n⚠️ [DRIVE STORAGE FALLBACK WARNING] Google Drive upload encountered error: "${driveErr.message}".`);
    console.warn(`⚠️ [DRIVE STORAGE FALLBACK WARNING] Storing certificate file in MinIO object storage so student upload succeeds...`);

    try {
      const storageService = require('./storage.service');
      const minioKey = `event-certificates/Year-${year}/${Date.now()}-${fileName}`;
      const minioUrl = await storageService.uploadFile({
        buffer: fileBuffer,
        mimeType,
        key: minioKey,
      });

      return {
        driveFileId: `minio-${minioKey}`,
        driveFileLink: minioUrl,
        fileName,
        isFallback: true,
      };
    } catch (minioErr) {
      console.error(`[MinIO Fallback Error]`, minioErr.message);
      throw driveErr;
    }
  }
}

/**
 * Deletes a file from Google Drive.
 */
async function deleteFile(driveFileId) {
  if (!driveFileId) return;

  const drive = getDriveClient();
  try {
    await drive.files.delete({ fileId: driveFileId, supportsAllDrives: true });
  } catch (err) {
    if (err.status !== 404 && (!err.response || err.response.status !== 404)) {
      throw err;
    }
  }
}

/**
 * Recursively lists all certificate files under rootFolderId (including year subfolders).
 * Returns array of { driveFileId, year, fileName }.
 */
async function listAllFilesUnderFolder(rootFolderId) {
  const drive = getDriveClient();

  // Find all subfolders under rootFolderId
  const folderRes = await drive.files.list({
    q: `'${rootFolderId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
    fields: 'files(id, name)',
    supportsAllDrives: true,
    includeItemsFromAllDrives: true,
  });

  const subfolders = folderRes.data.files || [];
  const results = [];

  for (const sf of subfolders) {
    // Extract year from folder name e.g. "Year-1" -> 1
    const yearMatch = sf.name.match(/Year-(\d+)/i);
    const yearNum = yearMatch ? yearMatch[1] : '1';

    // List all non-folder files inside this subfolder
    const fileRes = await drive.files.list({
      q: `'${sf.id}' in parents and mimeType != 'application/vnd.google-apps.folder' and trashed = false`,
      fields: 'files(id, name)',
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
    });

    const files = fileRes.data.files || [];
    for (const f of files) {
      results.push({
        driveFileId: f.id,
        year: yearNum,
        fileName: f.name,
      });
    }
  }

  return results;
}

module.exports = {
  extractFolderIdFromLink,
  verifyFolderAccess,
  getOrCreateYearFolder,
  uploadCertificateFile,
  deleteFile,
  listAllFilesUnderFolder,
};
