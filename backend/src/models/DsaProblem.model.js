const mongoose = require('mongoose');

const dsaProblemSchema = new mongoose.Schema(
  {
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
      default: 'leetcode',
      lowercase: true,
      trim: true,
    },
    difficulty: {
      type: String,
      required: true,
      enum: ['easy', 'medium', 'hard'],
      default: 'easy',
      lowercase: true,
    },
    topic: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

dsaProblemSchema.index({ topic: 1, difficulty: 1 });

module.exports = mongoose.model('DsaProblem', dsaProblemSchema);
