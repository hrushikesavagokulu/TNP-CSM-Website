'use strict';

/**
 * env.js — reads and validates required environment variables.
 * Called once at startup (server.js) BEFORE any other module.
 * Throws + exits process if a required var is missing.
 */

require('dotenv').config();

// ── Required vars per phase ───────────────────────────────────────────────────
const REQUIRED_VARS = [
  'PORT',
  'MONGO_URI',
  'REDIS_URL',
  'FRONTEND_ORIGIN',
  // Phase 1+ — auth
  'JWT_SECRET',
  'JWT_REFRESH_SECRET',
  // Phase 5+ — MinIO object storage
  'MINIO_ENDPOINT',
  'MINIO_ACCESS_KEY',
  'MINIO_SECRET_KEY',
  'MINIO_BUCKET',
  'MINIO_PUBLIC_URL',
];

function validateEnv() {
  const missing = REQUIRED_VARS.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.error(
      `[ENV] ❌ Missing required environment variables: ${missing.join(', ')}\n` +
      `      Copy .env.example to .env and fill in all required values.`
    );
    process.exit(1);
  }

  console.log('[ENV] ✅ All required environment variables are present');
}

module.exports = { validateEnv };
