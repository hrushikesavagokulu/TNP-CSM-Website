'use strict';

const mongoose = require('mongoose');

const schemeLinkSchema = new mongoose.Schema(
  {
    schemeYear: {
      type: String,
      required: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    url: {
      type: String,
      required: true,
      trim: true,
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

module.exports = mongoose.model('SchemeLink', schemeLinkSchema);
