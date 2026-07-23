const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../../.env') });
const mongoose = require('mongoose');
const User = require('../models/User.model');
const Batch = require('../models/Batch.model');

async function testAcademicTransition() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/tmp_db');
  console.log('Connected.');

  console.log('\n--- 1. Testing Simulation Metrics ---');
  const transitionCtrl = require('../controllers/admin/academicTransition.admin.controller');

  // Create test dummy students across years 1, 2, 3, 4
  const timestamp = Date.now();
  const s1 = await User.create({ name: 'Test S1', email: `s1_${timestamp}@gprec.ac.in`, rollNo: `991_${timestamp}`, year: 1, role: 'student', passwordHash: 'hash' });
  const s2 = await User.create({ name: 'Test S2', email: `s2_${timestamp}@gprec.ac.in`, rollNo: `992_${timestamp}`, year: 2, role: 'student', passwordHash: 'hash' });
  const b3 = await Batch.create({ name: `Placement Track ${timestamp}`, year: 3 });
  const s3 = await User.create({ name: 'Test S3', email: `s3_${timestamp}@gprec.ac.in`, rollNo: `993_${timestamp}`, year: 3, batches: [b3._id], role: 'student', passwordHash: 'hash' });
  const s4 = await User.create({ name: 'Test S4', email: `s4_${timestamp}@gprec.ac.in`, rollNo: `994_${timestamp}`, year: 4, role: 'student', passwordHash: 'hash' });

  console.log('Dummy students created.');

  // Run dry run simulation
  console.log('Simulating preview...');
  const reqDummy = { user: { _id: s4._id } };
  let previewResult = null;
  const resDummyPreview = {
    status(code) { return this; },
    json(data) { previewResult = data; return this; }
  };

  await new Promise((resolve, reject) => {
    transitionCtrl.previewAcademicRollover(reqDummy, resDummyPreview, (err) => err ? reject(err) : resolve());
    setTimeout(resolve, 1000);
  });
  console.log('✅ Simulation Preview Output:', previewResult?.data);

  // Execute Rollover
  console.log('\n--- 2. Executing Academic Year Rollover ---');
  let executeResult = null;
  const resDummyExecute = {
    status(code) { return this; },
    json(data) { executeResult = data; return this; }
  };

  await new Promise((resolve, reject) => {
    transitionCtrl.executeAcademicRollover(reqDummy, resDummyExecute, (err) => err ? reject(err) : resolve());
    setTimeout(resolve, 1000);
  });
  console.log('✅ Execution Output:', executeResult);

  // Verify updated student states
  const s1Updated = await User.findById(s1._id);
  const s2Updated = await User.findById(s2._id);
  const s3Updated = await User.findById(s3._id);
  const s4Updated = await User.findById(s4._id);

  console.log('\n--- 3. Verifying Updated Student States ---');
  console.log('Student 1 (was Year 1):', s1Updated.year === 2 ? '✅ Promoted to Year 2' : `❌ Failed (year is ${s1Updated.year})`);
  console.log('Student 2 (was Year 2):', s2Updated.year === 3 ? '✅ Promoted to Year 3' : `❌ Failed (year is ${s2Updated.year})`);
  console.log('Student 3 (was Year 3):', s3Updated.year === 4 ? '✅ Promoted to Year 4' : `❌ Failed (year is ${s3Updated.year})`);

  // Verify batch migration for Student 3
  const year4EquivalentBatch = await Batch.findOne({ name: b3.name, year: 4 });
  console.log('Year 4 Equivalent Batch Created:', year4EquivalentBatch ? '✅ Yes' : '❌ No');
  if (year4EquivalentBatch) {
    console.log('Student 3 Batch Migrated to Year 4 Batch:', String(s3Updated.batches[0]) === String(year4EquivalentBatch._id) ? '✅ Yes' : '❌ No');
  }

  console.log('Student 4 (was Year 4):', s4Updated.academicStatus === 'graduated_grace' && s4Updated.isGraduated ? '✅ Transitioned to 6-Month Graduation Grace Period' : '❌ Failed');
  console.log('Student 4 Expiry Date:', s4Updated.gracePeriodExpiresAt);

  // Cleanup test dummy data
  await User.deleteMany({ _id: { $in: [s1._id, s2._id, s3._id, s4._id] } });
  if (year4EquivalentBatch) {
    await Batch.deleteMany({ _id: { $in: [b3._id, year4EquivalentBatch._id] } });
  } else {
    await Batch.deleteMany({ _id: b3._id });
  }
  console.log('Cleaned up dummy test data.');

  await mongoose.disconnect();
  console.log('\nAcademic Transition Engine Test Complete.');
}

testAcademicTransition();
