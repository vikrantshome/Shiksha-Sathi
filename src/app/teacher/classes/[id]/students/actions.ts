"use server";

import { revalidatePath } from "next/cache";
import { api } from "@/lib/api";

export async function enrollStudent(classId: string, data: { name: string; phone: string; birthDate: string; rollNumber?: string }) {
  if (!data.name?.trim()) {
    return { error: "Student name is required" };
  }
  if (!data.phone || data.phone.trim().length !== 10) {
    return { error: "Valid 10-digit phone number is required" };
  }
  if (!data.birthDate || !/^\d{2}-\d{2}-\d{4}$/.test(data.birthDate)) {
    return { error: "Birth date must be in DD-MM-YYYY format" };
  }

  try {
    await api.classes.enrollStudent(classId, data);
  } catch (error) {
    const err = error as { message?: string };
    console.error("Failed to enroll student:", error);
    return { error: err.message || "Failed to enroll student" };
  }

  revalidatePath(`/teacher/classes/${classId}/students`);
  return { success: true };
}

export async function removeStudent(classId: string, studentId: string) {
  if (!studentId) {
    return { error: "Invalid student ID" };
  }

  try {
    await api.classes.removeStudent(classId, studentId);
  } catch (error) {
    console.error("Failed to remove student:", error);
    return { error: "Failed to remove student" };
  }

  revalidatePath(`/teacher/classes/${classId}/students`);
  return { success: true };
}
