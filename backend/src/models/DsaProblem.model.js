const mongoose = require('mongoose');

const dsaProblemSchema = new mongoose.Schema(
  {
    slugId: {
      type: String,
      trim: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    link: {
      type: String,
      required: true,
      trim: true,
    },
    source: {
      type: String,
      required: true,
      enum: ['leetcode', 'gfg', 'codeforces', 'cses', 'hackerrank', 'other'],
      default: 'leetcode',
      lowercase: true,
      trim: true,
    },
    track: {
      type: String,
      required: true,
      enum: ['dsa', 'programming'],
      default: 'dsa',
      lowercase: true,
      trim: true,
      index: true,
    },
    difficulty: {
      type: String,
      required: true,
      enum: ['easy', 'medium', 'hard'],
      default: 'easy',
      lowercase: true,
      index: true,
    },
    topic: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    patterns: [
      {
        type: String,
        trim: true,
      },
    ],
    companies: [
      {
        type: String,
        trim: true,
      },
    ],
    frequency: {
      type: String,
      enum: ['very-high', 'high', 'medium', 'low', ''],
      default: 'medium',
      lowercase: true,
    },
    sheetRefs: [
      {
        type: String,
        trim: true,
      },
    ],
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

dsaProblemSchema.index({ track: 1, topic: 1, difficulty: 1 });
dsaProblemSchema.index({ link: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('DsaProblem', dsaProblemSchema);
