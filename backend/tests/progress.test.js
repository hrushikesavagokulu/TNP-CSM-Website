'use strict';

// Standalone unit test for progress service
const mongoose = require('mongoose');
const User = require('../src/models/User.model');
const { recalculateCompletionPercent } = require('../src/services/progress.service');

async function runTest() {
  console.log('[Test] Starting progress service unit tests...');

  // Mock Mongo in memory/local fallback
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/tmp_db_test';
  
  try {
    await mongoose.connect(uri);
    console.log('[Test] Database connected.');

    // Clear test db user first
    await User.deleteMany({ email: 'test_progress@gprec.ac.in' });

    // Create dummy student
    const testStudent = await User.create({
      name: 'Progress Tester',
      rollNo: 'TESTPROGRESS1',
      email: 'test_progress@gprec.ac.in',
      passwordHash: 'dummy',
      progress: {
        roadmapChecklist: [
          { itemId: 'skill_1', done: true, doneAt: new Date() },
          { itemId: 'skill_2', done: false }
        ]
      }
    });

    console.log('[Test] Created test student profile.');

    // Since SkillRoadmap isn't registered, completion percent should gracefully calculate to 0%
    const percent = await recalculateCompletionPercent(testStudent._id);
    
    if (percent === 0) {
      console.log('✅ TEST PASSED: Returned 0% gracefully in absence of SkillRoadmap items.');
    } else {
      console.error(`❌ TEST FAILED: Expected 0%, got ${percent}%`);
      process.exit(1);
    }

    // Clean up
    await User.findByIdAndDelete(testStudent._id);

  } catch (err) {
    console.error('❌ Test failed with error:', err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('[Test] Database disconnected.');
  }
}

// Run the script directly if executed
if (require.main === module) {
  runTest();
}
