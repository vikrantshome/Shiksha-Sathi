import fs from 'fs';
import path from 'path';
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import { resolveQuestionPoints } from './lib/question-points.mjs';

// Load .env.local for MongoDB URI
dotenv.config({ path: '.env.local' });

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("Please provide MONGODB_URI in .env.local");
  process.exit(1);
}

// CLI parsing
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const canonicalOnly = args.includes('--canonical-only');
const derivedOnly = args.includes('--derived-only');
const verifyOnly = args.includes('--verify');
const force = args.includes('--force');

const client = new MongoClient(uri);

/* ──────────────────────────────────────────────────────────────────────
   Simple glob replacement using fs.readdirSync
   ────────────────────────────────────────────────────────────────────── */
function globFilesSync(pattern) {
  const [dirPart, filePattern] = pattern.split(/\/(?=[^/]*\*[^/]*$)/);
  if (!dirPart || !filePattern) return [];

  // Convert glob pattern to regex
  const regex = new RegExp('^' + filePattern.replace(/\*/g, '.*').replace(/\?/g, '.') + '$');

  try {
    const files = fs.readdirSync(dirPart)
      .filter(f => regex.test(f))
      .map(f => path.resolve(dirPart, f));
    return files;
  } catch {
    return [];
  }
}

function globDirRecursive(baseDir, pattern) {
  const results = [];
  if (!fs.existsSync(baseDir)) return results;

  const entries = fs.readdirSync(baseDir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(baseDir, entry.name);
    if (entry.isDirectory()) {
      results.push(...globDirRecursive(fullPath, pattern));
    } else if (entry.isFile()) {
      const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
      if (regex.test(entry.name)) {
        results.push(fullPath);
      }
    }
  }
  return results;
}

/* ──────────────────────────────────────────────────────────────────────
   Canonical ingestion
   ────────────────────────────────────────────────────────────────────── */
async function ingestCanonical(db, filePath) {
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const { provenance, questions } = data;
  const extractionRunId = `${provenance.class}-${provenance.subject}-${provenance.book.replace(/\s+/g, '-').toLowerCase()}-ch${provenance.chapterNumber}-v1`;
  const collection = db.collection("questions");

  // Check existing
  const existingCount = await collection.countDocuments({
    "provenance.extraction_run_id": extractionRunId
  });

  if (existingCount > 0 && !force) {
    return { skipped: existingCount, inserted: 0, file: path.basename(filePath) };
  }

  if (force && existingCount > 0) {
    await collection.deleteMany({ "provenance.extraction_run_id": extractionRunId });
  }

  const mappedQuestions = questions.map(q => ({
    ...q,
    correct_answer: q.correctAnswer ?? q.correct_answer ?? null,
    points: resolveQuestionPoints(q),
    subject_id: provenance.subject,
    chapter: `Chapter ${provenance.chapterNumber}: ${provenance.chapterTitle}`,
    provenance: { ...provenance, extraction_run_id: extractionRunId },
    review_status: "PUBLISHED",
    created_at: new Date(),
    updated_at: new Date()
  }));

  if (dryRun) {
    return { dryRun: true, count: mappedQuestions.length, file: path.basename(filePath) };
  }

  // Bulk insert in chunks
  const chunkSize = 500;
  let inserted = 0;
  for (let i = 0; i < mappedQuestions.length; i += chunkSize) {
    const chunk = mappedQuestions.slice(i, i + chunkSize);
    const result = await collection.insertMany(chunk, { ordered: false });
    inserted += result.insertedCount;
  }

  return { inserted, skipped: 0, file: path.basename(filePath) };
}

/* ──────────────────────────────────────────────────────────────────────
   Derived ingestion
   ────────────────────────────────────────────────────────────────────── */
