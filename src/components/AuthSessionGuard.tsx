"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/api/auth";

export default function AuthSessionGuard() {
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    const token = typeof window !== 'undefined' 
      ? sessionStorage.getItem('shiksha-sathi-token') 
      : null;

    if (!token) {
      return () => {
        cancelled = true;
      };
    }

    const validateSession = async () => {
      try {
        const user = await auth.getMe();

        if (cancelled) {
          return;
        }

        if (user.role === "TEACHER") {
          router.replace("/teacher/dashboard");
          return;
        }

        router.replace("/student/dashboard");
      } catch {
        // Clear sessionStorage token on auth failure
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('shiksha-sathi-token');
        }
      }
    };

    void validateSession();

    return () => {
      cancelled = true;
    };
  }, [router]);

  return null;
}
