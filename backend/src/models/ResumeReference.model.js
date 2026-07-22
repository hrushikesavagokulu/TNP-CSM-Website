'use strict';

const mongoose           = require('mongoose');
const contentBlockSchema = require('./shared/contentBlock.schema');

const resumeReferenceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Reference title is required.'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    category: {
      type: String,
      default: '',
      trim: true,
    },
    contentBlocks: [contentBlockSchema],
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

resumeReferenceSchema.index({ order: 1 });

module.exports = mongoose.model('ResumeReference', resumeReferenceSchema);
