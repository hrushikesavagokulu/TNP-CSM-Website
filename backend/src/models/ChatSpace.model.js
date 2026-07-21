'use strict';

const mongoose = require('mongoose');

const chatSpaceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Space name is required.'],
      trim: true,
    },
    isPermanent: {
      type: Boolean,
      default: false,
    },
    isLocked: {
      type: Boolean,
      default: false,
    },
    blockedUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  { timestamps: true }
);

chatSpaceSchema.index({ isPermanent: -1, createdAt: 1 });

module.exports = mongoose.model('ChatSpace', chatSpaceSchema);
