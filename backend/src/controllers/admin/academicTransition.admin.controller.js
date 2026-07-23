'use strict';

const User = require('../../models/User.model');
const Batch = require('../../models/Batch.model');
const asyncHandler = require('../../utils/asyncHandler');
const { sendResponse } = require('../../utils/apiResponse');

const GRACE_PERIOD_DAYS = 180; // 6 months retention window for graduated 4th year students

/**
 * Helper to compute simulation stats for academic rollover.
 */
async function computeRolloverMetrics() {
  const students = await User.find({
    role: 'student',
    academicStatus: { $ne: 'archived' },
  }).populate('batches');

  let year1Count = 0;
  let year2Count = 0;
  let year3Count = 0;
  let year4Count = 0;
  let graduatedGraceCount = 0;

  for (const s of students) {
    if (s.academicStatus === 'graduated_grace') {
      graduatedGraceCount++;
    } else if (s.year === 1) {
      year1Count++;
    } else if (s.year === 2) {
      year2Count++;
    } else if (s.year === 3) {
      year3Count++;
    } else if (s.year === 4) {
      year4Count++;
    }
  }

  // Find Year 3 batches to estimate batch migration
  const year3Batches = await Batch.find({ year: 3 });
  const batchMigrationSummary = [];

  for (const b3 of year3Batches) {
    const studentCountInBatch = await User.countDocuments({
      role: 'student',
      year: 3,
      batches: b3._id,
    });

    const year4Equivalent = await Batch.findOne({ name: b3.name, year: 4 });

    batchMigrationSummary.push({
      year3BatchId: b3._id,
      batchName: b3.name,
      studentCount: studentCountInBatch,
      targetYear4BatchExists: Boolean(year4Equivalent),
      targetYear4BatchId: year4Equivalent ? year4Equivalent._id : null,
    });
  }

  return {
    year1To2Count: year1Count,
    year2To3Count: year2Count,
    year3To4Count: year3Count,
    year4ToGraduatedCount: year4Count,
    currentlyInGracePeriodCount: graduatedGraceCount,
    batchMigrationSummary,
  };
}

/**
 * GET /api/v1/admin/academic-transition/preview
 * Dry-run simulation of academic year rollover without mutating database.
 */
const previewAcademicRollover = asyncHandler(async (req, res) => {
  const metrics = await computeRolloverMetrics();

  return sendResponse(res, 200, {
    success: true,
    data: metrics,
    message: 'Academic year rollover simulation completed successfully.',
  });
});

/**
 * POST /api/v1/admin/academic-transition/execute-rollover
 * Executes department-wide annual academic rollover.
 * - Year 1 -> 2
 * - Year 2 -> 3
 * - Year 3 -> 4 (and migrates Year 3 batch memberships to Year 4 equivalents)
 * - Year 4 -> Graduated (sets graduatedAt and 6-month gracePeriodExpiresAt)
 */
const executeAcademicRollover = asyncHandler(async (req, res) => {
  const now = new Date();
  const gracePeriodExpiry = new Date(now.getTime() + GRACE_PERIOD_DAYS * 24 * 60 * 60 * 1000);

  // 1. Process Year 4 Students -> Graduated Grace Period
  const year4Students = await User.find({
    role: 'student',
    year: 4,
    academicStatus: 'active',
  });

  let graduatedCount = 0;
  for (const student of year4Students) {
    student.isGraduated = true;
    student.academicStatus = 'graduated_grace';
    student.graduatedAt = now;
    student.gracePeriodExpiresAt = gracePeriodExpiry;
    student.batches = []; // Clear batches for graduated students
    await student.save();
    graduatedCount++;
  }

  // 2. Process Year 3 Students -> Year 4 (with Batch Migration)
  const year3Batches = await Batch.find({ year: 3 });
  const batchMap = new Map(); // Year 3 batch ID -> Year 4 batch ID

  for (const b3 of year3Batches) {
    let b4 = await Batch.findOne({ name: b3.name, year: 4 });
    if (!b4) {
      b4 = await Batch.create({
        name: b3.name,
        year: 4,
        createdBy: req.user._id,
      });
    }
    batchMap.set(String(b3._id), b4._id);
  }

  const year3Students = await User.find({
    role: 'student',
    year: 3,
    academicStatus: 'active',
  });

  let year3To4Count = 0;
  for (const student of year3Students) {
    student.year = 4;
    
    // Migrate student's Year 3 batches to Year 4 equivalents
    const newBatches = [];
    if (Array.isArray(student.batches)) {
      for (const bId of student.batches) {
        const bIdStr = String(bId);
        if (batchMap.has(bIdStr)) {
          newBatches.push(batchMap.get(bIdStr));
        }
      }
    }
    student.batches = newBatches;
    await student.save();
    year3To4Count++;
  }

  // 3. Process Year 2 Students -> Year 3
  const year2Result = await User.updateMany(
    { role: 'student', year: 2, academicStatus: 'active' },
    { $set: { year: 3 } }
  );

  // 4. Process Year 1 Students -> Year 2
  const year1Result = await User.updateMany(
    { role: 'student', year: 1, academicStatus: 'active' },
    { $set: { year: 2, batches: [] } }
  );

  return sendResponse(res, 200, {
    success: true,
    data: {
      year1To2Count: year1Result.modifiedCount || 0,
      year2To3Count: year2Result.modifiedCount || 0,
      year3To4Count,
      graduatedCount,
      gracePeriodExpiryDate: gracePeriodExpiry,
    },
    message: 'Academic year rollover executed successfully across department.',
  });
});

