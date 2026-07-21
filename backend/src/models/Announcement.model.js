'use strict';

/**
 * Announcement.model.js
 *
 * Targeting shape (new, replacing old targetGroups array):
 *   - isGeneral: true  → visible to EVERY student, no year/batch restriction.
 *   - targetYears: [1,2,3,4]  → visible to every student in any of these years.
 *   - targetBatches: [ObjectId, ...]  → visible only to members of these specific batches.
 *
 * An announcement MUST have at least one of:
 *   isGeneral === true  OR  targetYears.length > 0  OR  targetBatches.length > 0
 * This is validated at the controller level (not schema level) with a clear 400 error.
 *
 * readBy stores per-user read timestamps for "mark as read" and unread count logic.
 */

const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema(
  {
    // ── Content ──────────────────────────────────────────────────────────────
    title: {
      type: String,
      required: [true, 'Announcement title is required.'],
      trim: true,
      maxlength: [200, 'Title must be 200 characters or fewer.'],
    },
    body: {
      type: String,
      required: [true, 'Announcement body is required.'],
      trim: true,
    },
    attachments: [
      {
        url:      { type: String, required: true },
        filename: { type: String },
        mimeType: { type: String },
      },
    ],

    // ── Targeting ─────────────────────────────────────────────────────────────
    // isGeneral: visible to every student regardless of year or batch.
    isGeneral: {
      type: Boolean,
      default: false,
    },
    // targetYears: visible to every student in these year groups.
    targetYears: {
      type: [Number],
      default: [],
    },
    // targetBatches: visible only to members of these specific batch objects.
    targetBatches: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Batch',
      },
    ],

    // ── Authorship ────────────────────────────────────────────────────────────
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    postedAt: {
      type: Date,
      default: Date.now,
    },

    // ── Read tracking ─────────────────────────────────────────────────────────
    // Stores which users have read this announcement and when.
    readBy: [
      {
        user:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        readAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Index to speed up eligibility queries
announcementSchema.index({ isGeneral: 1, postedAt: -1 });
announcementSchema.index({ targetYears: 1, postedAt: -1 });
announcementSchema.index({ targetBatches: 1, postedAt: -1 });
announcementSchema.index({ 'readBy.user': 1 });

const Announcement = mongoose.model('Announcement', announcementSchema);

module.exports = Announcement;
