'use strict';

/**
 * migrateBatchTypeToBatches.js
 *
 * One-time migration: converts the old `batchType` String enum field on User docs
 * into the new `batches` ObjectId-array referencing the Batch collection.
 *
 * This script is SAFE to run once on a live database:
 *   - It only touches User docs that still have a non-null `batchType` field.
 *   - For each distinct (batchType, year) combination in use, it creates a matching
 *     Batch doc (or finds the existing one if the script was partially run before).
 *   - It then $addToSet the batch._id into each matching user's `batches` array.
 *   - Finally it $unsets `batchType` from all User docs that had it set.
 *
 * NO-OP on a fresh database with no legacy data (no Users with batchType set).
 *
 * Usage (run inside the container or from a machine with DB access):
 *   node backend/src/scripts/migrateBatchTypeToBatches.js
 *
 * Or from the project root (if MONGODB_URI is set in environment):
 *   MONGODB_URI=mongodb://... node backend/src/scripts/migrateBatchTypeToBatches.js
 */

const mongoose = require('mongoose');
const path     = require('path');

// ── Load env (try dotenv if available, gracefully skip if not) ────────────────
try {
  require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
} catch {
  // dotenv optional
}

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/tnp_csm';

// ── Inline minimal schemas (avoid circular require issues in script context) ──
const batchSchema = new mongoose.Schema(
  {
    name:      { type: String, required: true, trim: true },
    year:      { type: Number, required: true, enum: [3, 4] },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);
batchSchema.index({ name: 1, year: 1 }, { unique: true });

// User schema: use a minimal version that still allows reading batchType
const userSchema = new mongoose.Schema({
  batchType: { type: String, default: null },
  year:      { type: Number },
  batches:   [{ type: mongoose.Schema.Types.ObjectId, ref: 'Batch' }],
}, { strict: false, timestamps: true });

async function run() {
  console.log('🚀  Connecting to MongoDB…');
  await mongoose.connect(MONGODB_URI);
  console.log('✅  Connected.');

  const Batch = mongoose.models.Batch || mongoose.model('Batch', batchSchema);
  const User  = mongoose.models.User  || mongoose.model('User',  userSchema);

  // Find all users that still have the old batchType field set to a non-null value
  const legacyUsers = await User.find({
    batchType: { $exists: true, $ne: null },
  }).lean();

  if (legacyUsers.length === 0) {
    console.log('ℹ️   No legacy batchType data found. Migration is a no-op.');
    await mongoose.disconnect();
    return;
  }

  console.log(`🔍  Found ${legacyUsers.length} user(s) with legacy batchType set.`);

  // Collect distinct (batchType, year) pairs that need Batch docs created
  const distinctPairs = {};
  for (const user of legacyUsers) {
    if (!user.batchType || !user.year) continue;
    if (![3, 4].includes(user.year)) {
      console.warn(`⚠️   User ${user._id} has batchType="${user.batchType}" but year=${user.year} — skipping (only year 3/4 supported).`);
      continue;
    }
    const key = `${user.batchType}::${user.year}`;
    distinctPairs[key] = { name: user.batchType, year: user.year };
  }

  // Map old batchType+year → Batch _id
  const batchIdMap = {};

  for (const [key, { name, year }] of Object.entries(distinctPairs)) {
    let batch = await Batch.findOne({ name, year });
    if (!batch) {
      batch = await Batch.create({ name, year });
      console.log(`✨  Created Batch "${name}" (Year ${year}) — _id: ${batch._id}`);
    } else {
      console.log(`♻️   Reusing existing Batch "${name}" (Year ${year}) — _id: ${batch._id}`);
    }
    batchIdMap[key] = batch._id;
  }

  // Update each legacy user
  let updatedCount = 0;
  for (const user of legacyUsers) {
    if (!user.batchType || !user.year) continue;
    if (![3, 4].includes(user.year)) continue;

    const key     = `${user.batchType}::${user.year}`;
    const batchId = batchIdMap[key];
    if (!batchId) continue;

    await User.updateOne(
      { _id: user._id },
      {
        $addToSet: { batches: batchId },
        $unset:    { batchType: '' },
      }
    );
    updatedCount++;
  }

  console.log(`✅  Migration complete. Updated ${updatedCount} user document(s).`);
  console.log(`    Old batchType field unset on all migrated users.`);

  // Verify no remaining legacy docs
  const remaining = await User.countDocuments({ batchType: { $exists: true, $ne: null } });
  if (remaining > 0) {
    console.warn(`⚠️   ${remaining} user(s) still have batchType set — check for year 1/2 edge cases above.`);
  } else {
    console.log('🎉  No batchType fields remain in the User collection.');
  }

  await mongoose.disconnect();
  console.log('🔌  Disconnected from MongoDB.');
}

run().catch((err) => {
  console.error('❌  Migration failed:', err);
  process.exit(1);
});
