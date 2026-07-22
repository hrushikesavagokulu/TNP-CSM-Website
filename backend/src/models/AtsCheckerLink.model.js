'use strict';

const mongoose = require('mongoose');

// Deliberately simple — no ContentBlockSchema.
// An ATS checker link is always exactly: name + description + url.
const atsCheckerLinkSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'ATS tool name is required.'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    url: {
      type: String,
      required: [true, 'ATS tool URL is required.'],
      trim: true,
    },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

atsCheckerLinkSchema.index({ order: 1 });

module.exports = mongoose.model('AtsCheckerLink', atsCheckerLinkSchema);
