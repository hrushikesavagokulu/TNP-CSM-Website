const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../../.env') });
const { getDriveClient, getServiceAccountEmail } = require('../config/googleDrive');

async function testAccess() {
  console.log('Testing Drive Access...');
  console.log('Service Account Email:', getServiceAccountEmail());
  
  const folderId = '1m0hCNff3aEvXC38pCHEqWlA0RdLGARxb';
  const drive = getDriveClient();

  try {
    console.log(`Calling drive.files.get for folderId: ${folderId}...`);
    const res = await drive.files.get({
      fileId: folderId,
      fields: 'id, name, mimeType, capabilities',
      supportsAllDrives: true,
    });
    console.log('✅ SUCCESS! Folder details:', res.data);
  } catch (err) {
    console.error('❌ FAILED with error:', err.message);
    if (err.response) {
      console.error('Response status:', err.response.status);
      console.error('Response data:', JSON.stringify(err.response.data, null, 2));
    }
  }
}

testAccess();
