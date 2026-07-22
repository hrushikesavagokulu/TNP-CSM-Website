'use strict';

const mongoose           = require('mongoose');
const contentBlockSchema = require('./shared/contentBlock.schema');

const resumeImprovementResourceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Resource title is required.'],
      trim: true,
    },
    contentBlocks: [contentBlockSchema],
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

resumeImprovementResourceSchema.index({ order: 1 });

module.exports = mongoose.model('ResumeImprovementResource', resumeImprovementResourceSchema);
