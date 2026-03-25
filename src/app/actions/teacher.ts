"use server";

import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { Question, GradedAnswer } from "@/lib/questions";

export async function getAssignmentsWithStats() {
  const db = await getDb();
  
  // Fetch assignments (in a real app, filter by teacherId)
  const assignmentsData = await db.collection("assignments").find({}).sort({ createdAt: -1 }).toArray();
  
  const results = [];
  
  for (const assignment of assignmentsData) {
    const submissions = await db.collection("submissions").find({ assignmentId: assignment._id.toString() }).toArray();
    
    // Attempt to get class details for display
    let className = "Unknown Class";
    if (assignment.classId) {
      const cls = await db.collection("classes").findOne({ _id: new ObjectId(assignment.classId) });
      if (cls) className = `${cls.name} (${cls.section})`;
    }

    const completionCount = submissions.length;
    const averageScore = completionCount > 0 
      ? submissions.reduce((acc, sub) => acc + sub.score, 0) / completionCount 
      : 0;

    results.push({
      id: assignment._id.toString(),
      title: assignment.title,
      className,
      dueDate: assignment.dueDate,
      totalMarks: assignment.totalMarks,
      linkId: assignment.linkId,
      createdAt: assignment.createdAt,
      stats: {
        completionCount,
        averageScore: Number(averageScore.toFixed(1))
      }
    });
  }

  return results;
}

export async function getAssignmentReport(assignmentId: string) {
  const db = await getDb();
  
  const assignment = await db.collection("assignments").findOne({ _id: new ObjectId(assignmentId) });
  if (!assignment) return null;

  const submissionsData = await db.collection("submissions").find({ assignmentId }).sort({ submittedAt: -1 }).toArray();
  
  const submissions = submissionsData.map(sub => ({
    id: sub._id.toString(),
    studentName: sub.studentName,
    studentRollNumber: sub.studentRollNumber,
    score: sub.score,
    totalMarks: sub.totalMarks,
    submittedAt: sub.submittedAt,
    answers: sub.answers as GradedAnswer[]
  }));

  // Calculate question-level stats
  const questionStats = assignment.questions.map((q: Question) => {
    let correctCount = 0;
    submissions.forEach(sub => {
      const ans = sub.answers.find((a: GradedAnswer) => a.questionId === q.id);
      if (ans && ans.isCorrect) correctCount++;
    });

    return {
      questionId: q.id,
      text: q.text,
      topic: q.topic,
      marks: q.marks,
      correctPercentage: submissions.length > 0 ? Math.round((correctCount / submissions.length) * 100) : 0
    };
  });

  // Track that a teacher inspected this report
  import("@/lib/analytics").then(({ trackEvent }) => {
    trackEvent("teacher_result_viewed", { assignmentId, submissionCount: submissions.length });
  });

  return {
    assignment: {
      id: assignment._id.toString(),
      title: assignment.title,
      totalMarks: assignment.totalMarks,
      linkId: assignment.linkId
    },
    submissions,
    questionStats
  };
}

export async function getDistinctSubjects(): Promise<string[]> {
  const db = await getDb();
  return await db.collection("questions").distinct("subject");
}

export async function getDistinctChapters(subject: string | null): Promise<string[]> {
  if (!subject) return [];
  const db = await getDb();
  return await db.collection("questions").distinct("chapter", { subject });
}

export async function getQuestions(filters: { 
  subject: string | null; 
  chapter: string | null; 
  q: string | null; 
  type: string | null; 
}): Promise<Question[]> {
  const db = await getDb();
  
  const query: Record<string, unknown> = {};
  if (filters.subject) query.subject = filters.subject;
  if (filters.chapter) query.chapter = filters.chapter;
  if (filters.type && filters.type !== "ALL") query.type = filters.type;
  
  if (filters.q) {
    query.$or = [
      { text: { $regex: filters.q, $options: "i" } },
      { topic: { $regex: filters.q, $options: "i" } }
    ];
  }
  
  const docs = await db.collection("questions").find(query).toArray();
  
  return docs.map(doc => ({
    id: doc.id || doc._id.toString(),
    subject: doc.subject,
    grade: doc.grade,
    chapter: doc.chapter,
    topic: doc.topic,
    type: doc.type,
    text: doc.text,
    options: doc.options,
    correctAnswer: doc.correctAnswer,
    marks: doc.marks
  }));
}
