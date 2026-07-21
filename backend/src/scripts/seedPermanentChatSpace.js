'use strict';

const ChatSpace = require('../models/ChatSpace.model');

/**
 * seedPermanentChatSpace — Idempotent seed function.
 * Called automatically in server.js on app startup right after Mongo connects.
 * Ensures the permanent main community space "CSM Community" always exists.
 */
async function seedPermanentChatSpace() {
  try {
    const existing = await ChatSpace.findOne({ isPermanent: true });
    if (!existing) {
      const permanentSpace = await ChatSpace.create({
        name: 'CSM Community',
        isPermanent: true,
        isLocked: false,
        createdBy: null,
      });
      console.log(`[SeedChatSpace] Created permanent chat space: "${permanentSpace.name}" (${permanentSpace._id})`);
    } else {
      console.log(`[SeedChatSpace] Permanent space verified: "${existing.name}" (${existing._id})`);
    }
  } catch (err) {
    console.error('[SeedChatSpace] Error seeding permanent chat space:', err.message);
  }
}

module.exports = seedPermanentChatSpace;
