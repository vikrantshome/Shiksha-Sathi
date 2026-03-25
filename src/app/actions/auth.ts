"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/mongodb";

export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  
  if (!email || !password) {
    throw new Error("Email and password are required");
  }

  const db = await getDb();
  const teacher = await db.collection("teachers").findOne({ email, password });

  if (!teacher) {
    throw new Error("Invalid email or password");
  }

  const cookieStore = await cookies();
  cookieStore.set("session", teacher._id.toString(), { 
    httpOnly: true, 
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7, // 1 week
    path: "/" 
  });
  
  redirect("/teacher/dashboard");
}

export async function signupAction(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  
  if (!name || !email || !password) {
    throw new Error("Name, email, and password are required");
  }

  const db = await getDb();
  
  // Check if email already exists
  const existingTeacher = await db.collection("teachers").findOne({ email });
  if (existingTeacher) {
    throw new Error("Email already registered");
  }

  const result = await db.collection("teachers").insertOne({
    name,
    email,
    password, // Plain text for MVP as per current simplification, hashing recommended for prod
    createdAt: new Date().toISOString()
  });

  const cookieStore = await cookies();
  cookieStore.set("session", result.insertedId.toString(), { 
    httpOnly: true, 
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7, // 1 week
    path: "/" 
  });
  
  redirect("/teacher/dashboard");
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
  redirect("/login");
}
