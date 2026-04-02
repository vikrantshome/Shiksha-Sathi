import fs from 'fs';
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function generateCoverageLedger() {
  // Read registry
  const registry = JSON.parse(fs.readFileSync('doc/NCERT/registry.json', 'utf8'));
  
  // Get existing extraction files
  const extractionFiles = fs.readdirSync('doc/NCERT/extractions/')
    .filter(f => f.endsWith('.json'))
    .map(f => {
      try {
        const d = JSON.parse(fs.readFileSync('doc/NCERT/extractions/' + f, 'utf8'));
        return { file: f, sourceFile: d.provenance.sourceFile };
      } catch (e) {
        return null;
      }
    })
    .filter(f => f !== null && f.sourceFile);
  
  // Connect to MongoDB to check ingestion status
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  const db = client.db('shikshasathi');
  
  // Get ingested chapters grouped by sourceFile
  const ingestedChapters = await db.collection('questions').aggregate([
    { $match: { 'provenance.board': 'NCERT', 'provenance.sourceFile': { $ne: null } } },
    { $group: { 
      _id: '$provenance.sourceFile',
      count: { $sum: 1 },
      extractionRunId: { $first: '$provenance.extraction_run_id' },
      reviewStatus: { $first: '$review_status' },
      className: { $first: '$provenance.class' },
      subject: { $first: '$provenance.subject' },
      book: { $first: '$provenance.book' },
      chapterTitle: { $first: '$provenance.chapterTitle' }
    }}
  ]).toArray();

  const ingestedMap = new Map();
  for (const item of ingestedChapters) {
    ingestedMap.set(item._id, item);
  }
  
  // Build coverage ledger
  const ledger = {
    board: 'NCERT',
    generatedAt: new Date().toISOString(),
    totalRegisteredChapters: 0,
    totalExtractedChapters: 0,
    totalIngestedChapters: 0,
    totalPublishedChapters: 0,
    classes: {}
  };

  function processChapter(chapter, bookTitle) {
    ledger.totalRegisteredChapters++;
    const sourceFile = chapter.file;
    const extraction = extractionFiles.find(e => e.sourceFile === sourceFile);
    const ingested = ingestedMap.get(sourceFile);
    
    const chapterLedger = {
      number: chapter.number,
      title: ingested && ingested.chapterTitle ? ingested.chapterTitle : (chapter.title || `Chapter ${chapter.number}`),
      file: sourceFile,
      registryStatus: 'registered',
      extractionFile: extraction ? extraction.file : null,
      extractionStatus: extraction ? 'extracted' : 'pending',
      ingestionStatus: ingested ? 'ingested' : 'pending',
      reviewStatus: ingested ? ingested.reviewStatus || 'PENDING' : null,
      publishStatus: ingested && ingested.reviewStatus === 'PUBLISHED' ? 'published' : 'pending',
      extractionRunId: ingested ? ingested.extractionRunId : null,
      questionCount: ingested ? ingested.count : 0,
      lastValidatedAt: new Date().toISOString()
    };
    
    if (extraction) ledger.totalExtractedChapters++;
    if (ingested) ledger.totalIngestedChapters++;
    if (ingested && ingested.reviewStatus === 'PUBLISHED') ledger.totalPublishedChapters++;
    
    return chapterLedger;
  }
  
  // Process registry
  for (const [className, classData] of Object.entries(registry.classes)) {
    ledger.classes[className] = { subjects: {} };
    
    for (const [subjectName, subjectData] of Object.entries(classData.subjects)) {
      ledger.classes[className].subjects[subjectName] = { books: [] };
      
      if (Array.isArray(subjectData.chapters)) {
        const bookTitle = `${subjectName} ${className}`;
        const bookLedger = {
          title: bookTitle,
          chapters: []
        };
        for (const chapter of subjectData.chapters) {
          bookLedger.chapters.push(processChapter(chapter, bookTitle));
        }
        ledger.classes[className].subjects[subjectName].books.push(bookLedger);
      } else if (subjectData.books && Array.isArray(subjectData.books)) {
        for (const book of subjectData.books) {
          const bookLedger = {
            title: book.title || `${subjectName} ${className}`,
            chapters: []
          };
          for (const chapter of book.chapters || []) {
            bookLedger.chapters.push(processChapter(chapter, bookLedger.title));
          }
          ledger.classes[className].subjects[subjectName].books.push(bookLedger);
        }
      }
    }
  }
  
  // Write ledger
  fs.writeFileSync('doc/NCERT/coverage-ledger.json', JSON.stringify(ledger, null, 2));
  
  console.log('\n=== COVERAGE LEDGER GENERATED ===\n');
  console.log('Total registered chapters:', ledger.totalRegisteredChapters);
  console.log('Total extracted chapters:', ledger.totalExtractedChapters);
  console.log('Total ingested chapters:', ledger.totalIngestedChapters);
  console.log('Total published chapters:', ledger.totalPublishedChapters);
  console.log('\nCoverage:');
  console.log(`  Extraction: ${Math.round(ledger.totalExtractedChapters / ledger.totalRegisteredChapters * 100)}%`);
  console.log(`  Ingestion: ${Math.round(ledger.totalIngestedChapters / ledger.totalRegisteredChapters * 100)}%`);
  console.log(`  Published: ${Math.round(ledger.totalPublishedChapters / ledger.totalRegisteredChapters * 100)}%`);
  console.log('\nOutput: doc/NCERT/coverage-ledger.json');
  
  await client.close();
}

generateCoverageLedger().catch(console.error);
