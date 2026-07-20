'use strict';

const mongoose = require('mongoose');

const facultyLinkSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    designation: {
      type: String,
      required: true,
      trim: true,
    },
    qualifications: {
      type: String,
      default: '',
      trim: true,
    },
    researchInterest: {
      type: String,
      default: '',
      trim: true,
    },
    googleScholar: {
      type: String,
      default: '',
      trim: true,
    },
    apaarId: {
      type: String,
      default: '',
      trim: true,
    },
    vidwanProfile: {
      type: String,
      default: '',
      trim: true,
    },
    email: {
      type: String,
      default: '',
      trim: true,
    },
    isGuest: {
      type: Boolean,
      default: false,
    },
    imageUrl: {
      type: String,
      default: '',
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

module.exports = mongoose.model('FacultyLink', facultyLinkSchema);
