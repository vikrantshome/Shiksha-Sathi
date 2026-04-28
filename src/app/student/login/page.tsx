"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { saveStudentIdentity } from "@/lib/api/students";
import { auth } from "@/lib/api/auth";
import type { CandidateProfile } from "@/lib/api/types";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import AuthShell from "@/components/AuthShell";
import Loader from "@/components/Loader";

export default function StudentLoginPage() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [candidates, setCandidates] = useState<CandidateProfile[] | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateProfile | null>(null);
  const [loginData, setLoginData] = useState<{ phone: string; password: string } | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [redirectUrl, setRedirectUrl] = useState("/student/dashboard");

  useEffect(() => {
    const stored = localStorage.getItem("shiksha-sathi-student-identity");
    const token = sessionStorage.getItem("shiksha-sathi-token");
    if (stored && token) {
      router.replace("/student/dashboard");
    }
    // Capture redirect param so we can bounce back after login
    try {
      const params = new URLSearchParams(window.location.search);
      const dest = params.get("redirect");
      if (dest && dest.startsWith("/")) setRedirectUrl(dest);
    } catch {
      // ignore
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const phone = formData.get("phone") as string;
    const password = formData.get("password") as string;

    setLoginData({ phone, password });

    try {
      const response = await auth.login({
        phone: phone.replace(/\D/g, ""),
        password,
      });

      if (!response.token) {
        if (response.candidates && response.candidates.length > 0) {
          setCandidates(response.candidates);
          setIsPending(false);
          return;
        }
        setError("Login failed. Please try again.");
        setIsPending(false);
        return;
      }

      // Set sessionStorage for client-side auth (tab-isolated)
      // No cookie - cookie is shared across all tabs, defeating tab isolation
      sessionStorage.setItem('shiksha-sathi-token', response.token);

      const user = await auth.getMe();
      
      if (user.role === "STUDENT") {
        saveStudentIdentity({
          studentId: user.id,
          studentName: user.name || "",
          school: user.school || "",
          class: user.studentClass || "",
          section: user.section || "",
          storedAt: new Date().toISOString(),
        });
      }

      router.push(redirectUrl);
    } catch (err: unknown) {
      const apiError = err as { message?: string };
      setError(apiError.message || "Invalid credentials. Please try again.");
      setIsPending(false);
      return;
    }

    setIsPending(false);
  };

  const handleSelectCandidate = async (candidate: CandidateProfile) => {
    if (!loginData) return;
    setIsPending(true);
    setSelectedCandidate(candidate);

    try {
      const response = await auth.login({
        phone: loginData.phone.replace(/\D/g, ""),
        password: loginData.password,
        selectUserId: candidate.userId,
      });

      if (!response.token) {
        setError("Failed to select profile. Please try again.");
        setIsPending(false);
        return;
      }

// Set sessionStorage for client-side auth (tab-isolated)
        // No cookie - cookie is shared across all tabs, defeating tab isolation
        sessionStorage.setItem('shiksha-sathi-token', response.token);

        const user = await auth.getMe();
        
        if (user.role === "STUDENT") {
        saveStudentIdentity({
          studentId: user.id,
          studentName: user.name || candidate.name,
          school: user.school || candidate.school || "",
          class: user.studentClass || candidate.studentClass || "",
          section: user.section || candidate.section || "",
          storedAt: new Date().toISOString(),
        });
      }

      router.push(redirectUrl);
    } catch (err: unknown) {
      const apiError = err as { message?: string };
      setError(apiError.message || "Failed to select profile. Please try again.");
      setIsPending(false);
    }
  };

  const handleBackToLogin = () => {
    setCandidates(null);
    setSelectedCandidate(null);
    sessionStorage.removeItem('shiksha-sathi-token');
  };

  if (candidates && candidates.length > 0) {
    return (
      <AuthShell
        eyebrow="Welcome Back"
        title="Select Your Profile"
        description="Multiple students are registered with this phone number. Please select your profile to continue."
        alternatePrompt=""
        alternateHref=""
        alternateLabel=""
        legalNote={null}
      >
        {error ? (
          <div className="mb-6 rounded-md bg-error/10 p-4 text-sm text-error">
            {error}
          </div>
        ) : null}

        <div className="space-y-3">
          {candidates.map((candidate) => (
            <button
              key={candidate.userId}
              onClick={() => handleSelectCandidate(candidate)}
              disabled={isPending}
              className="w-full p-4 rounded-lg border-2 border-outline-variant hover:border-primary transition-all text-left disabled:opacity-50 disabled:cursor-wait"
              style={{ background: "var(--color-surface-container-lowest)" }}
            >
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-semibold"
                  style={{ background: "var(--color-primary-container)", color: "var(--color-on-primary-container)" }}
                >
                  {candidate.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-on-surface">{candidate.name}</p>
                  <p className="text-xs text-on-surface-variant">
                    Class {candidate.studentClass} {candidate.section && `- Section ${candidate.section}`}
                    {candidate.rollNumber && ` • Roll No: ${candidate.rollNumber}`}
                  </p>
                </div>
                {selectedCandidate?.userId === candidate.userId && (
                  <Loader size="sm" />
                )}
              </div>
            </button>
          ))}
        </div>

        <button
          onClick={handleBackToLogin}
          disabled={isPending}
          className="w-full mt-4 text-sm text-on-surface-variant hover:text-primary transition-colors disabled:opacity-50"
        >
          ← Back to login
        </button>
      </AuthShell>
    );
  }

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
          <div className="relative">
            <input
              id="student-login-password"
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
            "Sign In"
          )}
        </button>
      </form>
    </AuthShell>
  );
}
