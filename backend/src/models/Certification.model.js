'use strict';

const mongoose           = require('mongoose');
const contentBlockSchema = require('./shared/contentBlock.schema');

const certificationSchema = new mongoose.Schema(
  {
    semester: {
      type: Number,
      required: [true, 'Semester is required.'],
      min: 1,
      max: 8,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Certification name is required.'],
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

certificationSchema.index({ semester: 1, order: 1 });

module.exports = mongoose.model('Certification', certificationSchema);
