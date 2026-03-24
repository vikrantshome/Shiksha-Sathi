"use server";

import { getDb } from "@/lib/mongodb";
import { Question } from "@/lib/questions";

export async function getAssignmentByLinkId(linkId: string) {
  const db = await getDb();
  const assignment = await db.collection("assignments").findOne({ linkId });
  
  if (!assignment) {
    return null;
  }
  
  // Return assignment without exposing the correct answers directly to the client if possible
  // But since we pass the whole object in MVP, let's just strip correct answers for the student view.
  const sanitizedQuestions = assignment.questions.map((q: Question) => {
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
  
  // Re-fetch the assignment to get the correct answers securely on the server
  const { ObjectId } = require("mongodb");
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
    
    if (Array.isArray(q.correctAnswer)) {
      isCorrect = q.correctAnswer.some(ans => ans.toLowerCase() === studentAnswer.trim().toLowerCase());
    } else {
      isCorrect = q.correctAnswer.toLowerCase() === studentAnswer.trim().toLowerCase();
    }

    if (isCorrect) {
      score += q.marks;
    }

    return {
      questionId: q.id,
      studentAnswer,
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
    totalMarks: assignment.totalMarks
  };
}
