'use strict';

const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    semester: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    batchLabel: {
      type: String,
      default: null,
      trim: true,
    },
    driveRootFolderId: {
      type: String,
      required: true,
      trim: true,
    },
    driveRootFolderLink: {
      type: String,
      required: true,
      trim: true,
    },
    yearFolderIds: {
      type: Map,
      of: String,
      default: {},
    },
    expiresAt: {
      type: Date,
      default: null,
    },
    isClosed: {
      type: Boolean,
      default: false,
    },
    allowedUploadTypes: {
      type: [String],
      default: ['image', 'pdf'],
    },
    shareableSlug: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Event', eventSchema);
