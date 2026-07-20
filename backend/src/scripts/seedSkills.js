'use strict';

require('dotenv').config();
const mongoose = require('mongoose');
const SkillsCatalogue = require('../models/SkillsCatalogue.model');

const SKILLS_TO_SEED = [
  'Data Structures',
  'Algorithms',
  'React',
  'Python',
  'Machine Learning',
  'SQL',
  'Docker',
  'Node.js',
  'Express.js',
  'MongoDB',
  'Redis',
  'JavaScript',
  'TypeScript',
  'C++',
  'Java',
  'HTML & CSS',
  'Git & GitHub',
  'Tailwind CSS',
  'Deep Learning',
  'TensorFlow',
  'PyTorch',
  'AWS',
];

async function seed() {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/tmp_db';
  console.log(`[Seed] Connecting to MongoDB at ${uri}...`);

  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log('[Seed] Connected successfully.');

    for (const skillName of SKILLS_TO_SEED) {
      await SkillsCatalogue.updateOne(
        { name: skillName },
        { name: skillName },
        { upsert: true }
      );
    }

    const total = await SkillsCatalogue.countDocuments();
    console.log(`[Seed] Successfully seeded skills. Total skills in catalogue: ${total}`);
  } catch (err) {
    console.error('[Seed] Error during seeding:', err.message);
  } finally {
    await mongoose.disconnect();
    console.log('[Seed] Disconnected.');
  }
}

seed();
