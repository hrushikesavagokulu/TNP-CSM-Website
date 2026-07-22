'use strict';

const mongoose = require('mongoose');

// ── Achievement sub-schema ────────────────────────────────────────────────────
const achievementSchema = new mongoose.Schema(
  {
    title:       { type: String, required: true },
    fileUrl:     { type: String },
    fileType:    { type: String },
    description: { type: String },
    date:        { type: Date },
  },
  { _id: true }
);

// ── Roadmap checklist item sub-schema ─────────────────────────────────────────
const checklistItemSchema = new mongoose.Schema(
  {
    itemId: { type: String, required: true },
    done:   { type: Boolean, default: false },
    doneAt: { type: Date },
  },
  { _id: false }
);

// ── Main User schema ──────────────────────────────────────────────────────────
const userSchema = new mongoose.Schema(
  {
    // ── Identity ───────────────────────────────────────────────────────────
    name:   { type: String, required: true, trim: true },
    rollNo: {
      type: String,
      required: function() { return this.role === 'student'; },
      sparse: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    // select:false — must explicitly .select('+passwordHash') to read it
    passwordHash: { type: String, required: true, select: false },

    // ── Contact ────────────────────────────────────────────────────────────
    phone:       { type: String, trim: true },
    parentPhone: { type: String, trim: true },

    // ── Academic ───────────────────────────────────────────────────────────
    branch: { type: String, trim: true },
    year:   { type: Number, enum: [1, 2, 3, 4] },
    // batches: ObjectId refs to Batch docs (year 3/4 only; always [] for year 1/2).
    // A student can belong to multiple batches simultaneously.
    batches: [
      { type: mongoose.Schema.Types.ObjectId, ref: 'Batch' },
    ],

    // ── Role / access ──────────────────────────────────────────────────────
    role:         { type: String, enum: ['student', 'admin'], default: 'student' },
    isSuperAdmin: { type: Boolean, default: false },
    isActive:     { type: Boolean, default: true },

    // ── Profile ────────────────────────────────────────────────────────────
    profileImage:          { type: String, default: null },
    profileImageIsPublic:  { type: Boolean, default: false },
    isHostel:              { type: Boolean },
    laptopAvailable:       { type: Boolean },
    mncOrHigherEd:         { type: Boolean },

    // ── Skills & links ─────────────────────────────────────────────────────
    skills:       [{ type: String }],
    links: {
      linkedin:  { type: String },
      github:    { type: String },
      leetcode:  { type: String },
      portfolio: { type: String },
    },
    projectLinks: [{ type: String }],

    // ── Achievements ───────────────────────────────────────────────────────
    achievements: [achievementSchema],

    // ── Progress / roadmap ─────────────────────────────────────────────────
    progress: {
      roadmapChecklist:  [checklistItemSchema],
      completionPercent: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
  }
);

// ── Indexes ──────────────────────────────────────────────────────────────────
userSchema.index({ year: 1 });     // year-level announcement queries
userSchema.index({ batches: 1 }); // batch membership queries

// ── Model ────────────────────────────────────────────────────────────────────
const User = mongoose.model('User', userSchema);

module.exports = User;
