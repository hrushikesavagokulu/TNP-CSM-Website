'use strict';

/**
 * announcementEligibility.service.js
 *
 * DESIGN INTERPRETATION:
 * Every student belongs to exactly three tiers of announcement groups:
 *   1. "General" — always included, covers department-wide announcements (isGeneral: true).
 *   2. "Year N"  — covers year-level announcements (targetYears contains user.year).
 *   3. Per batch — one entry for EACH batch the student is a member of (year 3/4 only).
 *      Year 1/2 students structurally have an empty batches array, so no batch entries ever appear.
 *
 * Groups are NEVER cached — always computed live from current User state.
 * This ensures immediate consistency when a student is added/removed from a batch.
 *
 * Each group descriptor shape:
 *   { groupId: string, label: string, type: 'general'|'year'|'batch', unreadCount: number,
 *     [year]: number,      // for type='year'
 *     [batchId]: ObjectId  // for type='batch'
 *   }
 */

const Announcement = require('../models/Announcement.model');

/**
 * Returns the full list of announcement group descriptors for the given user,
 * each annotated with a live unread count.
 *
 * @param {Object} user - Mongoose User doc (must have: _id, year, batches populated)
 * @returns {Promise<Array>} Array of group descriptor objects
 */
async function getEligibleGroups(user) {
  const userId  = user._id;
  const userYear = user.year;

  // Populate batches if they are just ObjectIds (not yet populated)
  let batches = user.batches || [];
  if (batches.length > 0 && typeof batches[0] !== 'object') {
    // Need to populate — caller should pass a populated doc, but handle gracefully
    const User  = require('../models/User.model');
    const fresh = await User.findById(userId).populate('batches').lean();
    batches = fresh ? fresh.batches || [] : [];
  }

  const groups = [];

  // ── 1. General group ────────────────────────────────────────────────────────
  const generalUnread = await Announcement.countDocuments({
    isGeneral: true,
    'readBy.user': { $ne: userId },
  });
  groups.push({
    groupId:     'general',
    label:       'General',
    type:        'general',
    unreadCount: generalUnread,
  });

  // ── 2. Year group ────────────────────────────────────────────────────────────
  const yearUnread = await Announcement.countDocuments({
    targetYears:  userYear,
    'readBy.user': { $ne: userId },
  });
  groups.push({
    groupId:     `year-${userYear}`,
    label:       `Year ${userYear}`,
    type:        'year',
    year:        userYear,
    unreadCount: yearUnread,
  });

  // ── 3. Batch groups (year 3/4 only, skipped automatically if batches is empty) ──
  if ([3, 4].includes(userYear) && batches.length > 0) {
    for (const batch of batches) {
      const batchId    = batch._id;
      const batchUnread = await Announcement.countDocuments({
        targetBatches:  batchId,
        'readBy.user': { $ne: userId },
      });
      groups.push({
        groupId:     `batch-${batchId}`,
        label:       batch.name,
        type:        'batch',
        batchId:     batchId,
        unreadCount: batchUnread,
      });
    }
  }

  return groups;
}

/**
 * Checks whether a specific groupId is among the student's eligible groups.
 * Used by the announcement fetch endpoint to re-validate the requested group
 * without trusting the client.
 *
 * @param {Object} user     - Mongoose User doc (populated)
 * @param {string} groupId  - e.g. 'general', 'year-3', 'batch-<id>'
 * @returns {Promise<boolean>}
 */
async function isGroupEligible(user, groupId) {
  const groups = await getEligibleGroups(user);
  return groups.some((g) => g.groupId === groupId);
}

module.exports = { getEligibleGroups, isGroupEligible };
