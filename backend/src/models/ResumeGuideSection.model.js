'use strict';

const mongoose           = require('mongoose');
const contentBlockSchema = require('./shared/contentBlock.schema');

const resumeGuideSectionSchema = new mongoose.Schema(
  {
    sectionTitle: {
      type: String,
      required: [true, 'Section title is required.'],
      trim: true,
    },
    sectionOrder: {
      type: Number,
      required: true,
      default: 0,
    },
    contentBlocks: [contentBlockSchema],
    isRequired: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

resumeGuideSectionSchema.index({ sectionOrder: 1 });

module.exports = mongoose.model('ResumeGuideSection', resumeGuideSectionSchema);
