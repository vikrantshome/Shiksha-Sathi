"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { setCookie } from "cookies-next";
import { auth } from "@/lib/api/auth";
import AuthShell from "@/components/AuthShell";
import Loader from "@/components/Loader";

export default function StudentLoginPage() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const phone = formData.get("phone") as string;
    const password = formData.get("password") as string;

    try {
      const response = await auth.login({
        phone: phone.replace(/\D/g, ""),
        password,
      });

      setCookie("auth-token", response.token, {
        maxAge: 30 * 24 * 60 * 60,
        path: "/",
      });

      router.push("/student/dashboard");
    } catch (err: unknown) {
      const apiError = err as { message?: string };
      setError(apiError.message || "Invalid credentials. Please try again.");
      setIsPending(false);
      return;
    }

    setIsPending(false);
  };

  return (
    <AuthShell
      eyebrow="Welcome Back"
      title="Student Sign In"
      description="Sign in to access your assignments, submit answers, and track your academic progress."
      alternatePrompt="Don't have an account?"
      alternateHref="/signup"
      alternateLabel="Create one now"
      legalNote={
        <>
          By signing in, you agree to Shiksha Sathi&apos;s{" "}
          <a href="#" className="font-semibold text-primary underline decoration-primary/30 underline-offset-2 transition-colors hover:text-primary-dim hover:decoration-primary">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="#" className="font-semibold text-primary underline decoration-primary/30 underline-offset-2 transition-colors hover:text-primary-dim hover:decoration-primary">
            Privacy Policy
          </a>
          .
        </>
      }
    >
      {error ? (
        <div className="mb-6 rounded-md bg-error/10 p-4 text-sm text-error">
          {error}
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="grid gap-8">
        {/* Phone Number */}
        <div className="group relative">
          <label
            htmlFor="student-login-phone"
            className="mb-2 block text-xs font-semibold tracking-wider text-on-surface-variant uppercase transition-colors group-focus-within:text-primary"
          >
            Phone Number
          </label>
          <input
            id="student-login-phone"
            type="tel"
            name="phone"
            required
            placeholder="e.g. 9876543210"
            maxLength={10}
            pattern="\d{10}"
            className="w-full border-0 border-b border-outline-variant bg-surface-container-highest py-3 text-base text-on-surface transition-colors placeholder:text-on-surface-variant/50 focus:border-primary focus:outline-none focus:ring-0"
          />
        </div>

        {/* Password */}
        <div className="group relative">
          <label
            htmlFor="student-login-password"
            className="mb-2 block text-xs font-semibold tracking-wider text-on-surface-variant uppercase transition-colors group-focus-within:text-primary"
          >
            Password
          </label>
          <input
            id="student-login-password"
            type="password"
            name="password"
            required
            placeholder="••••••••"
            className="w-full border-0 border-b border-outline-variant bg-surface-container-highest py-3 text-base text-on-surface transition-colors placeholder:text-on-surface-variant/50 focus:border-primary focus:outline-none focus:ring-0"
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-lg px-6 py-4 text-sm font-bold tracking-wider uppercase shadow-md transition-all ease-out hover:-translate-y-px hover:opacity-95 active:scale-95 disabled:cursor-wait disabled:opacity-75 disabled:hover:translate-y-0 disabled:active:scale-100"
          style={{ background: "linear-gradient(145deg, var(--color-primary), var(--color-primary-dim))", color: "var(--color-on-primary)" }}
        >
          {isPending ? (
            <Loader size="sm" color="currentColor" label="Signing In…" />
          ) : (
            "Sign In"
          )}
        </button>
      </form>
    </AuthShell>
  );
}
