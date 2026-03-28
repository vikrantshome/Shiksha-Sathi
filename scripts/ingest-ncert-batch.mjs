import fs from 'fs';
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const PUBLISH = args.includes('--publish');

async function ingestBatch() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('❌ MONGODB_URI not found in .env.local');
    process.exit(1);
  }
  
  // Get all extraction files
  const extractionFiles = fs.readdirSync('doc/NCERT/extractions/')
    .filter(f => f.endsWith('.json'))
    .map(f => `doc/NCERT/extractions/${f}`);
  
  console.log(`\n=== NCERT BATCH INGESTION ===\n`);
  console.log(`Mode: ${DRY_RUN ? 'DRY RUN (no writes)' : 'PRODUCTION'}`);
  console.log(`Files to process: ${extractionFiles.length}`);
  console.log('');
  
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('shikshasathi');
  const collection = db.collection('questions');
  
  let totalIngested = 0;
  let totalSkipped = 0;
  let totalErrors = 0;
  const report = {
    startedAt: new Date().toISOString(),
    completedAt: null,
    mode: DRY_RUN ? 'dry-run' : 'production',
    filesProcessed: 0,
    questionsIngested: 0,
    questionsSkipped: 0,
    errors: []
  };
  
  for (const file of extractionFiles) {
    try {
      const data = JSON.parse(fs.readFileSync(file, 'utf8'));
      const { provenance, questions } = data;
      
      // Generate extraction run ID
      const extractionRunId = `${provenance.class}-${provenance.subject}-${provenance.book.replace(/\s+/g, '-').toLowerCase()}-ch${provenance.chapterNumber}-v1`;
      
      // Check for duplicates
      const existingCount = await collection.countDocuments({
        'provenance.extraction_run_id': extractionRunId
      });
      
      if (existingCount > 0) {
        console.log(`⏭️  SKIP: ${file} (already ingested as ${extractionRunId})`);
        totalSkipped++;
        report.questionsSkipped += questions.length;
        continue;
      }
      
      // Map questions
      const mappedQuestions = questions.map(q => ({
        ...q,
        subject_id: provenance.subject,
        chapter: `Chapter ${provenance.chapterNumber}: ${provenance.chapterTitle}`,
        provenance: {
          ...provenance,
          extraction_run_id: extractionRunId
        },
        review_status: PUBLISH ? 'PUBLISHED' : 'PENDING',
        created_at: new Date(),
        updated_at: new Date()
      }));
      
      if (DRY_RUN) {
        console.log(`✅ DRY-RUN: ${file} (${questions.length} questions, would ingest as ${extractionRunId})`);
        totalIngested += questions.length;
        report.questionsIngested += questions.length;
      } else {
        const result = await collection.insertMany(mappedQuestions);
        console.log(`✅ INGESTED: ${file} (${result.insertedCount} questions as ${extractionRunId})`);
        totalIngested += result.insertedCount;
        report.questionsIngested += result.insertedCount;
      }
      
      report.filesProcessed++;
      
    } catch (error) {
      console.error(`❌ ERROR: ${file} - ${error.message}`);
      totalErrors++;
      report.errors.push({ file, error: error.message });
    }
  }
  
  report.completedAt = new Date().toISOString();
  
  // Write report
  fs.writeFileSync(
    `doc/NCERT/ingestion-report-${DRY_RUN ? 'dry-run' : 'production'}-${Date.now()}.json`,
    JSON.stringify(report, null, 2)
  );
  
  console.log('\n=== INGESTION SUMMARY ===\n');
  console.log(`Files processed: ${report.filesProcessed}/${extractionFiles.length}`);
  console.log(`Questions ingested: ${totalIngested}`);
  console.log(`Questions skipped: ${totalSkipped}`);
  console.log(`Errors: ${totalErrors}`);
  console.log(`\nReport saved to: doc/NCERT/ingestion-report-${DRY_RUN ? 'dry-run' : 'production'}-${Date.now()}.json`);
  
  await client.close();
  
  if (totalErrors > 0) {
    process.exit(1);
  }
}

ingestBatch().catch(console.error);
