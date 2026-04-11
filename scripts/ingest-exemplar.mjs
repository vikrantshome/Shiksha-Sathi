import fs from 'fs';
import path from 'path';
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import { resolveQuestionPoints } from './lib/question-points.mjs';

// Load .env.local for MongoDB URI
dotenv.config({ path: '.env.local' });

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('Please provide MONGODB_URI in .env.local');
  process.exit(1);
}

const client = new MongoClient(uri);

// CLI parsing
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const force = args.includes('--force');
const verifyOnly = args.includes('--verify');

// Optional filters
const classFilter = args.find(a => a.startsWith('--class='))?.split('=')[1];
const subjectFilter = args.find(a => a.startsWith('--subject='))?.split('=')[1];

const EXEMPLAR_DIR = 'doc/Exemplar';

/* ──────────────────────────────────────────────────────────────────────
   Find exemplar JSON files
   ────────────────────────────────────────────────────────────────────── */
function getExemplarFiles() {
  const files = [];
  if (!fs.existsSync(EXEMPLAR_DIR)) return files;

  const entries = fs.readdirSync(EXEMPLAR_DIR, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith('.json')) continue;

    // Skip non-chapter files
    const skipPatterns = [
      '-all.json',
      'combined',
      'image-review-report',
      'crop_coordinates',
      'required_figures_registry',
    ];
    if (skipPatterns.some(p => entry.name.includes(p))) continue;

    // Parse filename: {class}-{subject}-ch{N}.json
    const match = entry.name.match(/^(\d+)-(\w+)-ch(\d+)\.json$/);
    if (!match) continue;

    const [, cls, subject] = match;

    // Apply filters
    if (classFilter && cls !== classFilter) continue;
    if (subjectFilter && subject !== subjectFilter) continue;

    files.push(path.join(EXEMPLAR_DIR, entry.name));
  }

  return files.sort();
}

/* ──────────────────────────────────────────────────────────────────────
   Map exemplar question to MongoDB schema
   ────────────────────────────────────────────────────────────────────── */
function mapQuestion(q, extractionRunId) {
  const provenance = {
    extraction_run_id: extractionRunId,
    board: q.board || 'NCERT',
    class: String(q.class_level),
    subject: q.subject,
    book: q.book,
    chapterNumber: q.chapter_number,
    chapterTitle: q.chapter_title,
    sourceFile: q.source_file,
    pageNumbers: (q.source_pages || []).join(','),
  };

  // Map question_type to canonical type names
  const typeMap = {
    'MCQ': 'MCQ',
    'MULTIPLE_CHOICE': 'MCQ',
    'TRUE_FALSE': 'TRUE_FALSE',
    'FILL_IN_BLANKS': 'FILL_IN_BLANKS',
    'SHORT_ANSWER': 'SHORT_ANSWER',
    'LONG_ANSWER': 'LONG_ANSWER',
    'ESSAY': 'ESSAY',
  };

  const mappedType = typeMap[q.question_type] || 'SHORT_ANSWER';

  return {
    text: q.question_text,
    type: mappedType,
    options: q.options || [],
    correct_answer: q.answer_key || null,
    explanation: q.answer_explanation || null,
    points: resolveQuestionPoints({ type: mappedType }),
    source_kind: 'EXEMPLAR',
    review_status: 'PUBLISHED',
    language: q.language || 'English',
    provenance,
    question_id: q.question_id,
    difficulty: q.difficulty || null,
    blooms_level: q.blooms_level || null,
    qa_flags: q.qa_flags || [],
    review_state: q.review_state || null,
    source_pages: q.source_pages || [],
    created_at: new Date(),
    updated_at: new Date(),
  };
}

/* ──────────────────────────────────────────────────────────────────────
   Ingest a single exemplar file
   ────────────────────────────────────────────────────────────────────── */
async function ingestExemplarFile(db, filePath) {
  const basename = path.basename(filePath);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  if (!Array.isArray(data)) {
    console.warn(`  SKIP: ${basename} — not a JSON array`);
    return { skipped: 0, inserted: 0, file: basename, error: 'not_array' };
  }

  // Extract class and subject from filename for run ID
  const match = basename.match(/^(\d+)-(\w+)-ch(\d+)\.json$/);
  if (!match) {
    console.warn(`  SKIP: ${basename} — filename pattern mismatch`);
    return { skipped: 0, inserted: 0, file: basename, error: 'bad_filename' };
  }

  const [, cls, subject, chapterNum] = match;
  const extractionRunId = `exemplar-${cls}-${subject}-ch${chapterNum}-v1`;

  // Filter: only questions without images
  const imageFreeQuestions = data.filter(q => !q.image_required);
  const imageNeededCount = data.length - imageFreeQuestions.length;

  if (imageNeededCount > 0) {
    console.log(`  ${imageNeededCount} question(s) need images — excluded from ingestion`);
  }

  // Map questions
  const mappedQuestions = imageFreeQuestions.map(q => mapQuestion(q, extractionRunId));

  const collection = db.collection('questions');

  // Check existing
  const existingCount = await collection.countDocuments({
    'provenance.extraction_run_id': extractionRunId,
  });

  if (existingCount > 0 && !force) {
    return {
      skipped: existingCount,
      inserted: 0,
      file: basename,
      totalInFile: data.length,
      imageFree: imageFreeQuestions.length,
    };
  }

  if (force && existingCount > 0) {
    console.log(`  Force: deleting ${existingCount} existing documents for ${extractionRunId}`);
    await collection.deleteMany({ 'provenance.extraction_run_id': extractionRunId });
  }

  if (dryRun) {
    return {
      dryRun: true,
      count: mappedQuestions.length,
      totalInFile: data.length,
      imageFree: imageFreeQuestions.length,
      file: basename,
    };
  }

  // Bulk insert in chunks of 500
  const CHUNK_SIZE = 500;
  let inserted = 0;

  for (let i = 0; i < mappedQuestions.length; i += CHUNK_SIZE) {
    const chunk = mappedQuestions.slice(i, i + CHUNK_SIZE);
    const result = await collection.insertMany(chunk);
    inserted += result.insertedCount;
  }

  return {
    skipped: 0,
    inserted,
    file: basename,
    totalInFile: data.length,
    imageFree: imageFreeQuestions.length,
  };
}

