import fs from 'fs';
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("Please provide MONGODB_URI");
  process.exit(1);
}

const client = new MongoClient(uri);

async function ingest(filePath) {
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const { provenance, questions } = data;

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
        extraction_run_id: "initial-v1" // Mock ID for now
      },
      review_status: "APPROVED", // Auto-approving for this phase
      created_at: new Date(),
      updated_at: new Date()
    }));

    // In a real scenario, we'd check for existing questions from the same extraction run/chapter
    const result = await collection.insertMany(mappedQuestions);
    console.log(`Ingested ${result.insertedCount} questions from ${filePath}`);
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
