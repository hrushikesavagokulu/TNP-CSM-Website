'use strict';

const mongoose = require('mongoose');

const skillsCatalogueSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
}, {
  timestamps: true,
});

const SkillsCatalogue = mongoose.model('SkillsCatalogue', skillsCatalogueSchema);

module.exports = SkillsCatalogue;
