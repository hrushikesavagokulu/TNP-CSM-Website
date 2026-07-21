'use strict';

/**
 * Batch.model.js
 *
 * Represents an admin-managed batch group (e.g. "Smart Interviews", "TAP", "Product Track").
 * Batches are ONLY valid for Year 3 or Year 4 students — Year 1/2 students are never
 * assigned to batches. This constraint is enforced both here (year enum) and in the
 * batch controller's add-members logic.
 *
 * A student can belong to multiple batches simultaneously (many-to-many via User.batches[]).
 * The compound unique index {name, year} prevents duplicate batch names within the same year,
 * but the same name CAN exist independently in year 3 and year 4.
 */

const mongoose = require('mongoose');

const batchSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Batch name is required.'],
      trim: true,
    },
    year: {
      type: Number,
      required: [true, 'Year is required.'],
      enum: {
        values: [3, 4],
        message: 'Batches can only be created for Year 3 or Year 4 students.',
      },
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index: same batch name can't be used twice within the same year.
// The same name CAN exist for year 3 AND year 4 independently.
batchSchema.index({ name: 1, year: 1 }, { unique: true });

const Batch = mongoose.model('Batch', batchSchema);

module.exports = Batch;
