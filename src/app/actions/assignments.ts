"use server";

import { getDb } from "@/lib/mongodb";
import { Question } from "@/lib/questions";
import { randomBytes } from "crypto";

export async function publishAssignmentAction(formData: FormData, questions: Question[]) {
  const title = formData.get("title") as string;
  const classId = formData.get("classId") as string;
  const dueDate = formData.get("dueDate") as string;

  if (!title || !classId || questions.length === 0) {
    throw new Error("Missing required fields or no questions selected.");
  }

  const db = await getDb();
  
  // Generate a short unique URL path for the student link
  const linkId = randomBytes(4).toString("hex");

  const newAssignment = {
    title,
    classId,
    dueDate: dueDate || null,
    questions,
    totalMarks: questions.reduce((acc, q) => acc + q.marks, 0),
    linkId,
    createdAt: new Date().toISOString(),
    status: "published"
  };

  const result = await db.collection("assignments").insertOne(newAssignment);
  
  // Track successful assignment publish
  import("@/lib/analytics").then(({ trackEvent }) => {
    trackEvent("assignment_published", { 
      assignmentId: result.insertedId.toString(), 
      title, 
      classId, 
      questionCount: questions.length 
    });
  });

  return {
    success: true,
    assignmentId: result.insertedId.toString(),
    linkId
  };
}
