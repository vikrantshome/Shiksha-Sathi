/**
 * One-time migration: Add partial unique index on phone for TEACHER role only.
 *
 * MongoDB partial indexes allow uniqueness enforcement only for a subset of documents.
 * This ensures each phone number can have only ONE active teacher, while allowing
 * multiple students (e.g., siblings) to share the same parent phone number.
 *
 * Usage:
 *   node scripts/add-phone-unique-index-teachers.mjs
 *
 * Requires MONGODB_URI in .env.local
 */

import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('Please provide MONGODB_URI in .env.local');
  process.exit(1);
}

const client = new MongoClient(uri);

async function main() {
  await client.connect();
  const db = client.db();
  const collection = db.collection('users');

  console.log('Adding partial unique index on phone for TEACHER role...\n');

  try {
    // Check for duplicate teacher phones first
    const duplicates = await collection.aggregate([
      { $match: { role: 'TEACHER', phone: { $exists: true } } },
      { $group: { _id: '$phone', count: { $sum: 1 }, ids: { $push: '$_id' } } },
      { $match: { count: { $gt: 1 } } },
    ]).toArray();

    if (duplicates.length > 0) {
      console.log('  ⚠️  Found duplicate teacher phones:');
      for (const dup of duplicates) {
        console.log(`    Phone: ${dup._id} — ${dup.count} teachers (IDs: ${dup.ids.join(', ')})`);
      }
      console.log('\n  ℹ️  Index creation skipped due to existing duplicates.');
      console.log('  ℹ️  Service-layer validation will prevent new duplicates.');
      console.log('  ℹ️  To create the index, manually resolve duplicates first.');
      console.log('\n✅ Migration complete (index not created due to duplicates)');
      return;
    }

    // Drop existing phone index if it exists (non-partial)
    try {
      await collection.dropIndex('phone_1');
      console.log('  Dropped existing phone_1 index');
    } catch {
      // Index doesn't exist, that's fine
    }

    // Create partial unique index (only for teachers with a phone set)
    // Note: MongoDB partialFilterExpression has limited operators.
    // We use $exists to only index documents where phone is present.
    const result = await collection.createIndex(
      { phone: 1 },
      {
        unique: true,
        partialFilterExpression: {
          role: 'TEACHER',
          phone: { $exists: true },
        },
        name: 'phone_unique_teachers',
      }
    );

    console.log(`  ✅ Created index: ${result}`);

    // Verify the index
    const indexes = await collection.indexes();
    const phoneIndex = indexes.find(i => i.name === 'phone_unique_teachers');
    if (phoneIndex) {
      console.log('  Index details:', JSON.stringify(phoneIndex, null, 2));
    }

    console.log('\n✅ Migration complete!');
    console.log('   - Teacher phones are now unique (enforced by DB)');
    console.log('   - Student phones can still be duplicated (siblings)');

  } catch (err) {
    console.error('Migration failed:', err.message);
    process.exit(1);
  } finally {
    await client.close();
  }
}

main();
