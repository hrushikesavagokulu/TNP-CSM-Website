'use strict';

const mongoose = require('mongoose');

const MAX_RETRIES    = 10;
const RETRY_INTERVAL = 5_000; // ms

let retryCount = 0;

async function connectDB() {
  const uri = process.env.MONGO_URI;

  // Log all Mongoose connection state changes
  mongoose.connection.on('connecting',    () => console.log('[MongoDB] Connecting...'));
  mongoose.connection.on('connected',     () => console.log('[MongoDB] ✅ Connected'));
  mongoose.connection.on('disconnected',  () => console.log('[MongoDB] ⚠️  Disconnected'));
  mongoose.connection.on('reconnected',   () => console.log('[MongoDB] 🔄 Reconnected'));
  mongoose.connection.on('error',         (err) => console.error('[MongoDB] ❌ Error:', err.message));

  await attemptConnection(uri);
}

async function attemptConnection(uri) {
  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5_000,
    });
    retryCount = 0; // reset on success
  } catch (err) {
    retryCount += 1;
    console.error(`[MongoDB] Connection attempt ${retryCount}/${MAX_RETRIES} failed: ${err.message}`);

    if (retryCount >= MAX_RETRIES) {
      console.error('[MongoDB] ❌ Max retries reached. Exiting.');
      process.exit(1);
    }

    console.log(`[MongoDB] Retrying in ${RETRY_INTERVAL / 1000}s...`);
    await sleep(RETRY_INTERVAL);
    await attemptConnection(uri);
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

module.exports = connectDB;
