'use strict';

const mongoose = require('mongoose');

const adminAllowListSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true,
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true,
});

const AdminAllowList = mongoose.model('AdminAllowList', adminAllowListSchema);

module.exports = AdminAllowList;
