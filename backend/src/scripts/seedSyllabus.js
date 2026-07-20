'use strict';

const mongoose = require('mongoose');
const SchemeLink = require('../models/SchemeLink.model');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://mongo:27017/tmp_db';

const SYLLABUS_DATA = [
  {
    schemeYear: 'Scheme-2020',
    title: 'Syllabus for I B.Tech (Common for CSM & CSD Branches)',
    url: 'https://www.gprec.ac.in/scheme-2020/GPREC-9X-SCHEME-2020%20CSM%20STRUCTURE_SYLLABUS.pdf',
    order: 0
  },
  {
    schemeYear: 'Scheme-2023',
    title: 'Syllabus for I B.Tech',
    url: 'https://www.gprec.ac.in/scheme-2023/Scheme-2023-I-B.Tech-scheme-Syllabus.pdf',
    order: 1
  },
  {
    schemeYear: 'Scheme-2020',
    title: 'Syllabus for II, III, IV B.Tech',
    url: 'https://www.gprec.ac.in/scheme-2020/S-20-CSE(AI&ML)-Syllabus.pdf',
    order: 2
  },
  {
    schemeYear: 'Scheme-2023',
    title: 'Syllabus for II B.Tech',
    url: 'https://www.gprec.ac.in/scheme-23/CSE(AI&ML)%20S-23%20II%20Year%20Syllabus.pdf',
    order: 3
  },
  {
    schemeYear: 'Scheme-2023',
    title: 'Syllabus for III, IV Year B.Tech',
    url: 'https://www.gprec.ac.in/scheme-23/CSE(AI&ML)-S-23-III,IV-Year-Syllabus.pdf',
    order: 4
  }
];

async function seed() {
  console.log('[SeedSyllabus] Connecting to database...');
  try {
    await mongoose.connect(MONGO_URI);
    console.log('[SeedSyllabus] Connected.');

    await SchemeLink.deleteMany({});
    console.log('[SeedSyllabus] Cleared existing syllabus links.');

    const docs = await SchemeLink.insertMany(SYLLABUS_DATA);
    console.log(`[SeedSyllabus] Successfully seeded ${docs.length} syllabus schemes!`);
  } catch (err) {
    console.error('[SeedSyllabus] Seeding error:', err.message);
  } finally {
    await mongoose.disconnect();
    console.log('[SeedSyllabus] Disconnected.');
  }
}

seed();