/**
 * PUT /api/v1/admin/academic-transition/students/:studentId/adjust-year
 * Manually increment (+1), decrement (-1), or set academic year for an individual student.
 */
const adjustStudentYear = asyncHandler(async (req, res) => {
  const { studentId } = req.params;
  const { action, targetYear } = req.body; // action: 'increment' | 'decrement' | 'set'

  const student = await User.findById(studentId);
  if (!student || student.role !== 'student') {
    return sendResponse(res, 404, {
      success: false,
      message: 'Student not found.',
    });
  }

  let newYear = student.year || 1;

  if (action === 'increment') {
    if (student.academicStatus === 'graduated_grace') {
      return sendResponse(res, 400, {
        success: false,
        message: 'Student is already graduated.',
      });
    }
    if (student.year === 4) {
      // Transition Year 4 student to graduated grace period
      const now = new Date();
      student.isGraduated = true;
      student.academicStatus = 'graduated_grace';
      student.graduatedAt = now;
      student.gracePeriodExpiresAt = new Date(now.getTime() + GRACE_PERIOD_DAYS * 24 * 60 * 60 * 1000);
      student.batches = [];
      await student.save();

      return sendResponse(res, 200, {
        success: true,
        data: student,
        message: `Student ${student.name} promoted from 4th Year to Graduated (6-Month Grace Period).`,
      });
    } else {
      newYear = student.year + 1;
    }
  } else if (action === 'decrement') {
    if (student.academicStatus === 'graduated_grace') {
      // Restore graduated student back to Active 4th Year
      student.isGraduated = false;
      student.academicStatus = 'active';
      student.graduatedAt = null;
      student.gracePeriodExpiresAt = null;
      student.year = 4;
      await student.save();

      return sendResponse(res, 200, {
        success: true,
        data: student,
        message: `Student ${student.name} restored from Graduation Grace Period back to Active 4th Year.`,
      });
    } else if (student.year > 1) {
      newYear = student.year - 1;
    } else {
      return sendResponse(res, 400, {
        success: false,
        message: 'Student is already in 1st Year. Cannot decrement further.',
      });
    }
  } else if (action === 'set' && targetYear >= 1 && targetYear <= 4) {
    newYear = Number(targetYear);
    if (student.academicStatus === 'graduated_grace') {
      student.isGraduated = false;
      student.academicStatus = 'active';
      student.graduatedAt = null;
      student.gracePeriodExpiresAt = null;
    }
  } else {
    return sendResponse(res, 400, {
      success: false,
      message: 'Invalid action or target year specified.',
    });
  }

  student.year = newYear;

  // Clear batches if student moved to Year 1 or 2
  if (newYear < 3) {
    student.batches = [];
  }

  await student.save();

  return sendResponse(res, 200, {
    success: true,
    data: student,
    message: `Academic year for ${student.name} updated to Year ${newYear}.`,
  });
});

/**
 * POST /api/v1/admin/academic-transition/bulk-adjust
 * Bulk increment or decrement for a specific academic year cohort.
 */
const bulkAdjustYear = asyncHandler(async (req, res) => {
  const { fromYear, action } = req.body; // fromYear: 1|2|3|4, action: 'increment' | 'decrement'

  const yearNum = Number(fromYear);
  if (![1, 2, 3, 4].includes(yearNum) || !['increment', 'decrement'].includes(action)) {
    return sendResponse(res, 400, {
      success: false,
      message: 'Invalid fromYear or action.',
    });
  }

  const students = await User.find({ role: 'student', year: yearNum, academicStatus: 'active' });
  let updatedCount = 0;

  for (const s of students) {
    if (action === 'increment') {
      if (s.year === 4) {
        const now = new Date();
        s.isGraduated = true;
        s.academicStatus = 'graduated_grace';
        s.graduatedAt = now;
        s.gracePeriodExpiresAt = new Date(now.getTime() + GRACE_PERIOD_DAYS * 24 * 60 * 60 * 1000);
        s.batches = [];
      } else {
        s.year = s.year + 1;
      }
    } else if (action === 'decrement') {
      if (s.year > 1) {
        s.year = s.year - 1;
        if (s.year < 3) {
          s.batches = [];
        }
      }
    }
    await s.save();
    updatedCount++;
  }

  return sendResponse(res, 200, {
    success: true,
    data: { updatedCount },
    message: `Bulk ${action} executed for ${updatedCount} students in Year ${fromYear}.`,
  });
});

module.exports = {
  previewAcademicRollover,
  executeAcademicRollover,
  adjustStudentYear,
  bulkAdjustYear,
};
