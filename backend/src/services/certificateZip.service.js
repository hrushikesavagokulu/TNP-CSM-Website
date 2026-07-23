'use strict';

const archiver = require('archiver');
const Event = require('../models/Event.model');
const { getDriveClient } = require('../config/googleDrive');
const driveService = require('./drive.service');

/**
 * Streams a zip file containing all event certificates directly to HTTP response res.
 * Organized by Year-N/ subfolders inside the zip.
 */
async function streamEventCertificatesZip({ eventId, res }) {
  const event = await Event.findById(eventId);
  if (!event) {
    throw new Error('Event not found');
  }

  const rawBatchLabel = event.batchLabel || `Event-${event.title.replace(/[^a-zA-Z0-9_-]/g, '_')}`;
  const cleanBatchLabel = rawBatchLabel.trim().replace(/[^a-zA-Z0-9_-]/g, '_');
  const zipFilename = `${cleanBatchLabel}.zip`;

  // Set ZIP response headers
  res.setHeader('Content-Type', 'application/zip');
  res.setHeader('Content-Disposition', `attachment; filename="${zipFilename}"`);

  return new Promise(async (resolve, reject) => {
    const archive = archiver('zip', { zlib: { level: 6 } });

    // Handle stream finish
    res.on('finish', () => {
      resolve();
    });

    archive.on('error', (err) => {
      reject(err);
    });

    res.on('error', (err) => {
      reject(err);
    });

    // Pipe archive to client response stream
    archive.pipe(res);

    try {
      const drive = getDriveClient();
      const files = await driveService.listAllFilesUnderFolder(event.driveRootFolderId);

      for (const item of files) {
        try {
          const driveRes = await drive.files.get(
            { fileId: item.driveFileId, alt: 'media' },
            { responseType: 'stream' }
          );

          const zipPath = `Year-${item.year}/${item.fileName}`;
          archive.append(driveRes.data, { name: zipPath });
        } catch (fileErr) {
          console.error(`Failed to stream Drive file ${item.driveFileId}:`, fileErr.message);
        }
      }

      await archive.finalize();
    } catch (err) {
      archive.destroy();
      reject(err);
    }
  });
}

module.exports = {
  streamEventCertificatesZip,
};
