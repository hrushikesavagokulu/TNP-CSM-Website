'use strict';

const mongoose = require('mongoose');

const departmentInfoSchema = new mongoose.Schema(
  {
    motto: {
      type: String,
      default: '',
    },
    vision: {
      type: String,
      default: '',
    },
    mission: {
      type: String,
      default: '',
    },
    heroImageUrl: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('DepartmentInfo', departmentInfoSchema);
