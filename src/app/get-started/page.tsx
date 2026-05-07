"use client";

import Link from "next/link";
import AuthSessionGuard from "@/components/AuthSessionGuard";

const TeacherIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const StudentIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
    <path d="M6 12v5c3 3 9 3 12 0v-5" />
  </svg>
);

export default function GetStartedPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[radial-gradient(circle_at_top_right,#cae5e1_0%,transparent_40%),radial-gradient(circle_at_bottom_left,#efeeea_0%,transparent_30%)]">
      <AuthSessionGuard />

      <header className="fixed top-0 left-0 w-full z-50 bg-[var(--color-surface)]/80 backdrop-blur-[24px] shadow-[0px_12px_32px_rgba(27,28,26,0.04)]">
        <div className="flex items-center justify-between w-full h-16 max-w-full px-4 md:px-8">
          <Link
            href="/"
            className="text-xl font-bold tracking-[-0.02em] text-primary hover:opacity-80 transition-opacity"
          >
            Shiksha Sathi
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center pt-16 overflow-y-auto px-4">
        <div className="w-full max-w-2xl py-12 space-y-8">
          <div className="text-center space-y-3">
            <span className="font-['Manrope'] text-[10px] tracking-[0.15em] uppercase font-bold text-on-surface-variant block">
              Welcome
            </span>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-primary font-headline">
              How would you like to get started?
            </h1>
            <p className="text-sm text-on-surface-variant max-w-md mx-auto leading-relaxed">
              Choose your role to sign up for free or sign in to your existing account.
            </p>
</div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-surface-container-low rounded-xl p-6 md:p-8 shadow-[0px_12px_32px_rgba(27,28,26,0.04)] border border-outline-variant/30 space-y-5">
              <div className="flex flex-col items-center text-center space-y-3">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center"
                  style={{ background: "linear-gradient(145deg, var(--color-primary-container), var(--color-secondary-container))" }}
                >
                  <div className="text-primary">
                    <TeacherIcon />
                  </div>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-on-surface font-headline">I&apos;m a Teacher</h2>
                  <p className="text-xs text-on-surface-variant mt-1">
                    Create assignments, track submissions, and guide student practice.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <Link
                  href="/signup?role=TEACHER"
                  className="w-full py-3 px-6 text-sm font-bold tracking-wide rounded-lg shadow-md hover:shadow-xl active:scale-[0.98] transition-all text-center uppercase"
                  style={{ background: "linear-gradient(145deg, var(--color-primary), var(--color-primary-dim))", color: "var(--color-on-primary)" }}
                >
                  Sign Up — It&apos;s Free
                </Link>
                <Link
                  href="/login"
                  className="w-full py-3 px-6 text-sm font-semibold tracking-wide rounded-lg border border-outline-variant bg-transparent text-on-surface hover:bg-surface-container-high transition-all text-center"
                >
                  Sign In
                </Link>
              </div>
            </div>

            <div className="bg-surface-container-low rounded-xl p-6 md:p-8 shadow-[0px_12px_32px_rgba(27,28,26,0.04)] border border-outline-variant/30 space-y-5">
              <div className="flex flex-col items-center text-center space-y-3">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center"
                  style={{ background: "linear-gradient(145deg, var(--color-tertiary-container), var(--color-primary-container))" }}
                >
                  <div className="text-tertiary">
                    <StudentIcon />
                  </div>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-on-surface font-headline">I&apos;m a Student</h2>
                  <p className="text-xs text-on-surface-variant mt-1">
                    Access assignments, submit answers, and track your academic progress.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <Link
                  href="/signup?role=STUDENT"
                  className="w-full py-3 px-6 text-sm font-bold tracking-wide rounded-lg shadow-md hover:shadow-xl active:scale-[0.98] transition-all text-center uppercase"
                  style={{ background: "linear-gradient(145deg, var(--color-primary), var(--color-primary-dim))", color: "var(--color-on-primary)" }}
                >
                  Sign Up — It&apos;s Free
                </Link>
                <Link
                  href="/student/login"
                  className="w-full py-3 px-6 text-sm font-semibold tracking-wide rounded-lg border border-outline-variant bg-transparent text-on-surface hover:bg-surface-container-high transition-all text-center"
                >
                  Sign In
                </Link>
              </div>
            </div>
          </div>

          <p className="text-center text-xs text-on-surface-variant">
            By continuing, you agree to Shiksha Sathi&apos;s{" "}
            <a href="#" className="font-semibold text-primary underline decoration-primary/30 underline-offset-2 transition-colors hover:text-primary-dim hover:decoration-primary">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="font-semibold text-primary underline decoration-primary/30 underline-offset-2 transition-colors hover:text-primary-dim hover:decoration-primary">
              Privacy Policy
            </a>
            .
          </p>
        </div>
      </main>
    </div>
  );
}