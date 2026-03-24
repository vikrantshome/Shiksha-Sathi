"use server";

import { revalidatePath } from "next/cache";
import { getDb, saveDb, Class } from "@/lib/db";
import { randomUUID } from "crypto";

export async function createClassAction(formData: FormData) {
  const name = formData.get("name") as string;
  const section = formData.get("section") as string;
  const studentCount = parseInt(formData.get("studentCount") as string, 10);

  if (!name || !section || isNaN(studentCount)) {
    throw new Error("Missing required fields");
  }

  const db = await getDb();
  const newClass: Class = {
    id: randomUUID(),
    name,
    section,
    studentCount,
    createdAt: new Date().toISOString(),
  };

  db.classes.push(newClass);
  await saveDb(db);

  revalidatePath("/teacher/classes");
}

export async function deleteClassAction(id: string) {
  const db = await getDb();
  db.classes = db.classes.filter(c => c.id !== id);
  await saveDb(db);
  revalidatePath("/teacher/classes");
}
