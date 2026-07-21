'use strict';

/**
 * contentBlock.schema.js
 *
 * Reusable Mongoose SUB-schema (not its own collection).
 * Embedded as `contentBlocks: [contentBlockSchema]` in Phase 7+ models.
 *
 * block.type  → rendering strategy in ContentBlockRenderer.jsx
 * block.label → display name shown to student
 * block.value → the actual payload (text, URL, file URL, etc.)
 * block.order → sort order (ascending = first shown)
 */

const mongoose = require('mongoose');

const contentBlockSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['text', 'link', 'video', 'image', 'file', 'pdf'],
      required: true,
    },
    label: {
      type: String,
      default: '',
      trim: true,
    },
    value: {
      type: String,
      required: true,
      trim: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { _id: true } // keep _id so we can reference blocks by id on reorder/delete
);

module.exports = contentBlockSchema;
