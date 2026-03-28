import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function checkChapters() {
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  const db = client.db('shikshasathi');
  
  // Check actual document structure
  const sample = await db.collection('questions').findOne();
  console.log('\n=== SAMPLE QUESTION DOCUMENT ===\n');
  console.log(JSON.stringify(sample, null, 2));
  
  // Count by class using correct field path
  const classCounts = await db.collection('questions').aggregate([
    { $group: { 
      _id: '$provenance.class',
      count: { $sum: 1 }
    }},
    { $sort: { _id: 1 } }
  ]).toArray();
  
  console.log('\n=== QUESTIONS BY CLASS ===\n');
  classCounts.forEach(c => {
    console.log(`Class ${c._id}: ${c.count} questions`);
  });
  
  // Count unique chapters
  const chapters = await db.collection('questions').aggregate([
    { $group: { 
      _id: { 
        class: '$provenance.class',
        chapter: '$chapter'
      },
      count: { $sum: 1 }
    }}
  ]).toArray();
  
  console.log('\n=== UNIQUE CHAPTERS ===\n');
  console.log('Total unique chapters:', chapters.length);
  
  await client.close();
}

checkChapters().catch(console.error);
