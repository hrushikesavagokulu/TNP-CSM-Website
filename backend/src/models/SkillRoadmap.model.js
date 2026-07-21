'use strict';

const mongoose         = require('mongoose');
const contentBlockSchema = require('./shared/contentBlock.schema');

const skillRoadmapSchema = new mongoose.Schema(
  {
    semester: {
      type: Number,
      required: [true, 'Semester is required.'],
      min: 1,
      max: 8,
      index: true,
    },
    skillGroupName: {
      type: String,
      required: [true, 'Skill group name is required.'],
      trim: true,
    },
    mandatory: {
      type: Boolean,
      default: false,
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
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

skillRoadmapSchema.index({ semester: 1, order: 1 });

module.exports = mongoose.model('SkillRoadmap', skillRoadmapSchema);
