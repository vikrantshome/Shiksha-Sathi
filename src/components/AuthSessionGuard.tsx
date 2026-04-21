"use client";

import { useEffect } from "react";
import { deleteCookie, getCookie } from "cookies-next";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/api/auth";

export default function AuthSessionGuard() {
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    const token = getCookie("auth-token");

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
        deleteCookie("auth-token", { path: "/" });
      }
    };

    void validateSession();

    return () => {
      cancelled = true;
    };
  }, [router]);

  return null;
}
