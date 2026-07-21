'use strict';

const mongoose           = require('mongoose');
const contentBlockSchema = require('./shared/contentBlock.schema');

const resumeGuideSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Resume guide title is required.'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    contentBlocks: [contentBlockSchema],
    order: {
      type: Number,
      default: 0,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

resumeGuideSchema.index({ order: 1 });

module.exports = mongoose.model('ResumeGuide', resumeGuideSchema);
