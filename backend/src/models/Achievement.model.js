'use strict';

const mongoose           = require('mongoose');
const contentBlockSchema = require('./shared/contentBlock.schema');

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
    media: [contentBlockSchema],
    date: {
      type: Date,
      required: true,
      default: Date.now,
      index: -1,
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
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

// Search text index on title and description
achievementSchema.index({ title: 'text', description: 'text' });
achievementSchema.index({ date: -1 });

module.exports = mongoose.model('Achievement', achievementSchema);
