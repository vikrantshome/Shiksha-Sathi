"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { setCookie } from "cookies-next";
import { auth } from "@/lib/api/auth";

export default function LoginPage() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const response = await auth.login({ email, password });

      // Store token securely in cookies
      setCookie("auth-token", response.token, {
        maxAge: 30 * 24 * 60 * 60, // 30 days
        path: "/",
      });

      // Redirect based on role
      if (response.role === "TEACHER") {
        router.push("/teacher");
      } else {
        router.push("/dashboard");
      }
    } catch (err: unknown) {
      const error = err as { message?: string };
      setError(error.message || "Invalid credentials");
      setIsPending(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4 bg-surface">
      <div className="w-full max-w-sm p-6 sm:p-8 bg-surface-container-lowest rounded-md">
        {/* Brand + Header */}
        <div className="text-center mb-8">
          <Link
            href="/"
            className="font-display text-lg font-bold text-primary tracking-tight no-underline block mb-4"
          >
            Shiksha Sathi
          </Link>
          <h1 className="text-headline-md">Welcome Back</h1>
          <p className="text-body-sm text-on-surface-variant mt-1">
            Log in to your teacher account
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-5 p-3 bg-error-container text-error rounded-sm text-[0.8125rem]">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-5"
        >
          <div>
            <label className="text-label-md block text-on-surface-variant mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              required
              className="input-academic"
              placeholder="teacher@school.com"
            />
          </div>

          <div>
            <label className="text-label-md block text-on-surface-variant mb-1.5">
              Password
            </label>
            <input
              type="password"
              name="password"
              required
              className="input-academic"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="btn-primary w-full py-3 mt-2"
          >
            {isPending ? "Logging in…" : "Log In"}
          </button>
        </form>

        <p className="text-body-sm text-center mt-6">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="text-primary font-medium no-underline"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
