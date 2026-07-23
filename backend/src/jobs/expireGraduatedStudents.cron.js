'use strict';

const cron = require('node-cron');
const User = require('../models/User.model');

/**
 * Scheduled job to automatically archive graduated students after their 6-month (180-day) grace period expires.
 * Runs daily at 03:30 AM. Sets academicStatus: 'archived' and isActive: false.
 */
function startExpireGraduatedStudentsCron() {
  console.log('[Cron] ⏰ Expire Graduated Students cron initialized.');

  // Run daily at 03:30 AM
  cron.schedule('30 3 * * *', async () => {
    try {
      const now = new Date();
      const result = await User.updateMany(
        {
          role: 'student',
          academicStatus: 'graduated_grace',
          gracePeriodExpiresAt: { $lte: now },
        },
        {
          $set: {
            academicStatus: 'archived',
            isActive: false,
          },
        }
      );

      if (result.modifiedCount > 0) {
        console.log(`[Cron] ⏰ Archived ${result.modifiedCount} graduated student account(s) whose 6-month grace period expired.`);
      }
    } catch (err) {
      console.error('[Cron] ❌ Error in expireGraduatedStudents cron job:', err.message);
    }
  });
}

module.exports = { startExpireGraduatedStudentsCron };
