"use server";

import { fetchApi } from "./api/client";

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
    (async () => {
      try {
        await fetchApi("/analytics/track", {
          method: "POST",
          body: JSON.stringify({
            event: eventName,
            payload,
            userAgent: "server"
          })
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