/* ──────────────────────────────────────────────────────────────────────
   Verify ingestion
   ────────────────────────────────────────────────────────────────────── */
async function verifyIngestion(db) {
  const collection = db.collection('questions');

  const results = await collection
    .aggregate([
      { $match: { source_kind: 'EXEMPLAR' } },
      {
        $group: {
          _id: {
            class: '$provenance.class',
            subject: '$provenance.subject',
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.class': 1, '_id.subject': 1 } },
    ])
    .toArray();

  console.log('\n=== VERIFICATION: EXEMPLAR Questions in MongoDB ===\n');

  let total = 0;
  for (const r of results) {
    const { class: cls, subject } = r._id;
    console.log(`  Class ${cls} ${subject}: ${r.count} questions`);
    total += r.count;
  }

  console.log(`\n  TOTAL: ${total} EXEMPLAR questions`);

  // Also check for questions that still need images
  const needsImageCount = await collection.countDocuments({
    source_kind: 'EXEMPLAR',
    'qa_flags': 'needs_figure',
  });

  if (needsImageCount > 0) {
    console.log(`\n  WARNING: ${needsImageCount} EXEMPLAR questions still flagged as needing figures`);
  }

  return total;
}

/* ──────────────────────────────────────────────────────────────────────
   Main
   ────────────────────────────────────────────────────────────────────── */
async function main() {
  const files = getExemplarFiles();

  if (files.length === 0) {
    console.log('No exemplar files found matching filters.');
    if (classFilter || subjectFilter) {
      console.log(`  Filters: class=${classFilter || 'any'}, subject=${subjectFilter || 'any'}`);
    }
    process.exit(0);
  }

  console.log(`\nExemplar Ingestion Script`);
  console.log(`${'='.repeat(60)}`);
  console.log(`Files to process: ${files.length}`);
  if (classFilter) console.log(`Class filter: ${classFilter}`);
  if (subjectFilter) console.log(`Subject filter: ${subjectFilter}`);
  if (dryRun) console.log('Mode: DRY RUN (no writes)');
  if (force) console.log('Mode: FORCE (overwrite existing)');
  console.log('');

  await client.connect();
  const db = client.db();

  try {
    if (verifyOnly) {
      await verifyIngestion(db);
      return;
    }

    const summary = {
      totalFiles: files.length,
      totalQuestions: 0,
      totalImageFree: 0,
      totalInserted: 0,
      totalSkipped: 0,
      results: [],
    };

    for (const file of files) {
      const result = await ingestExemplarFile(db, file);
      summary.results.push(result);

      const label = result.dryRun ? 'DRY RUN' :
        result.error ? 'ERROR' :
        result.skipped > 0 ? 'SKIPPED' : 'OK';

      if (result.dryRun) {
        console.log(`  [${label}] ${result.file}: ${result.count} questions would be inserted (${result.totalInFile} total, ${result.imageFree} image-free)`);
      } else if (result.error) {
        console.log(`  [${label}] ${result.file}: ${result.error}`);
      } else {
        console.log(`  [${label}] ${result.file}: ${result.inserted} inserted, ${result.skipped} skipped (${result.totalInFile} total, ${result.imageFree} image-free)`);
      }

      summary.totalQuestions += result.totalInFile || 0;
      summary.totalImageFree += result.imageFree || 0;
      summary.totalInserted += result.inserted || 0;
      summary.totalSkipped += result.skipped || 0;
    }

    console.log(`\n${'='.repeat(60)}`);
    console.log(`SUMMARY`);
    console.log(`${'='.repeat(60)}`);
    console.log(`  Files processed:  ${summary.totalFiles}`);
    console.log(`  Total questions:  ${summary.totalQuestions}`);
    console.log(`  Image-free:       ${summary.totalImageFree}`);
    console.log(`  Inserted:         ${summary.totalInserted}`);
    console.log(`  Skipped:          ${summary.totalSkipped}`);

    // Run verification
    console.log(`\n`);
    await verifyIngestion(db);

    // Save ingestion report
    const reportPath = path.join(EXEMPLAR_DIR, 'ingestion-report.json');
    const report = {
      timestamp: new Date().toISOString(),
      mode: dryRun ? 'dry-run' : 'live',
      force,
      summary,
    };
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n  Ingestion report saved to: ${reportPath}`);

  } finally {
    await client.close();
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
