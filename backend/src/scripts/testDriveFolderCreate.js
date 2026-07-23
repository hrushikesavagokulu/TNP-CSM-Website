const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../../.env') });
const { getDriveClient } = require('../config/googleDrive');

async function testFolderCreate() {
  const drive = getDriveClient();
  const folderId = '1m0hCNff3aEvXC38pCHEqWlA0RdLGARxb';

  console.log('Testing subfolder creation in target folder...');
  try {
    const res = await drive.files.create({
      requestBody: {
        name: 'Year-1',
        mimeType: 'application/vnd.google-apps.folder',
        parents: [folderId],
      },
      fields: 'id, name',
      supportsAllDrives: true,
    });
    console.log('✅ SUBFOLDER CREATED SUCCESSFULLY!', res.data);
  } catch (err) {
    console.error('Subfolder Creation Error:', err.message);
  }
}

testFolderCreate();
