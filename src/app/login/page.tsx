"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/api/auth";
import type { CandidateProfile } from "@/lib/api/types";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import AuthShell from "@/components/AuthShell";
import Loader from "@/components/Loader";

export default function LoginPage() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [candidates, setCandidates] = useState<CandidateProfile[] | null>(null);
  const [selectedPhone, setSelectedPhone] = useState("");
  const [selectedPassword, setSelectedPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const validatePhone = (phone: string): boolean => {
    const digits = phone.replace(/\D/g, "");
    if (digits.length !== 10) {
      setPhoneError("Phone number must be exactly 10 digits");
      return false;
    }
    setPhoneError(null);
    return true;
  };

  const doLogin = async (phone: string, password: string) => {
    const response = await auth.login({ phone, password });

    // Multi-profile scenario: show picker
    if (response.candidates && response.candidates.length > 0) {
      setCandidates(response.candidates);
      setSelectedPhone(phone);
      setSelectedPassword(password);
      setIsPending(false);
      return;
    }

// Normal single-user login
if (!response.token) {
        throw new Error("Invalid credentials");
      }

      // Set sessionStorage for client-side auth (tab-isolated)
      // No cookie - cookie is shared across all tabs, defeating tab isolation
      sessionStorage.setItem('shiksha-sathi-token', response.token);

      if (response.role === "TEACHER") {
      window.location.href = "/teacher/dashboard";
    } else {
      window.location.href = "/";
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    setError(null);
    setPhoneError(null);
    setCandidates(null);

    const formData = new FormData(e.currentTarget);
    const phone = (formData.get("phone") as string).replace(/\D/g, "");
    const password = formData.get("password") as string;

    if (!validatePhone(phone)) {
      setIsPending(false);
      return;
    }

    try {
      await doLogin(phone, password);
    } catch (err: unknown) {
      const apiError = err as { message?: string };
      setError(apiError.message || "Invalid credentials. Please try again.");
      setIsPending(false);
      return;
    }

    setIsPending(false);
  };

  const handleSelectProfile = async (candidate: CandidateProfile) => {
    setIsPending(true);
    setError(null);

    try {
      // Login with the selected profile's userId
      const response = await auth.login({
        phone: selectedPhone,
        password: selectedPassword,
        selectUserId: candidate.userId,
      });

      if (!response.token) {
        throw new Error("Invalid credentials");
      }

// Set sessionStorage for client-side auth (tab-isolated)
      // No cookie - cookie is shared across all tabs, defeating tab isolation
      sessionStorage.setItem('shiksha-sathi-token', response.token);

      if (response.role === "TEACHER") {
        window.location.href = "/teacher/dashboard";
      } else {
        window.location.href = "/";
      }
    } catch (err: unknown) {
      const apiError = err as { message?: string };
      setError(apiError.message || "Failed to select profile. Please try again.");
      setIsPending(false);
    }
  };

  const handleBackToLogin = () => {
    setCandidates(null);
    setSelectedPhone("");
    setSelectedPassword("");
    sessionStorage.removeItem('shiksha-sathi-token');
  };

  // Profile picker UI
  if (candidates && candidates.length > 0) {
    return (
      <AuthShell
        eyebrow="Select Profile"
        title="Multiple Accounts Found"
        description="This phone number is linked to multiple accounts. Please select the profile you want to sign in as."
        alternatePrompt=""
        alternateHref=""
        alternateLabel=""
        legalNote={undefined}
      >
        {error && (
          <div className="mb-4 rounded-md bg-error/10 p-4 text-sm text-error">
            {error}
          </div>
        )}

        <div className="space-y-3">
          {candidates.map((candidate) => (
            <button
              key={candidate.userId}
              onClick={() => handleSelectProfile(candidate)}
              disabled={isPending}
              className="w-full rounded-lg border border-outline-variant bg-surface-container-highest p-4 text-left transition-all hover:border-primary hover:bg-primary-container/10 disabled:opacity-50"
            >
              <div className="flex items-center gap-3">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-on-primary"
                  style={{ background: "linear-gradient(145deg, var(--color-primary), var(--color-primary-dim))" }}
                >
                  {candidate.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-on-surface">{candidate.name}</p>
                  <p className="text-xs text-on-surface-variant">
                    {candidate.role === "STUDENT"
                      ? `Student · Class ${candidate.studentClass || "?"} ${candidate.section ? "- " + candidate.section : ""}`
                      : candidate.role}
                    {candidate.school ? ` · ${candidate.school}` : ""}
                  </p>
                </div>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-on-surface-variant">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </div>
            </button>
          ))}
        </div>

        <button
          onClick={handleBackToLogin}
          className="mt-6 w-full rounded-lg border border-outline-variant bg-transparent py-3 text-sm font-semibold text-on-surface-variant transition-colors hover:bg-surface-container-high"
        >
          ← Back to Login
        </button>
      </AuthShell>
    );
  }

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
          <div className="relative">
            <input
              id="login-password"
              type={showPassword ? "text" : "password"}
              name="password"
              required
              placeholder="••••••••"
              className="w-full border-0 border-b border-outline-variant bg-surface-container-highest py-3 text-base text-on-surface transition-colors placeholder:text-on-surface-variant/50 focus:border-primary focus:outline-none focus:ring-0 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-on-surface-variant hover:text-primary transition-colors"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeSlashIcon className="h-5 w-5" />
              ) : (
                <EyeIcon className="h-5 w-5" />
              )}
            </button>
          </div>
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
