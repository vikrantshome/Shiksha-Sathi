import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("Please provide MONGODB_URI in .env.local");
  process.exit(1);
}

const client = new MongoClient(uri);

async function approveNCERTQuestions() {
  try {
    await client.connect();
    const db = client.db('shikshasathi');
    const collection = db.collection('questions');
    
    // Update all NCERT questions to APPROVED status
    const result = await collection.updateMany(
      { 'provenance.board': 'NCERT', 'review_status': 'PENDING' },
      { $set: { review_status: 'APPROVED', updated_at: new Date() } }
    );
    
    console.log(`✅ Approved ${result.modifiedCount} NCERT questions`);
    
    // Verify the update
    const approvedCount = await collection.countDocuments({
      'provenance.board': 'NCERT',
      'review_status': 'APPROVED'
    });
    
    console.log(`Total APPROVED NCERT questions: ${approvedCount}`);
    
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await client.close();
  }
}

approveNCERTQuestions();
