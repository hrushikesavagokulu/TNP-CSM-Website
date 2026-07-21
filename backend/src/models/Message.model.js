'use strict';

const mongoose = require('mongoose');

const attachmentSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    type: {
      type: String,
      enum: ['image', 'doc', 'video'],
      default: 'doc',
    },
  },
  { _id: true }
);

const reactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['like'],
      default: 'like',
    },
  },
  { _id: true }
);

const messageSchema = new mongoose.Schema(
  {
    space: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ChatSpace',
      required: true,
      index: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      default: '',
      trim: true,
    },
    attachments: [attachmentSchema],
    reactions: [reactionSchema],
    deletedForAll: {
      type: Boolean,
      default: false,
    },
    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  { timestamps: true }
);

// Compound index for paginated message history queries (space + time order)
messageSchema.index({ space: 1, createdAt: 1 });

// ── TTL Index — auto-delete messages older than 30 days ───────────────────────
// MongoDB's background TTL thread runs roughly every 60 seconds and removes
// any Message document where createdAt is older than 2,592,000 seconds (30 days).
// No application-level cron job needed — MongoDB handles this natively.
// On fresh deploy this index is created automatically when the app starts.
messageSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2_592_000 });

module.exports = mongoose.model('Message', messageSchema);
