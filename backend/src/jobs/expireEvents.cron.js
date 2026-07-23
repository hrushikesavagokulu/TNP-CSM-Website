'use strict';

const cron = require('node-cron');
const Event = require('../models/Event.model');

/**
 * Scheduled job to automatically mark events as closed when their expiresAt date passes.
 * Runs every hour. Non-destructive: only sets isClosed: true.
 */
function startExpireEventsCron() {
  console.log('[Cron] ⏰ Expire Events cron initialized.');

  // Run every hour at minute 0
  cron.schedule('0 * * * *', async () => {
    try {
      const now = new Date();
      const result = await Event.updateMany(
        {
          expiresAt: { $lte: now },
          isClosed: false,
        },
        {
          $set: { isClosed: true },
        }
      );

      if (result.modifiedCount > 0) {
        console.log(`[Cron] ⏰ Auto-closed ${result.modifiedCount} expired event(s).`);
      }
    } catch (err) {
      console.error('[Cron] ❌ Error in expireEvents cron job:', err.message);
    }
  });
}

module.exports = { startExpireEventsCron };
