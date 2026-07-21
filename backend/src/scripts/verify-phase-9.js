'use strict';

const mongoose    = require('mongoose');
const Achievement = require('../models/Achievement.model');
const User        = require('../models/User.model');

const MONGO_URI = 'mongodb://mongo:27017/tmp_db';

async function main() {
  console.log('--- Phase 9 Department Achievements Automated Verification Script ---');

  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected to MongoDB.');

  // Clean test records
  await Achievement.deleteMany({ title: { $regex: /^TEST_/ } });

  const adminUser = await User.findOne({ role: 'admin' });
  if (!adminUser) throw new Error('Admin user missing');

  // 1. Post two achievements with different dates to test newest-first sort
  console.log('\n1. Creating two test achievements with different dates...');
  const olderDate = new Date('2025-01-10');
  const newerDate = new Date('2026-06-15');

  const olderItem = await Achievement.create({
    title: 'TEST_Older Achievement',
    description: 'Older milestone event details',
    date: olderDate,
    postedBy: adminUser._id,
  });

  const newerItem = await Achievement.create({
    title: 'TEST_Newer Achievement',
    description: 'Special hackathon victory with unusual_keyword_xyz description text',
    date: newerDate,
    media: [
      { type: 'text', label: 'Spotlight Summary', value: 'First place out of 50 team entries.', order: 0 },
      { type: 'image', label: 'Trophy Image', value: 'https://example.com/trophy.png', order: 1 },
    ],
    postedBy: adminUser._id,
  });

  console.log('✅ Created older item ID:', olderItem._id);
  console.log('✅ Created newer item ID:', newerItem._id);

  // Verify newest-first sort
  console.log('\n2. Verifying chronological feed (newest first)...');
  const feed = await Achievement.find({ title: { $regex: /^TEST_/ } })
    .sort({ date: -1 })
    .lean();

  if (feed[0]._id.toString() !== newerItem._id.toString()) {
    throw new Error('Chronological sort failed: newest item is not first');
  }
  console.log(`✅ Chronological sort verified: TOP item is "${feed[0].title}" (${feed[0].date.toISOString()})`);

  // 3. Search test on description keyword
  console.log('\n3. Testing search matching description keyword ("unusual_keyword_xyz")...');
  const searchResults = await Achievement.find({
    title: { $regex: /^TEST_/ },
    $or: [
      { title: { $regex: 'unusual_keyword_xyz', $options: 'i' } },
      { description: { $regex: 'unusual_keyword_xyz', $options: 'i' } },
    ],
  });

  console.log(`✅ Search results count: ${searchResults.length}`);
  if (searchResults.length !== 1 || searchResults[0]._id.toString() !== newerItem._id.toString()) {
    throw new Error('Description text search matching failed');
  }
  console.log('✅ Description keyword search matched successfully.');

  // 4. Verify ContentBlock schema media array
  console.log('\n4. Verifying media array content block types...');
  const populatedItem = await Achievement.findById(newerItem._id);
  console.log(`✅ Media blocks count: ${populatedItem.media.length}`);
  if (populatedItem.media.length !== 2 || populatedItem.media[0].type !== 'text' || populatedItem.media[1].type !== 'image') {
    throw new Error('Content block media array structure invalid');
  }
  console.log('✅ Media content block types verified (text, image).');

  // Clean test records
  await Achievement.deleteMany({ title: { $regex: /^TEST_/ } });
  console.log('\n✅ Cleaned up test data.');

  console.log('\n🎉 ALL 4 PHASE 9 VERIFICATION CRITERIA PASSED SUCCESSFULLY!');
  await mongoose.disconnect();
}

main().catch(async (err) => {
  console.error('❌ Phase 9 Verification failed:', err.message);
  await mongoose.disconnect();
  process.exit(1);
});
