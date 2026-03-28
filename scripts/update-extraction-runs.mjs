import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const client = new MongoClient(uri);

async function updateExistingQuestions() {
  try {
    await client.connect();
    const db = client.db("shikshasathi");
    const collection = db.collection("questions");

    // Find all questions with generic extraction_run_id
    const questions = await collection.find({
      "provenance.extraction_run_id": "initial-v1"
    }).toArray();

    console.log(`Found ${questions.length} questions to update...`);

    let updated = 0;
    for (const q of questions) {
      if (q.provenance && q.provenance.class && q.provenance.subject && q.provenance.book) {
        const chapterNum = q.provenance.chapterNumber || 1;
        const bookSlug = q.provenance.book.replace(/\s+/g, '-').toLowerCase();
        const extractionRunId = `${q.provenance.class}-${q.provenance.subject}-${bookSlug}-ch${chapterNum}-v1`;
        
        await collection.updateOne(
          { _id: q._id },
          {
            $set: {
              "provenance.extraction_run_id": extractionRunId,
              "review_status": "PENDING", // SSA-210: Require review before publishing
              updated_at: new Date()
            }
          }
        );
        updated++;
      }
    }

    console.log(`✅ Updated ${updated} questions with proper extraction_run_id and PENDING status`);

    // Verify all questions now have proper extraction_run_id
    const remaining = await collection.countDocuments({
      "provenance.extraction_run_id": "initial-v1"
    });
    
    console.log(`Remaining with generic extraction_run_id: ${remaining}`);
    
    // Count questions by review status
    const pendingCount = await collection.countDocuments({ review_status: "PENDING" });
    const approvedCount = await collection.countDocuments({ review_status: "APPROVED" });
    
    console.log(`Review status breakdown: PENDING=${pendingCount}, APPROVED=${approvedCount}`);
    console.log('✅ SSA-200 (versioning) and SSA-210 (review workflow) enforcement complete');

  } catch (error) {
    console.error("Error:", error);
  } finally {
    await client.close();
  }
}

updateExistingQuestions();
