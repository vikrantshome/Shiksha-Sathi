"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/api/auth";
import { setCookie } from "cookies-next";
import AuthShell from "@/components/AuthShell";
import Loader from "@/components/Loader";

export default function LoginPage() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);

  const validatePhone = (phone: string): boolean => {
    const digits = phone.replace(/\D/g, "");
    if (digits.length !== 10) {
      setPhoneError("Phone number must be exactly 10 digits");
      return false;
    }
    setPhoneError(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    setError(null);
    setPhoneError(null);

    const formData = new FormData(e.currentTarget);
    const phone = (formData.get("phone") as string).replace(/\D/g, "");
    const password = formData.get("password") as string;

    if (!validatePhone(phone)) {
      setIsPending(false);
      return;
    }

    try {
      const response = await auth.login({ phone, password });

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
      {error ? (
        <div className="mb-6 rounded-md bg-error/10 p-4 text-sm text-error">
          {error}
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="grid gap-8">
        <div className="group relative">
          <label
            htmlFor="login-phone"
            className="mb-2 block text-xs font-semibold tracking-wider text-on-surface-variant uppercase transition-colors group-focus-within:text-primary"
          >
            Phone Number
          </label>
          <input
            id="login-phone"
            type="tel"
            name="phone"
            required
            placeholder="9876543210"
            maxLength={10}
            pattern="\d{10}"
            className={`w-full border-0 border-b bg-surface-container-highest py-3 text-base text-on-surface transition-colors placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-0 ${
              phoneError ? "border-error focus:border-error" : "border-outline-variant focus:border-primary"
            }`}
          />
          {phoneError && (
            <p className="mt-1 text-xs text-error">{phoneError}</p>
          )}
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
          className="w-full rounded-lg px-6 py-4 text-sm font-bold tracking-wider uppercase shadow-md transition-all ease-out hover:-translate-y-px hover:opacity-95 active:scale-95 disabled:cursor-wait disabled:opacity-75 disabled:hover:translate-y-0 disabled:active:scale-100"
          style={{ background: "linear-gradient(145deg, var(--color-primary), var(--color-primary-dim))", color: "var(--color-on-primary)" }}
        >
          {isPending ? (
            <Loader size="sm" color="currentColor" label="Signing In…" />
          ) : (
            "Sign In to Workspace"
          )}
        </button>
      </form>
    </AuthShell>
  );
}
