'use strict';

/**
 * expireAnnouncements.cron.js
 * Daily cron job to hard-delete expired announcements.
 */

const cron = require('node-cron');
const Announcement = require('../models/Announcement.model');
const expireDocuments = require('../utils/expireDocuments');

async function runAnnouncementExpiryJob() {
  const deletedCount = await expireDocuments(Announcement);
  if (deletedCount > 0) {
    console.log(`[Cron:ExpireAnnouncements] 🗑 Hard-deleted ${deletedCount} expired announcement(s).`);
  }
  return deletedCount;
}

function startExpireAnnouncementsCron() {
  // Run daily at 03:00 AM ('0 3 * * *')
  cron.schedule('0 3 * * *', async () => {
    try {
      await runAnnouncementExpiryJob();
    } catch (err) {
      console.error('[Cron:ExpireAnnouncements] ❌ Error expiring announcements:', err);
    }
  });
  console.log('[Cron] ⏰ Expire Announcements cron scheduled (daily at 03:00 AM)');
}

module.exports = { startExpireAnnouncementsCron, runAnnouncementExpiryJob };
