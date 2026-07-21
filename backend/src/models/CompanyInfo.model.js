'use strict';

const mongoose           = require('mongoose');
const contentBlockSchema = require('./shared/contentBlock.schema');

const roundSchema = new mongoose.Schema(
  {
    roundName:   { type: String, required: true, trim: true },
    attended:    { type: Number, default: 0 },
    passed:      { type: Number, default: 0 },
    eliminated:  { type: Number, default: 0 },
    focusTopics: [{ type: String, trim: true }],
    details:     { type: String, default: '', trim: true },
  },
  { _id: true }
);

const companyInfoSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Company name is required.'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    aboutCompany: {
      type: String,
      default: '',
      trim: true,
    },
    status: {
      type: String,
      enum: ['upcoming', 'ongoing', 'completed'],
      default: 'upcoming',
      index: true,
    },
    academicYear: {
      type: String,
      default: '2024-2025',
      index: true,
      trim: true,
    },
    driveDate: {
      type: Date,
    },
    eligibilityCriteria: {
      type: String,
      default: '',
      trim: true,
    },
    ctc: {
      type: String,
      default: '',
      trim: true,
    },
    roles: [{ type: String, trim: true }],
    recruitmentProcess: {
      type: String,
      default: '',
      trim: true,
    },
    prevYearProcess: {
      type: String,
      default: '',
      trim: true,
    },
    rounds: [roundSchema],
    totalCleared: {
      type: Number,
      default: 0,
    },
    prevYearQuestions: [contentBlockSchema],
    offlineOrOnline: {
      type: String,
      enum: ['offline', 'online'],
      default: 'offline',
    },
    linkedAlumniRepos: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AlumniRepo',
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

companyInfoSchema.index({ status: 1, academicYear: -1 });

module.exports = mongoose.model('CompanyInfo', companyInfoSchema);
