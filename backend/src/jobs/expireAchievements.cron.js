'use strict';

/**
 * expireAchievements.cron.js
 * Daily cron job to hard-delete expired department achievements.
 */

const cron = require('node-cron');
const Achievement = require('../models/Achievement.model');
const expireDocuments = require('../utils/expireDocuments');

async function runAchievementExpiryJob() {
  const deletedCount = await expireDocuments(Achievement);
  if (deletedCount > 0) {
    console.log(`[Cron:ExpireAchievements] 🗑 Hard-deleted ${deletedCount} expired achievement(s).`);
  }
  return deletedCount;
}

function startExpireAchievementsCron() {
  // Run daily at 03:00 AM ('0 3 * * *')
  cron.schedule('0 3 * * *', async () => {
    try {
      await runAchievementExpiryJob();
    } catch (err) {
      console.error('[Cron:ExpireAchievements] ❌ Error expiring achievements:', err);
    }
  });
  console.log('[Cron] ⏰ Expire Achievements cron scheduled (daily at 03:00 AM)');
}

module.exports = { startExpireAchievementsCron, runAchievementExpiryJob };
