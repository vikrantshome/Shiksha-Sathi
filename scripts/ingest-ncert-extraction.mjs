import fs from 'fs';
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

// Load .env.local for MongoDB URI
dotenv.config({ path: '.env.local' });

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("Please provide MONGODB_URI in .env.local");
  process.exit(1);
}

const client = new MongoClient(uri);

async function ingest(filePath) {
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const { provenance, questions } = data;

  // Generate extraction run ID from file metadata for proper versioning (SSA-200)
  const extractionRunId = `${provenance.class}-${provenance.subject}-${provenance.book.replace(/\s+/g, '-').toLowerCase()}-ch${provenance.chapterNumber}-v1`;

  try {
    await client.connect();
    const db = client.db("shikshasathi");
    const collection = db.collection("questions");

    const mappedQuestions = questions.map(q => ({
      ...q,
      subject_id: provenance.subject,
      chapter: `Chapter ${provenance.chapterNumber}: ${provenance.chapterTitle}`,
      provenance: {
        ...provenance,
        extraction_run_id: extractionRunId
      },
      review_status: "PENDING", // Require review before publishing (SSA-210)
      created_at: new Date(),
      updated_at: new Date()
    }));

    // Check for existing questions from the same extraction run
    const existingCount = await collection.countDocuments({
      "provenance.extraction_run_id": extractionRunId
    });

    if (existingCount > 0) {
      console.log(`⚠️  Skipping ${filePath}: ${existingCount} questions already exist for this extraction run`);
      return;
    }

    const result = await collection.insertMany(mappedQuestions);
    console.log(`✅ Ingested ${result.insertedCount} questions from ${filePath} (Status: PENDING review)`);
    console.log(`   Extraction Run ID: ${extractionRunId}`);
  } catch (error) {
    console.error("Error during ingestion:", error);
  } finally {
    await client.close();
  }
}

const filePath = process.argv[2];
if (!filePath) {
  console.error("Please provide extraction file path");
  process.exit(1);
}

ingest(filePath);
