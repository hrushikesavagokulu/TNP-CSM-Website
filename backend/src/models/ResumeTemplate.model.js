'use strict';

const mongoose = require('mongoose');

const resumeTemplateSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Template title is required.'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    category: {
      type: String,
      enum: ['fresher', 'experienced', 'internship', 'general'],
      default: 'general',
    },
    previewImageUrl: {
      type: String,
      default: '',
    },
    fileUrl: {
      type: String,
      required: [true, 'Template file URL is required.'],
    },
    fileType: {
      type: String,
      enum: ['docx', 'pdf'],
    },
    order: { type: Number, default: 0 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

resumeTemplateSchema.index({ order: 1 });

module.exports = mongoose.model('ResumeTemplate', resumeTemplateSchema);
