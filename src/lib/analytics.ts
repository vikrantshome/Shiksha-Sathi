"use server";

import { getDb } from "./mongodb";

type EventName = 
  | "teacher_signup"
  | "class_created"
  | "assignment_published"
  | "student_assignment_started"
  | "student_assignment_submitted"
  | "teacher_result_viewed";

export async function trackEvent(
  eventName: EventName,
  payload: Record<string, string | number | boolean | null> = {}
) {
  try {
    // Fire and forget, don't block the main thread/await
    const db = await getDb();
    
    // Use an async IIFE to avoid blocking the main server action return
    (async () => {
      try {
        await db.collection("analytics_events").insertOne({
          event: eventName,
          payload,
          userAgent: "server", // We can enhance this if needed by passing headers
          timestamp: new Date().toISOString(),
        });
      } catch (err) {
        console.error("Failed to track event:", eventName, err);
      }
    })();
    
    return true;
  } catch (error) {
    // Silently fail to not disrupt user flows
    console.error("Analytics initialization error:", error);
    return false;
  }
}
