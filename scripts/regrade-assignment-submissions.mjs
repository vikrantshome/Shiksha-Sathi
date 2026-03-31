import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('Please provide MONGODB_URI in .env.local');
  process.exit(1);
}

const DRY_RUN = process.argv.includes('--dry-run');

function normalizeAnswer(answer) {
  if (answer == null) {
    return '';
  }

  return String(answer)
    .normalize('NFKC')
    .toLowerCase()
    .trim()
    .replace(/[\p{P}\p{S}]+/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function scoreSubmission(submission, assignment, questionMap) {
  let score = 0;

  for (const questionId of assignment.question_ids ?? []) {
    const question = questionMap.get(questionId);
    if (!question) {
      continue;
    }

    const studentAnswer = normalizeAnswer(submission.answers?.[questionId]);
    const correctAnswer = normalizeAnswer(question.correct_answer ?? question.correctAnswer);
    const points = Number.isFinite(question.points) ? question.points : 0;

    if (studentAnswer && correctAnswer && studentAnswer === correctAnswer) {
      score += points;
    }
  }

  return score;
}

async function run() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db('shikshasathi');
    const submissions = db.collection('assignment_submissions');
    const assignments = db.collection('assignments');
    const questions = db.collection('questions');

    const assignmentDocs = await assignments.find({}).toArray();
    const questionDocs = await questions.find({}).toArray();
    const questionMap = new Map(questionDocs.map((question) => [String(question._id), question]));

    let scanned = 0;
    let updated = 0;

    for (const assignment of assignmentDocs) {
      const submissionDocs = await submissions.find({ assignment_id: String(assignment._id) }).toArray();

      for (const submission of submissionDocs) {
        scanned += 1;

        const nextScore = scoreSubmission(submission, assignment, questionMap);
        const nextRollNumber = submission.student_roll_number ?? submission.student_id ?? null;
        const nextStudentName = submission.student_name ?? (nextRollNumber ? `Student ${nextRollNumber}` : null);
        const nextStatus = 'GRADED';

        const needsUpdate =
          submission.score !== nextScore ||
          submission.student_roll_number !== nextRollNumber ||
          submission.student_name !== nextStudentName ||
          submission.status !== nextStatus;

        if (!needsUpdate) {
          continue;
        }

        updated += 1;

        if (!DRY_RUN) {
          await submissions.updateOne(
            { _id: submission._id },
            {
              $set: {
                score: nextScore,
                student_roll_number: nextRollNumber,
                student_name: nextStudentName,
                status: nextStatus,
                updated_at: new Date(),
              },
            }
          );
        }
      }
    }

    console.log(`Mode: ${DRY_RUN ? 'dry-run' : 'write'}`);
    console.log(`Submissions scanned: ${scanned}`);
    console.log(`Submissions ${DRY_RUN ? 'that would be updated' : 'updated'}: ${updated}`);
  } catch (error) {
    console.error('Error while regrading submissions:', error);
    process.exitCode = 1;
  } finally {
    await client.close();
  }
}

run();
