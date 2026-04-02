import fs from 'fs';
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function cleanupStaleChapters() {
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  const db = client.db('shikshasathi');

  // Load valid source files from registry
  const registry = JSON.parse(fs.readFileSync('doc/NCERT/registry.json', 'utf8'));
  const validSourceFiles = new Set();
  for (const classData of Object.values(registry.classes)) {
    for (const subjectData of Object.values(classData.subjects)) {
      if (Array.isArray(subjectData.chapters)) {
        subjectData.chapters.forEach(c => validSourceFiles.add(c.file));
      } else if (subjectData.books) {
        subjectData.books.forEach(b => (b.chapters || []).forEach(c => validSourceFiles.add(c.file)));
      }
    }
  }

  // Find all distinct source files in DB
  const ingested = await db.collection('questions').aggregate([
    { $match: { 'provenance.board': 'NCERT', 'provenance.sourceFile': { $ne: null } } },
    { $group: { _id: '$provenance.sourceFile', count: { $sum: 1 } } }
  ]).toArray();

  let staleFiles = [];
  let staleQuestionCount = 0;

  for (const item of ingested) {
    if (!validSourceFiles.has(item._id)) {
      staleFiles.push(item._id);
      staleQuestionCount += item.count;
    }
  }

  console.log(`Found ${staleFiles.length} stale chapters with ${staleQuestionCount} questions.`);

  if (staleFiles.length > 0) {
    console.log("Deleting stale questions from DB...");
    const result = await db.collection('questions').deleteMany({
      'provenance.board': 'NCERT',
      'provenance.sourceFile': { $in: staleFiles }
    });
    console.log(`Deleted ${result.deletedCount} stale questions.`);
  } else {
    console.log("No stale questions to delete.");
  }
  
  await client.close();
}

cleanupStaleChapters().catch(console.error);
