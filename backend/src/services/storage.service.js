'use strict';

/**
 * storage.service.js
 *
 * Single source of truth for all file storage operations.
 * Every upload endpoint calls uploadFile() / deleteFile() from here — never fs.writeFile().
 *
 * KEY CONVENTION (enforced via helpers below — never hand-concatenate keys in controllers):
 *   profile-photos/{userId}.{ext}
 *   profile-achievements/{userId}/{achievementEntryId}-{originalFileName}
 *   department/hero-image.{ext}
 *   faculty-photos/{facultyLinkId}.{ext}
 *   announcements/{announcementId}/{originalFileName}
 *   chat-attachments/{spaceId}/{messageId}-{originalFileName}
 *   alumni-photos/{alumniRepoId}.{ext}
 *   achievements-media/{achievementId}/{originalFileName}
 *   resume-guide/{resumeGuideEntryId}/{originalFileName}
 */

const { PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const path      = require('path');
const s3Client  = require('../config/s3');

// ── Core storage operations ───────────────────────────────────────────────────

/**
 * Upload a file buffer to MinIO.
 * @param {{ buffer: Buffer, mimeType: string, key: string }} opts
 * @returns {Promise<string>} public URL of the uploaded object
 */
async function uploadFile({ buffer, mimeType, key }) {
  await s3Client.send(new PutObjectCommand({
    Bucket:      process.env.MINIO_BUCKET,
    Key:         key,
    Body:        buffer,
    ContentType: mimeType,
  }));
  return `${process.env.MINIO_PUBLIC_URL}/${process.env.MINIO_BUCKET}/${key}`;
}

/**
 * Delete an object from MinIO by its key.
 * @param {{ key: string }} opts
 * @returns {Promise<void>}
 */
async function deleteFile({ key }) {
  await s3Client.send(new DeleteObjectCommand({
    Bucket: process.env.MINIO_BUCKET,
    Key:    key,
  }));
}

/**
 * Derive a MinIO object key from a full public URL.
 * Strips  "<MINIO_PUBLIC_URL>/<bucket>/" prefix and returns just the key.
 * Returns null if the URL doesn't match the expected MinIO pattern.
 * @param {string} url
 * @returns {string|null}
 */
function keyFromUrl(url) {
  if (!url) return null;
  const prefix = `${process.env.MINIO_PUBLIC_URL}/${process.env.MINIO_BUCKET}/`;
  if (!url.startsWith(prefix)) return null;
  return url.slice(prefix.length);
}

// ── Key-builder helpers (one per folder prefix — NEVER hand-concatenate in controllers) ──

function buildProfilePhotoKey(userId, originalName) {
  const ext = path.extname(originalName).toLowerCase();
  return `profile-photos/${userId}${ext}`;
}

function buildProfileAchievementKey(userId, achievementEntryId, originalName) {
  return `profile-achievements/${userId}/${achievementEntryId}-${originalName}`;
}

function buildHeroImageKey(originalName) {
  const ext = path.extname(originalName).toLowerCase();
  // Fixed singleton key — overwrite on re-upload, never accumulate
  return `department/hero-image${ext}`;
}

function buildFacultyPhotoKey(facultyLinkId, originalName) {
  const ext = path.extname(originalName).toLowerCase();
  return `faculty-photos/${facultyLinkId}${ext}`;
}

function buildAnnouncementAttachmentKey(announcementId, originalName) {
  return `announcements/${announcementId}/${originalName}`;
}

function buildChatAttachmentKey(spaceId, messageId, originalName) {
  return `chat-attachments/${spaceId}/${messageId}-${originalName}`;
}

function buildAlumniPhotoKey(alumniRepoId, originalName) {
  const ext = path.extname(originalName).toLowerCase();
  return `alumni-photos/${alumniRepoId}${ext}`;
}

function buildAchievementMediaKey(achievementId, originalName) {
  return `achievements-media/${achievementId}/${originalName}`;
}

function buildResumeGuideKey(resumeGuideEntryId, originalName) {
  return `resume-guide/${resumeGuideEntryId}/${originalName}`;
}

module.exports = {
  uploadFile,
  deleteFile,
  keyFromUrl,
  // Key builders
  buildProfilePhotoKey,
  buildProfileAchievementKey,
  buildHeroImageKey,
  buildFacultyPhotoKey,
  buildAnnouncementAttachmentKey,
  buildChatAttachmentKey,
  buildAlumniPhotoKey,
  buildAchievementMediaKey,
  buildResumeGuideKey,
};
