'use strict';

const driveService = require('../services/drive.service');

/**
 * Deletes all certificate files and year subfolders created for an event.
 * NOTE: Calling Drive delete API moves files/subfolders to the ADMIN'S (owner's) Google Drive Trash.
 * Does NOT delete the root folder itself so admin can reuse it if desired.
 */
async function deleteAllEventFiles(event) {
  if (!event || !event.driveRootFolderId) return;

  try {
    // 1. List and delete all certificate files
    const files = await driveService.listAllFilesUnderFolder(event.driveRootFolderId);
    for (const file of files) {
      await driveService.deleteFile(file.driveFileId);
    }

    // 2. Delete cached year subfolders
    if (event.yearFolderIds) {
      const yearFolderMap = event.yearFolderIds;
      const folderIds = typeof yearFolderMap.values === 'function'
        ? Array.from(yearFolderMap.values())
        : Object.values(yearFolderMap);

      for (const folderId of folderIds) {
        if (folderId) {
          await driveService.deleteFile(folderId);
        }
      }
    }
  } catch (err) {
    console.error(`Error deleting event storage for event ${event._id}:`, err.message);
  }
}

module.exports = {
  deleteAllEventFiles,
};
