'use strict';

const mongoose           = require('mongoose');
const contentBlockSchema = require('./shared/contentBlock.schema');

const learningResourceSchema = new mongoose.Schema(
  {
    skillName: {
      type: String,
      required: [true, 'Skill name is required.'],
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

learningResourceSchema.index({ skillName: 1, order: 1 });

module.exports = mongoose.model('LearningResource', learningResourceSchema);
