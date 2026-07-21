'use strict';

/**
 * expireDocuments.js
 *
 * Generic helper function to hard-delete expired documents for models supporting
 * the `neverExpires` and `expiresAt` fields.
 *
 * Criteria: neverExpires === false AND expiresAt < now (and expiresAt != null)
 */

async function expireDocuments(Model) {
  if (!Model) return 0;
  const now = new Date();
  const filter = {
    neverExpires: false,
    expiresAt: { $ne: null, $lt: now },
  };

  const result = await Model.deleteMany(filter);
  return result.deletedCount || 0;
}

module.exports = expireDocuments;
