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
      const match = f.match(/class(\d+)-([^-]+)-ch(\d+)-v(\d+)\.json/);
      if (match) {
        return {
          file: f,
          class: match[1],
          subject: match[2],
          chapter: parseInt(match[3]),
          version: parseInt(match[4])
        };
      }
      return null;
    })
    .filter(f => f !== null);
  
  // Connect to MongoDB to check ingestion status
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  const db = client.db('shikshasathi');
  
  // Get ingested chapters
  const ingestedChapters = await db.collection('questions').aggregate([
    { $match: { 'provenance.board': 'NCERT' } },
    { $group: { 
      _id: { 
        class: '$provenance.class',
        subject: '$provenance.subject',
        book: '$provenance.book',
        chapterNumber: '$provenance.chapterNumber'
      },
      count: { $sum: 1 },
      extractionRunId: { $first: '$provenance.extraction_run_id' },
      reviewStatus: { $first: '$review_status' }
    }}
  ]).toArray();
  
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
  
  // Process registry
  for (const [className, classData] of Object.entries(registry.classes)) {
    ledger.classes[className] = { subjects: {} };
    
    for (const [subjectName, subjectData] of Object.entries(classData.subjects)) {
      ledger.classes[className].subjects[subjectName] = { books: [] };
      
      if (Array.isArray(subjectData.chapters)) {
        // Direct chapters (Class 6-8)
        const bookTitle = `${subjectName} ${className}`;
        const bookLedger = {
          title: bookTitle,
          chapters: []
        };
        
        for (const chapter of subjectData.chapters) {
          ledger.totalRegisteredChapters++;
          
          // Check if extraction file exists
          const extraction = extractionFiles.find(e => 
            e.class === className && 
            e.subject === subjectName && 
            e.chapter === chapter.number
          );
          
          // Check if ingested
          const ingested = ingestedChapters.find(i =>
            i._id.class === className &&
            i._id.subject.toLowerCase() === subjectName.toLowerCase() &&
            i._id.chapterNumber === chapter.number
          );
          
          const chapterLedger = {
            number: chapter.number,
            title: chapter.title || `Chapter ${chapter.number}`,
            file: chapter.file,
            registryStatus: 'registered',
            extractionFile: extraction ? extraction.file : null,
            extractionStatus: extraction ? 'extracted' : 'pending',
            ingestionStatus: ingested ? 'ingested' : 'pending',
            reviewStatus: ingested ? ingested.reviewStatus || 'PENDING' : null,
            publishStatus: ingested && ingested.reviewStatus === 'PUBLISHED' ? 'published' : 'pending',
            extractionRunId: ingested ? ingested.extractionRunId : null,
            questionCount: ingested ? ingested.count : 0,
            lastValidatedAt: null
          };
          
          if (extraction) ledger.totalExtractedChapters++;
          if (ingested) ledger.totalIngestedChapters++;
          if (ingested && ingested.reviewStatus === 'PUBLISHED') ledger.totalPublishedChapters++;
          
          bookLedger.chapters.push(chapterLedger);
        }
        
        ledger.classes[className].subjects[subjectName].books.push(bookLedger);
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
