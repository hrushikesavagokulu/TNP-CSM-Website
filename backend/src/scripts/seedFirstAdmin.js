'use strict';

/**
 * seedFirstAdmin.js
 *
 * Manual bootstrap script to register the very first administrator email.
 * This injects the email directly into the AdminAllowList table.
 *
 * Usage:
 *   node src/scripts/seedFirstAdmin.js admin@gprec.ac.in
 */

require('dotenv').config();
const mongoose = require('mongoose');
const AdminAllowList = require('../models/AdminAllowList.model');

async function main() {
  const args = process.argv.slice(2);
  const emailInput = args[0];

  if (!emailInput || !emailInput.includes('@')) {
    console.error('❌ Error: Please specify a valid email address.');
    console.error('Usage: node src/scripts/seedFirstAdmin.js <email>');
    process.exit(1);
  }

  const cleanEmail = emailInput.trim().toLowerCase();
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/tmp_db';

  console.log(`[SeedAdmin] Connecting to database at ${uri}...`);
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log('[SeedAdmin] Database connected.');

    // Upsert into AdminAllowList
    const result = await AdminAllowList.findOneAndUpdate(
      { email: cleanEmail },
      { email: cleanEmail },
      { upsert: true, new: true }
    );

    console.log(`✅ Success: Email "${cleanEmail}" is now allowed as an Administrator.`);
    console.log('[SeedAdmin] Account setup information:');
    console.log(`  - AllowList ID: ${result._id}`);
    console.log('  - Next step: Register this email on the portal registration page, or login if already created.');
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
  } finally {
    await mongoose.disconnect();
    console.log('[SeedAdmin] Database disconnected.');
  }
}

main();
