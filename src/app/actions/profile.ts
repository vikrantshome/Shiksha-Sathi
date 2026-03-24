"use server";

import { getDb } from "@/lib/mongodb";
import { cookies } from "next/headers";

export async function updateProfileAction(formData: FormData) {
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;
  
  if (!session) throw new Error("Unauthorized");

  const name = formData.get("name") as string;
  const school = formData.get("school") as string;
  const board = formData.get("board") as string;

  const db = await getDb();
  await db.collection("profiles").updateOne(
    { session },
    { $set: { name, school, board } },
    { upsert: true }
  );
  
  return { success: true };
}
