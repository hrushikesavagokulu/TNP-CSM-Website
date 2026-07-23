const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../../.env') });
const { Readable } = require('stream');
const { getDriveClient } = require('../config/googleDrive');

async function testUpload() {
  console.log('Testing Drive File Upload to folder 1m0hCNff3aEvXC38pCHEqWlA0RdLGARxb...');
  const drive = getDriveClient();
  const folderId = '1m0hCNff3aEvXC38pCHEqWlA0RdLGARxb';

  const sampleBuffer = Buffer.from('Test certificate file content', 'utf8');

  try {
    console.log('Attempting drive.files.create with supportsAllDrives: true...');
    const res = await drive.files.create({
      requestBody: {
        name: 'test-certificate.txt',
        parents: [folderId],
      },
      media: {
        mimeType: 'text/plain',
        body: Readable.from(sampleBuffer),
      },
      fields: 'id, webViewLink',
      supportsAllDrives: true,
    });

    console.log('✅ UPLOAD SUCCESSFUL!');
    console.log('File ID:', res.data.id);
    console.log('File Link:', res.data.webViewLink);
  } catch (err) {
    console.error('❌ UPLOAD FAILED with error:', err.message);
    if (err.response) {
      console.error('Status:', err.response.status);
      console.error('Data:', JSON.stringify(err.response.data, null, 2));
    }
  }
}

testUpload();
