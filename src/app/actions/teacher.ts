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