async function ingestDerived(db, filePath) {
  const questions = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  if (!Array.isArray(questions)) {
    return { error: 'File is not an array', file: path.basename(filePath) };
  }

  const generationRunId = questions[0]?.generationRunId || questions[0]?.generation_run_id || path.basename(filePath);
  const collection = db.collection("questions");

  // Check existing
  const existingCount = await collection.countDocuments({
    generation_run_id: generationRunId
  });

  if (existingCount > 0 && !force) {
    return { skipped: existingCount, inserted: 0, file: path.basename(filePath) };
  }

  if (force && existingCount > 0) {
    await collection.deleteMany({ generation_run_id: generationRunId });
  }

  const mappedQuestions = questions.map(q => ({
    ...q,
    subject_id: q.subjectId,
    correct_answer: q.correctAnswer ?? q.correct_answer ?? null,
    source_kind: q.sourceKind,
    review_status: q.reviewStatus,
    derived_from_chapter_id: q.derivedFromChapterId,
    generation_run_id: q.generationRunId,
    generation_rationale: q.generationRationale,
    source_canonical_question_ids: q.sourceCanonicalQuestionIds,
    points: resolveQuestionPoints(q),
    provenance: q.provenance || {
      board: 'NCERT',
      class: q.chapter?.match(/Class (\d+)/)?.[1] || '11',
      subject: q.subjectId,
      book: q.subjectId,
      chapterNumber: parseInt(q.derivedFromChapterId) || 0,
      chapterTitle: q.chapter,
    },
    created_at: new Date(),
    updated_at: new Date()
  }));

  if (dryRun) {
    return { dryRun: true, count: mappedQuestions.length, file: path.basename(filePath) };
  }

  // Bulk insert in chunks
  const chunkSize = 500;
  let inserted = 0;
  for (let i = 0; i < mappedQuestions.length; i += chunkSize) {
    const chunk = mappedQuestions.slice(i, i + chunkSize);
    const result = await collection.insertMany(chunk, { ordered: false });
    inserted += result.insertedCount;
  }

  return { inserted, skipped: 0, file: path.basename(filePath) };
}

/* ──────────────────────────────────────────────────────────────────────
   Verification
   ────────────────────────────────────────────────────────────────────── */
async function verifyIngestion(db) {
  const collection = db.collection("questions");

  const canonicalCount = await collection.countDocuments({ sourceKind: "CANONICAL" });
  const derivedCount = await collection.countDocuments({ sourceKind: "DERIVED" });
  const totalCount = await collection.countDocuments({});

  // By type
  const byType = await collection.aggregate([
    { $group: { _id: { sourceKind: "$sourceKind", type: "$type" }, count: { $sum: 1 } } }
  ]).toArray();

  // Missing required fields
  const missingFields = await collection.countDocuments({
    $or: [
      { text: { $exists: false } },
      { type: { $exists: false } },
      { points: { $exists: false } },
      { provenance: { $exists: false } }
    ]
  });

  console.log('\n🔍 Verifying ingestion...\n');
  console.log(`  Canonical questions: ${canonicalCount.toLocaleString()} ${canonicalCount === 1140 ? '✅' : '❌ (expected 1,140)'}`);
  console.log(`  Derived questions:   ${derivedCount.toLocaleString()} ${derivedCount === 362 ? '✅' : '❌ (expected 362)'}`);
  console.log(`  Total:               ${totalCount.toLocaleString()} ${totalCount === 1502 ? '✅' : '❌ (expected 1,502)'}`);

  console.log('\n  By type:');
  const typeCounts = {};
  for (const item of byType) {
    const key = item._id.sourceKind || 'UNKNOWN';
    const type = item._id.type || 'UNKNOWN';
    typeCounts[`${key} ${type}`] = item.count;
  }
  for (const [key, count] of Object.entries(typeCounts).sort()) {
    console.log(`    ${key.padEnd(25)} ${count}`);
  }

  console.log(`\n  Missing required fields: ${missingFields} ${missingFields === 0 ? '✅' : '❌'}`);
  console.log('\n✅ Verification complete.');
}

/* ──────────────────────────────────────────────────────────────────────
   Main
   ────────────────────────────────────────────────────────────────────── */
