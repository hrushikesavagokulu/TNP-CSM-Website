'use strict';

const mongoose = require('mongoose');

const companySecuredSchema = new mongoose.Schema(
  {
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CompanyInfo',
      required: true,
    },
    offerType: {
      type: String,
      default: 'Full-Time',
      trim: true,
    },
    ctc: {
      type: String,
      default: '',
      trim: true,
    },
    interviewQuestions: [{ type: String, trim: true }],
    reviews: {
      type: String,
      default: '',
      trim: true,
    },
    tips: {
      type: String,
      default: '',
      trim: true,
    },
  },
  { _id: true }
);

const alumniRepoSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Alumnus name is required.'],
      trim: true,
    },
    rollNo: {
      type: String,
      default: '',
      trim: true,
    },
    linkedin: {
      type: String,
      default: '',
      trim: true,
    },
    github: {
      type: String,
      default: '',
      trim: true,
    },
    email: {
      type: String,
      default: '',
      trim: true,
      lowercase: true,
    },
    profileImage: {
      type: String,
      default: null,
    },
    companiesSecured: [companySecuredSchema],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

alumniRepoSchema.index({ name: 'text', rollNo: 'text' });

module.exports = mongoose.model('AlumniRepo', alumniRepoSchema);
