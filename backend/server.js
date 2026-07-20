'use strict';

const http = require('http');
const { validateEnv } = require('./src/config/env');

// ── 1. Validate environment first — fail fast ────────────────────────────────
validateEnv();

const app = require('./src/app');
const connectDB = require('./src/config/db');
const { connectRedis } = require('./src/config/redis');

const PORT = process.env.PORT || 5000;

// ── 2. Create HTTP server (Socket.io will attach here in a later phase) ───────
const server = http.createServer(app);

// ── 3. Connect to data stores, then start listening ──────────────────────────
(async () => {
  try {
    await connectDB();
    await connectRedis();

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
