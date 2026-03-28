import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("Please provide MONGODB_URI in .env.local");
  process.exit(1);
}

const client = new MongoClient(uri);

async function publishNCERTQuestions() {
  try {
    await client.connect();
    const db = client.db('shikshasathi');
    const collection = db.collection('questions');
    
    // Update all APPROVED NCERT questions to PUBLISHED status
    const result = await collection.updateMany(
      { 
        'provenance.board': 'NCERT', 
        'review_status': 'APPROVED' 
      },
      { 
        $set: { 
          review_status: 'PUBLISHED', 
          published_at: new Date(),
          updated_at: new Date() 
        } 
      }
    );
    
    console.log(`✅ Published ${result.modifiedCount} NCERT questions`);
    
    // Verify the update
    const publishedCount = await collection.countDocuments({
      'provenance.board': 'NCERT',
      'review_status': 'PUBLISHED'
    });
    
    console.log(`Total PUBLISHED NCERT questions: ${publishedCount}`);
    
    // Show breakdown by class
    const byClass = await collection.aggregate([
      { 
        $match: { 
          'provenance.board': 'NCERT',
          'review_status': 'PUBLISHED'
        } 
      },
      { 
        $group: { 
          _id: '$provenance.class', 
          count: { $sum: 1 } 
        } 
      },
      { $sort: { _id: 1 } }
    ]).toArray();
    
    console.log('\nPublished by class:');
    byClass.forEach(c => {
      console.log(`  Class ${c._id}: ${c.count} questions`);
    });
    
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await client.close();
  }
}

publishNCERTQuestions();
