'use strict';

const http = require('http');
const { validateEnv } = require('./src/config/env');

// ── 1. Validate environment first — fail fast ────────────────────────────────
validateEnv();

const app = require('./src/app');
const connectDB = require('./src/config/db');
const { connectRedis } = require('./src/config/redis');

const seedPermanentChatSpace = require('./src/scripts/seedPermanentChatSpace');
const { initSockets } = require('./src/sockets');

const { startExpireAnnouncementsCron } = require('./src/jobs/expireAnnouncements.cron');
const { startExpireAchievementsCron } = require('./src/jobs/expireAchievements.cron');
const { startExpireEventsCron } = require('./src/jobs/expireEvents.cron');
const { startExpireGraduatedStudentsCron } = require('./src/jobs/expireGraduatedStudents.cron');

const PORT = process.env.PORT || 5000;

// ── 2. Create HTTP server & attach Socket.io ─────────────────────────────────
const server = http.createServer(app);
const io = initSockets(server);
app.set('io', io);

// ── 3. Connect to data stores, seed permanent space, then start listening ───────
(async () => {
  try {
    await connectDB();
    await connectRedis();

    // Idempotent boot-time seed for permanent chat space
    await seedPermanentChatSpace();

    // Idempotent boot-time seed for Programming & DSA topics and reference links
    const { seedDsaData } = require('./src/utils/seedDsa.util');
    await seedDsaData();

    // Start background cron jobs
    startExpireAnnouncementsCron();
    startExpireAchievementsCron();
    startExpireEventsCron();
    startExpireGraduatedStudentsCron();

    server.listen(PORT, () => {
      console.log(`[Server] TMP backend listening on port ${PORT}`);
      console.log(`[Server] Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (err) {
    console.error('[Server] Fatal startup error:', err.message);
    process.exit(1);
  }
})();

// ── 4. Graceful shutdown ──────────────────────────────────────────────────────
const shutdown = (signal) => {
  console.log(`\n[Server] ${signal} received — shutting down gracefully`);
  server.close(() => {
    console.log('[Server] HTTP server closed');
    process.exit(0);
  });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT',  () => shutdown('SIGINT'));
