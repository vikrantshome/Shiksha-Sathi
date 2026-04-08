#!/usr/bin/env node
/**
 * Backfill assignment codes for existing assignments that are missing them.
 * Run: node scripts/backfill-assignment-codes.mjs
 */

import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('MONGODB_URI not found in .env.local');
  process.exit(1);
}

const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Excludes I, O, 0, 1

function generateCode() {
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += CHARS[Math.floor(Math.random() * CHARS.length)];
  }
  return code;
}

async function main() {
  const client = new MongoClient(MONGODB_URI);
  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db();
    const collection = db.collection('assignments');

    // Find all assignments missing a code
    const missing = await collection.find({
      $or: [{ code: { $exists: false } }, { code: null }, { code: '' }],
    }).toArray();

    if (missing.length === 0) {
      console.log('All assignments already have codes. Nothing to do.');
      return;
    }

    console.log(`Found ${missing.length} assignment(s) without codes.`);

    // Get all existing codes to avoid collisions
    const existingCodes = new Set(
      (await collection.find({ code: { $exists: true, $ne: null, $ne: '' } })
        .toArray())
        .map((a) => a.code)
    );

    let updated = 0;
    let skipped = 0;

    for (const assignment of missing) {
      let code;
      let attempts = 0;
      do {
        code = generateCode();
        attempts++;
        if (attempts > 20) {
          console.warn(`Could not generate unique code for ${assignment._id}, skipping.`);
          skipped++;
          code = null;
          break;
        }
      } while (existingCodes.has(code));

      if (code) {
        await collection.updateOne(
          { _id: assignment._id },
          { $set: { code } }
        );
        existingCodes.add(code);
        updated++;
        console.log(`  ${assignment.title || assignment._id} → ${code}`);
      }
    }

    console.log(`\nDone! Updated ${updated} assignment(s), skipped ${skipped}.`);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  } finally {
    await client.close();
  }
}

main();
