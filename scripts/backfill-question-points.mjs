import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import { resolveQuestionPoints } from './lib/question-points.mjs';

dotenv.config({ path: '.env.local' });

const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('Please provide MONGODB_URI in .env.local');
  process.exit(1);
}

const client = new MongoClient(uri);

function hasValidPoints(question) {
  return Number.isFinite(question?.points) && question.points > 0;
}

async function run() {
  try {
    await client.connect();
    const db = client.db('shikshasathi');
    const collection = db.collection('questions');

    const cursor = collection.find({
      $or: [
        { points: { $exists: false } },
        { points: null },
        { points: 0 },
      ],
    });

    let scanned = 0;
    let changed = 0;

    while (await cursor.hasNext()) {
      const question = await cursor.next();
      if (!question) continue;

      scanned += 1;

      if (hasValidPoints(question)) {
        continue;
      }

      const points = resolveQuestionPoints(question);
      changed += 1;

      if (!DRY_RUN) {
        await collection.updateOne(
          { _id: question._id },
          {
            $set: {
              points,
              updated_at: new Date(),
            },
          }
        );
      }
    }

    console.log(`Mode: ${DRY_RUN ? 'dry-run' : 'write'}`);
    console.log(`Questions scanned: ${scanned}`);
    console.log(`Questions ${DRY_RUN ? 'that would be updated' : 'updated'}: ${changed}`);
  } catch (error) {
    console.error('Error while backfilling question points:', error);
    process.exitCode = 1;
  } finally {
    await client.close();
  }
}

run();