async function main() {
  await client.connect();
  const db = client.db("shikshasathi");

  if (verifyOnly) {
    await verifyIngestion(db);
    await client.close();
    return;
  }

  const canonicalFiles = globFilesSync('doc/NCERT/extractions/*.json').sort();
  const derivedFilesTop = globFilesSync('doc/NCERT/derived-*.json');
  const derivedFilesSub = globDirRecursive('doc/NCERT', 'derived*.json');
  const derivedFiles = [...new Set([...derivedFilesTop, ...derivedFilesSub])].sort();

  console.log(`📋 Found ${canonicalFiles.length} canonical files, ${derivedFiles.length} derived files`);

  if (dryRun) {
    console.log('🔍 DRY RUN — no changes will be made\n');
  }

  // Process canonical
  let canonicalInserted = 0;
  let canonicalSkipped = 0;
  if (!derivedOnly) {
    for (let i = 0; i < canonicalFiles.length; i++) {
      const file = canonicalFiles[i];
      try {
        const result = await ingestCanonical(db, file);
        if (result.dryRun) {
          console.log(`[${i + 1}/${canonicalFiles.length}] 📊 Would ingest ${result.count} questions from ${result.file}`);
        } else if (result.skipped > 0) {
          console.log(`[${i + 1}/${canonicalFiles.length}] ⚠️  Skipped ${result.file}: ${result.skipped} questions already exist`);
          canonicalSkipped += result.skipped;
        } else {
          console.log(`[${i + 1}/${canonicalFiles.length}] ✅ Ingested ${result.inserted} canonical questions from ${result.file}`);
          canonicalInserted += result.inserted;
        }
      } catch (err) {
        console.log(`[${i + 1}/${canonicalFiles.length}] ❌ ERROR ${result.file}: ${err.message}`);
      }
    }
  }

  // Process derived
  let derivedInserted = 0;
  let derivedSkipped = 0;
  if (!canonicalOnly) {
    for (let i = 0; i < derivedFiles.length; i++) {
      const file = derivedFiles[i];
      try {
        const result = await ingestDerived(db, file);
        if (result.dryRun) {
          console.log(`[${i + 1}/${derivedFiles.length}] 📊 Would ingest ${result.count} questions from ${result.file}`);
        } else if (result.skipped > 0) {
          console.log(`[${i + 1}/${derivedFiles.length}] ⚠️  Skipped ${result.file}: ${result.skipped} questions already exist`);
          derivedSkipped += result.skipped;
        } else if (result.error) {
          console.log(`[${i + 1}/${derivedFiles.length}] ❌ ERROR ${result.file}: ${result.error}`);
        } else {
          console.log(`[${i + 1}/${derivedFiles.length}] ✅ Ingested ${result.inserted} derived questions from ${result.file}`);
          derivedInserted += result.inserted;
        }
      } catch (err) {
        console.log(`[${i + 1}/${derivedFiles.length}] ❌ ERROR ${path.basename(file)}: ${err.message}`);
      }
    }
  }

  // Summary
  console.log('\n✅ Ingestion complete!');
  console.log(`  Canonical: ${canonicalInserted.toLocaleString()} questions ingested (${canonicalFiles.length} files)`);
  console.log(`  Derived:   ${derivedInserted.toLocaleString()} questions ingested (${derivedFiles.length} files)`);
  console.log(`  Total:     ${(canonicalInserted + derivedInserted).toLocaleString()} questions`);
  console.log(`  Skipped:   ${(canonicalSkipped + derivedSkipped).toLocaleString()} (already existed)`);

  if (dryRun) {
    console.log('\n📊 Summary:');
    console.log(`  Canonical: ${canonicalFiles.length} files, ~1,140 questions`);
    console.log(`  Derived:   ${derivedFiles.length} files, ~362 questions`);
    console.log(`  Total:     ${canonicalFiles.length + derivedFiles.length} files, ~1,502 questions`);
    console.log('\n✅ Dry run complete. Run without --dry-run to ingest.');
  }

  await client.close();
}

main().catch(console.error);
