"use server";

import { getDb } from "@/lib/mongodb";
import { Question } from "@/lib/questions";
import { ObjectId } from "mongodb";

export async function getAssignmentByLinkId(linkId: string) {
  const db = await getDb();
  const assignment = await db.collection("assignments").findOne({ linkId });
  
  if (!assignment) {
    return null;
  }
  
  // Return assignment without exposing the correct answers directly to the client if possible
  // But since we pass the whole object in MVP, let's just strip correct answers for the student view.
  const sanitizedQuestions = assignment.questions.map((q: Question) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { correctAnswer, ...rest } = q;
    return rest;
  });

  return {
    id: assignment._id.toString(),
    title: assignment.title,
    classId: assignment.classId,
    dueDate: assignment.dueDate,
    totalMarks: assignment.totalMarks,
    questions: sanitizedQuestions,
  };
}

export async function submitAssignmentAction(
  assignmentId: string, 
  studentIdentity: { name: string; rollNumber: string },
  answers: Record<string, string>
) {
  const db = await getDb();
  
  // Check for duplicate submission
  const existingSubmission = await db.collection("submissions").findOne({
    assignmentId,
    studentRollNumber: studentIdentity.rollNumber
  });

  if (existingSubmission) {
    throw new Error("You have already submitted this assignment.");
  }
  
  // Re-fetch the assignment to get the correct answers securely on the server
  const assignment = await db.collection("assignments").findOne({ _id: new ObjectId(assignmentId) });

  if (!assignment) {
    throw new Error("Assignment not found");
  }

  // Auto-grade
  let score = 0;
  const gradedAnswers = assignment.questions.map((q: Question) => {
    const studentAnswer = answers[q.id] || "";
    // Basic case-insensitive matching for fill-in-blanks, exact for MCQ/TF
    let isCorrect = false;
    
    // Ensure correctAnswer is always a string for comparison if not an array
    const normalizedCorrectAnswer = Array.isArray(q.correctAnswer) 
      ? q.correctAnswer 
      : [q.correctAnswer];

    isCorrect = normalizedCorrectAnswer.some(ans => 
      ans.toLowerCase() === studentAnswer.trim().toLowerCase()
    );

    if (isCorrect) {
      score += q.marks;
    }

    return {
      questionId: q.id,
      questionText: q.text,
      studentAnswer,
      correctAnswer: q.correctAnswer,
      isCorrect,
      marksAwarded: isCorrect ? q.marks : 0,
    };
  });

  const submission = {
    assignmentId,
    studentName: studentIdentity.name,
    studentRollNumber: studentIdentity.rollNumber,
    answers: gradedAnswers,
    score,
    totalMarks: assignment.totalMarks,
    submittedAt: new Date().toISOString(),
  };

  await db.collection("submissions").insertOne(submission);

  return {
    success: true,
    score,
    totalMarks: assignment.totalMarks,
    feedback: gradedAnswers
  };
}

