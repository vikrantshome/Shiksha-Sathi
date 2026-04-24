"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import Loader from "@/components/Loader";

/* ── Icons ── */
const IconZap = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);
const IconClock = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
  </svg>
);

export default function StudentQuizJoinPage() {
  const router = useRouter();

  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  // Pre-fill code from query param (e.g. ?code=ABC123 from dashboard modal)
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const value = params.get("code");
      if (value) setCode(value);
    } catch {
      // ignore SSR
    }
  }, []);

  const handleJoin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsPending(true);

    const trimmed = code.trim().toUpperCase();
    if (!trimmed) {
      setError("Please enter a quiz code.");
      setIsPending(false);
      return;
    }

    try {
      await api.quizSessions.join(trimmed);
      router.push(`/student/quizzes/live/${trimmed}`);
    } catch (err: unknown) {
      const anyErr = err as { status?: number };
      if (anyErr?.status === 401 || anyErr?.status === 403) {
        router.push("/student/login");
      } else {
        // self-paced quiz
        router.push(`/student/quizzes/${trimmed}`);
      }
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="max-w-full pb-12">
      {/* ═══ Page Header ═══ */}
      <header className="mb-6 md:mb-8">
        <span className="block text-[0.7rem] sm:text-[0.8rem] font-medium tracking-wide uppercase mb-1" style={{ color: "var(--color-primary)" }}>
          Quiz
        </span>
        <h1 className="text-xl sm:text-2xl md:text-[1.75rem] font-semibold tracking-tight leading-tight" style={{ color: "var(--color-on-surface)" }}>
          Join a Quiz
        </h1>
        <p className="text-xs sm:text-sm mt-1 max-w-md" style={{ color: "var(--color-on-surface-variant)" }}>
          Enter the code shared by your teacher. Live quizzes will drop you straight into the lobby.
        </p>
      </header>

      {/* ═══ Code Entry Card ═══ */}
      <section className="mb-8 md:mb-10">
        <div
          className="rounded-md p-5 md:p-6 max-w-md"
          style={{
            background: "var(--color-surface-container-lowest)",
            border: "1px solid var(--color-outline-variant)",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          {/* Icon + title */}
          <div className="flex items-center gap-3 mb-5">
            <div
              className="w-9 h-9 rounded-sm flex items-center justify-center shrink-0"
              style={{ background: "var(--color-primary-container)", color: "var(--color-on-primary-container)" }}
            >
              <IconZap />
            </div>
            <div>
              <p className="text-sm font-semibold leading-tight" style={{ color: "var(--color-on-surface)" }}>
                Enter Quiz Code
              </p>
              <p className="text-[0.7rem]" style={{ color: "var(--color-on-surface-variant)" }}>
                6-character code from your teacher
              </p>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div
              className="mb-4 px-4 py-3 rounded-sm text-sm"
              style={{ background: "var(--color-error-container)", color: "var(--color-error)" }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleJoin} className="flex flex-col gap-4">
            <div>
              <label
                htmlFor="quiz-code-input"
                className="block text-[0.7rem] font-bold uppercase tracking-[0.08em] mb-2"
                style={{ color: "var(--color-on-surface-variant)" }}
              >
                Quiz Code
              </label>
              <input
                id="quiz-code-input"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                required
                placeholder="e.g. A3K9X7"
                autoComplete="off"
                spellCheck={false}
                maxLength={12}
                className="w-full px-0 py-3 text-lg font-mono tracking-[0.2em] border-t-0 border-b-2 border-l-0 border-r-0 bg-transparent focus:ring-0 focus:outline-none transition-colors"
                style={{
                  borderColor: "var(--color-outline-variant)",
                  color: "var(--color-on-surface)",
                }}
                onFocus={(e) => (e.target.style.borderColor = "var(--color-primary)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--color-outline-variant)")}
              />
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full py-3 rounded-sm text-sm font-bold tracking-wide uppercase transition-all duration-200 disabled:opacity-60 disabled:cursor-wait"
              style={{
                background: "var(--color-primary)",
                color: "var(--color-on-primary)",
              }}
              onMouseEnter={(e) => { if (!isPending) e.currentTarget.style.opacity = "0.9"; }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
            >
              {isPending ? <Loader size="sm" color="currentColor" label="Joining…" /> : "Continue →"}
            </button>
          </form>
        </div>
      </section>

      {/* ═══ Past Quiz History ═══ */}
      <section>
        <div className="flex items-center justify-between mb-3 md:mb-4">
          <h2 className="text-base font-semibold tracking-tight" style={{ color: "var(--color-on-surface)" }}>
            Past Quizzes
          </h2>
        </div>

        {/* Empty state — shown until backend exposes student quiz history endpoint */}
        <div
          className="rounded-md border-2 border-dashed p-8 md:p-10 flex flex-col items-center text-center"
          style={{ borderColor: "var(--color-outline-variant)", background: "var(--color-surface-container-low)" }}
        >
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center mb-3"
            style={{ background: "var(--color-surface-container)", color: "var(--color-outline)" }}
          >
            <IconClock />
          </div>
          <h4 className="text-sm font-bold" style={{ color: "var(--color-on-surface)" }}>
            No quiz history yet
          </h4>
          <p className="text-xs mt-1.5 leading-relaxed max-w-[18rem]" style={{ color: "var(--color-on-surface-variant)" }}>
            Quizzes you complete will appear here so you can review your scores and answers.
          </p>
        </div>
      </section>
    </div>
  );
}
