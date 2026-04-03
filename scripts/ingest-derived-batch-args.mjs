import fs from 'fs';
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function ingestDerivedBatch() {
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  const db = client.db('shikshasathi');

  const file = process.argv[2];
  if (!file) {
    console.error('Please provide a file to ingest.');
    process.exit(1);
  }

  const questions = JSON.parse(fs.readFileSync(file, 'utf8'));

  // Ensure DB fields map correctly
  const mappedQuestions = questions.map(q => ({
    ...q,
    subject_id: q.subjectId,
    correct_answer: q.correctAnswer,
    source_kind: q.sourceKind,
    review_status: q.reviewStatus,
    derived_from_chapter_id: q.derivedFromChapterId,
    generation_run_id: q.generationRunId,
    generation_rationale: q.generationRationale,
    source_canonical_question_ids: q.sourceCanonicalQuestionIds,
    provenance: q.provenance || {
      board: 'NCERT',
      class: q.chapter?.match(/Class (\d+)/)?.[1] || '11',
      subject: q.subjectId,
      book: q.subjectId,
      chapterNumber: parseInt(q.derivedFromChapterId),
      chapterTitle: q.chapter,
    },
    created_at: new Date(),
    updated_at: new Date()
  }));

  // Clean existing from this run if any
  const runId = mappedQuestions[0]?.generation_run_id;
  if (runId) {
    await db.collection('questions').deleteMany({ generation_run_id: runId });
  }

  const result = await db.collection('questions').insertMany(mappedQuestions);
  
  console.log(`✅ Successfully ingested ${result.insertedCount} derived questions from ${file}`);

  await client.close();
}

ingestDerivedBatch().catch(console.error);