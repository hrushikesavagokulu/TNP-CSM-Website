'use strict';

/**
 * Achievement.model.js — Department Achievements & Spotlights Model
 */

const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Achievement title is required.'],
      trim: true,
      maxlength: [200, 'Title must be 200 characters or fewer.'],
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    mediaUrl: {
      type: String,
      default: '',
    },
    category: {
      type: String,
      default: 'General',
      trim: true,
    },
    order: {
      type: Number,
      default: 0,
    },

    // ── Expiry ────────────────────────────────────────────────────────────────
    // Department Achievements default to neverExpires: true (permanent record)
    expiresAt: {
      type: Date,
      default: null,
      index: true,
    },
    neverExpires: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

achievementSchema.index({ neverExpires: 1, expiresAt: 1 });
achievementSchema.index({ date: -1, order: 1 });

module.exports = mongoose.model('Achievement', achievementSchema);
