"use server";

import { revalidatePath } from "next/cache";
import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function createClassAction(formData: FormData) {
  const name = formData.get("name") as string;
  const section = formData.get("section") as string;
  const studentCount = parseInt(formData.get("studentCount") as string, 10);

  if (!name || !section || isNaN(studentCount)) {
    throw new Error("Missing required fields");
  }

  const db = await getDb();
  await db.collection("classes").insertOne({
    name,
    section,
    studentCount,
    archived: false,
    createdAt: new Date().toISOString(),
  });

  revalidatePath("/teacher/classes");
}

export async function deleteClassAction(id: string) {
  const db = await getDb();
  await db.collection("classes").deleteOne({ _id: new ObjectId(id) });
  revalidatePath("/teacher/classes");
}

export async function archiveClassAction(id: string) {
  const db = await getDb();
  await db.collection("classes").updateOne(
    { _id: new ObjectId(id) },
    { $set: { archived: true } }
  );
  revalidatePath("/teacher/classes");
}
