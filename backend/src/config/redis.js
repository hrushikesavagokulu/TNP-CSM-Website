'use strict';

const Redis = require('ioredis');

let redisClient = null;

async function connectRedis() {
  if (redisClient) return redisClient;

  redisClient = new Redis(process.env.REDIS_URL, {
    maxRetriesPerRequest: null,     // needed for BullMQ in later phases
    enableReadyCheck: true,
    lazyConnect: false,
    connectTimeout: 10_000,
    reconnectOnError: (err) => {
      console.warn('[Redis] Reconnect on error:', err.message);
      return true; // always reconnect
    },
  });

  // Log state changes
  redisClient.on('connect',       () => console.log('[Redis] Connecting...'));
  redisClient.on('ready',         () => console.log('[Redis] ✅ Ready'));
  redisClient.on('error',         (err) => console.error('[Redis] ❌ Error:', err.message));
  redisClient.on('close',         () => console.log('[Redis] ⚠️  Connection closed'));
  redisClient.on('reconnecting',  () => console.log('[Redis] 🔄 Reconnecting...'));
  redisClient.on('end',           () => console.log('[Redis] Connection ended'));

  // Wait until actually ready before returning
  await new Promise((resolve, reject) => {
    redisClient.once('ready', resolve);
    redisClient.once('error', reject);
  });

  return redisClient;
}

/**
 * Returns the singleton Redis client.
 * Must call connectRedis() first (done in server.js startup).
 */
function getRedisClient() {
  if (!redisClient) {
    throw new Error('[Redis] Client not initialised — call connectRedis() first');
  }
  return redisClient;
}

module.exports = { connectRedis, getRedisClient };
