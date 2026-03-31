"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { setCookie } from "cookies-next";
import { auth } from "@/lib/api/auth";
import AuthShell from "@/components/AuthShell";
import AuthSessionGuard from "@/components/AuthSessionGuard";

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

      setCookie("auth-token", response.token, {
        maxAge: 30 * 24 * 60 * 60,
        path: "/",
      });

      if (response.role === "TEACHER") {
        router.push("/teacher/dashboard");
      } else {
        router.push("/");
      }
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
      title="Return to Your Studio"
      description="Sign in to your Shiksha Sathi workspace to create assignments, monitor submissions, and keep your classroom rhythm on track."
      alternatePrompt="Need a teacher account?"
      alternateHref="/signup"
      alternateLabel="Create one now"
      legalNote={
        <>
          By continuing, you agree to Shiksha Sathi&apos;s{" "}
          <a
            href="#"
            className="font-semibold text-primary underline decoration-primary/30 underline-offset-2 transition-colors hover:text-primary-dim hover:decoration-primary"
          >
            Terms of Service
          </a>{" "}
          and{" "}
          <a
            href="#"
            className="font-semibold text-primary underline decoration-primary/30 underline-offset-2 transition-colors hover:text-primary-dim hover:decoration-primary"
          >
            Privacy Policy
          </a>
          .
        </>
      }
    >
      <AuthSessionGuard />

      {error ? (
        <div className="mb-6 rounded-md bg-error/10 p-4 text-sm text-error">
          {error}
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="grid gap-8">
        <div className="group relative">
          <label
            htmlFor="login-email"
            className="mb-2 block text-xs font-semibold tracking-wider text-on-surface-variant uppercase transition-colors group-focus-within:text-primary"
          >
            Email Address
          </label>
          <input
            id="login-email"
            type="email"
            name="email"
            required
            placeholder="teacher@school.com"
            className="w-full border-0 border-b border-outline-variant bg-surface-container-highest py-3 text-base text-on-surface transition-colors placeholder:text-on-surface-variant/50 focus:border-primary focus:outline-none focus:ring-0"
          />
        </div>

        <div className="group relative">
          <label
            htmlFor="login-password"
            className="mb-2 block text-xs font-semibold tracking-wider text-on-surface-variant uppercase transition-colors group-focus-within:text-primary"
          >
            Password
          </label>
          <input
            id="login-password"
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
          className="w-full rounded-lg bg-gradient-to-br from-primary to-primary-dim px-6 py-4 text-sm font-bold tracking-wider text-on-primary uppercase shadow-md transition-all ease-out hover:-translate-y-px hover:opacity-95 active:scale-95 disabled:cursor-wait disabled:opacity-75 disabled:hover:translate-y-0 disabled:active:scale-100"
        >
          {isPending ? "Signing In…" : "Sign In to Workspace"}
        </button>
      </form>
    </AuthShell>
  );
}
