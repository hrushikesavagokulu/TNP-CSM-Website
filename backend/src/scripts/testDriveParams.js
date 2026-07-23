const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../../.env') });
const { getDriveClient } = require('../config/googleDrive');

async function testDriveParams() {
  const drive = getDriveClient();
  const folderId = '1m0hCNff3aEvXC38pCHEqWlA0RdLGARxb';

  console.log('Testing drive.files.get on target folder...');
  try {
    const getFolder = await drive.files.get({
      fileId: folderId,
      fields: 'id, name, mimeType, driveId, capabilities, shared',
      supportsAllDrives: true,
    });
    console.log('Folder Metadata:', JSON.stringify(getFolder.data, null, 2));
  } catch (err) {
    console.error('Folder Get Error:', err.message);
  }
}

testDriveParams();
