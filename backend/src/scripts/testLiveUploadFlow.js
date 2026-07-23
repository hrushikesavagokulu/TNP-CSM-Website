const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../../.env') });
const mongoose = require('mongoose');
const Event = require('../models/Event.model');
const driveService = require('../services/drive.service');

async function testFlow() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/tmp_db');
  console.log('Connected to MongoDB.');

  const folderId = '1m0hCNff3aEvXC38pCHEqWlA0RdLGARxb';

  // Find or create test event
  let event = await Event.findOne({ driveRootFolderId: folderId });
  if (!event) {
    event = await Event.create({
      title: 'Debug Drive Event',
      semester: 'IV Semester',
      description: 'Testing Drive year subfolder reuse',
      driveRootFolderId: folderId,
      driveRootFolderLink: `https://drive.google.com/drive/folders/${folderId}`,
      shareableSlug: `debug-event-${Date.now()}`,
      yearFolderIds: new Map(),
    });
    console.log('Created test event ID:', event._id);
  } else {
    console.log('Found existing test event ID:', event._id);
  }

  console.log('\n======================================================');
  console.log('>>> EXECUTE FIRST UPLOAD FOR YEAR 1 <<<');
  console.log('======================================================');

  try {
    const yearFolderId1 = await driveService.getOrCreateYearFolder({ event, year: 1 });
    console.log('Upload #1 Year Folder ID:', yearFolderId1);

    const upload1 = await driveService.uploadCertificateFile({
      yearFolderId: yearFolderId1,
      fileBuffer: Buffer.from('Test Cert Content 1', 'utf8'),
      mimeType: 'application/pdf',
      rollNo: '239X1A3281',
      certificateName: 'Test Cert 1',
      year: 1,
      originalExt: '.pdf',
    });
    console.log('Upload #1 Result:', upload1);
  } catch (err) {
    console.error('Upload #1 Error:', err.message);
  }

  console.log('\n======================================================');
  console.log('>>> RE-FETCH FRESH EVENT DOC FROM MONGO <<<');
  console.log('======================================================');
  const freshEvent = await Event.findById(event._id);
  console.log('Fresh Event yearFolderIds:', freshEvent.yearFolderIds);

  console.log('\n======================================================');
  console.log('>>> EXECUTE SECOND UPLOAD FOR SAME YEAR 1 <<<');
  console.log('======================================================');

  try {
    const yearFolderId2 = await driveService.getOrCreateYearFolder({ event: freshEvent, year: 1 });
    console.log('Upload #2 Year Folder ID:', yearFolderId2);

    const upload2 = await driveService.uploadCertificateFile({
      yearFolderId: yearFolderId2,
      fileBuffer: Buffer.from('Test Cert Content 2', 'utf8'),
      mimeType: 'application/pdf',
      rollNo: '239X1A3281',
      certificateName: 'Test Cert 2',
      year: 1,
      originalExt: '.pdf',
    });
    console.log('Upload #2 Result:', upload2);
  } catch (err) {
    console.error('Upload #2 Error:', err.message);
  }

  await mongoose.disconnect();
  console.log('\nTest flow complete.');
}

testFlow();
