"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { setCookie } from "cookies-next";
import { auth } from "@/lib/api/auth";

export default function SignupPage() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const password = formData.get("password") as string;

    try {
      const response = await auth.signup({
        name,
        email,
        phone,
        password,
        role: "TEACHER", // Defaulting to TEACHER for now
      });

      // Store token securely in cookies
      setCookie("auth-token", response.token, {
        maxAge: 30 * 24 * 60 * 60, // 30 days
        path: "/",
      });

      router.push("/teacher");
    } catch (err: unknown) {
      const error = err as { message?: string };
      setError(error.message || "Something went wrong. Please try again.");
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
          <h1 className="text-headline-md">Create Account</h1>
          <p className="text-body-sm text-on-surface-variant mt-1">
            Join Shiksha Sathi for free
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
          className="flex flex-col gap-4"
        >
          <div>
            <label className="text-label-md block text-on-surface-variant mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              required
              className="input-academic"
              placeholder="Dr. Ramesh Sharma"
            />
          </div>

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
              Phone Number
            </label>
            <input
              type="tel"
              name="phone"
              required
              className="input-academic"
              placeholder="+91 9876543210"
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
            {isPending ? "Creating account…" : "Sign Up"}
          </button>
        </form>

        <p className="text-body-sm text-center mt-6">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-primary font-medium no-underline"
          >
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
