import fs from 'fs';
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

// Load .env.local for MongoDB URI
dotenv.config({ path: '.env.local' });

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const client = new MongoClient(uri);

async function updateRegistry() {
  try {
    await client.connect();
    const db = client.db("shikshasathi");
    const collection = db.collection("questions");
    
    // Read registry
    const registry = JSON.parse(fs.readFileSync('doc/NCERT/registry.json', 'utf8'));
    
    // Get unique chapter titles from database
    const chapters = await collection.aggregate([
      { $match: { "provenance.board": "NCERT" } },
      { 
        $group: { 
          _id: { 
            class: "$provenance.class", 
            subject: "$provenance.subject",
            book: "$provenance.book",
            chapterNumber: "$provenance.chapterNumber"
          },
          chapterTitle: { $first: "$provenance.chapterTitle" }
        } 
      }
    ]).toArray();
    
    console.log(`Found ${chapters.length} unique chapters in database`);
    
    let updated = 0;
    let totalPlaceholders = 0;
    
    // Update registry with actual chapter titles - handle all structures
    for (const [className, classData] of Object.entries(registry.classes)) {
      for (const [subjectName, subjectData] of Object.entries(classData.subjects)) {
        if (Array.isArray(subjectData.chapters)) {
          // Direct chapters array (Class 6-8)
          for (const chapter of subjectData.chapters) {
            if (chapter.title && chapter.title.startsWith('Chapter ')) {
              totalPlaceholders++;
              const match = chapters.find(c => 
                c._id.class === className &&
                c._id.subject.toLowerCase() === subjectName.toLowerCase() &&
                c._id.chapterNumber === chapter.number
              );
              
              if (match) {
                chapter.title = match.chapterTitle;
                updated++;
              }
            }
          }
        } else if (subjectData.books && Array.isArray(subjectData.books)) {
          // Nested books structure (Class 9-12)
          for (const book of subjectData.books) {
            if (book.chapters && Array.isArray(book.chapters)) {
              for (const chapter of book.chapters) {
                if (chapter.title && chapter.title.startsWith('Chapter ')) {
                  totalPlaceholders++;
                  const match = chapters.find(c => 
                    c._id.class === className &&
                    c._id.subject.toLowerCase() === subjectName.toLowerCase() &&
                    c._id.book.toLowerCase() === book.title.toLowerCase() &&
                    c._id.chapterNumber === chapter.number
                  );
                  
                  if (match) {
                    chapter.title = match.chapterTitle;
                    updated++;
                  }
                }
              }
            }
          }
        }
      }
    }
    
    // Write updated registry
    fs.writeFileSync('doc/NCERT/registry-updated.json', JSON.stringify(registry, null, 2));
    
    console.log(`✅ Updated ${updated} chapter titles in registry`);
    console.log(`📊 Total placeholders found: ${totalPlaceholders}`);
    console.log(`📊 Updated: ${updated}/${totalPlaceholders} (${Math.round(updated/totalPlaceholders*100)}%)`);
    console.log('Output: doc/NCERT/registry-updated.json');
    
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await client.close();
  }
}

updateRegistry();
