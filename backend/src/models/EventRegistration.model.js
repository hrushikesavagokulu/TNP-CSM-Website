'use strict';

const mongoose = require('mongoose');

const certificateSubSchema = new mongoose.Schema(
  {
    certificateName: {
      type: String,
      required: true,
      trim: true,
    },
    driveFileId: {
      type: String,
      required: true,
      trim: true,
    },
    driveFileLink: {
      type: String,
      required: true,
      trim: true,
    },
    fileType: {
      type: String,
      default: 'pdf',
    },
    isFallback: {
      type: Boolean,
      default: false,
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const eventRegistrationSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    submittedName: {
      type: String,
      required: true,
      trim: true,
    },
    submittedRollNo: {
      type: String,
      required: true,
      trim: true,
    },
    submittedEmail: {
      type: String,
      required: true,
      trim: true,
    },
    submittedSection: {
      type: String,
      required: true,
      trim: true,
    },
    submittedYear: {
      type: String,
      required: true,
      trim: true,
    },
    certificates: [certificateSubSchema],
    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index on event + user
eventRegistrationSchema.index({ event: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('EventRegistration', eventRegistrationSchema);
