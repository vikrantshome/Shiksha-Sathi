import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const client = new MongoClient(uri);

async function updateReviewStatus() {
  try {
    await client.connect();
    const db = client.db("shikshasathi");
    const collection = db.collection("questions");

    // Update all APPROVED questions to PENDING (require review before publishing)
    const result = await collection.updateMany(
      { review_status: "APPROVED" },
      { 
        $set: { 
          review_status: "PENDING",
          updated_at: new Date()
        } 
      }
    );

    console.log(`✅ Updated ${result.modifiedCount} questions from APPROVED to PENDING`);
    
    // Verify counts
    const pendingCount = await collection.countDocuments({ review_status: "PENDING" });
    const approvedCount = await collection.countDocuments({ review_status: "APPROVED" });
    
    console.log(`Review status breakdown: PENDING=${pendingCount}, APPROVED=${approvedCount}`);
    console.log('✅ SSA-210 (review workflow) enforcement complete - all questions now require review');

  } catch (error) {
    console.error("Error:", error);
  } finally {
    await client.close();
  }
}

updateReviewStatus();
