"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import Loader from "@/components/Loader";
import type { StudentQuizSessionStateDTO } from "@/lib/api/types";
import CountdownRing from "@/components/quiz/CountdownRing";
import Leaderboard from "@/components/quiz/Leaderboard";

export default function StudentLiveQuizPage() {
  const router = useRouter();
  const params = useParams<{ sessionCode: string }>();
  const sessionCode = String(params.sessionCode ?? "").toUpperCase();

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [state, setState] = useState<StudentQuizSessionStateDTO | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    async function join() {
      try {
        const res = await api.quizSessions.join(sessionCode);
        if (!active) return;
        setSessionId(res.sessionId);
        setError(null);
      } catch (err: unknown) {
        if (!active) return;
        const message = err instanceof Error ? err.message : "Failed to join session.";
        setError(message);
        // If unauthorized, redirect to login
        if (message.toLowerCase().includes("unauthorized") || message.toLowerCase().includes("forbidden")) {
          router.push("/student/login");
        }
      }
    }
    join();
    return () => {
      active = false;
    };
  }, [router, sessionCode]);

  useEffect(() => {
    if (!sessionId) return;
    const id = sessionId;
    let active = true;
    let interval: ReturnType<typeof setInterval> | null = null;

    async function tick() {
      try {
        const next = await api.quizSessions.getState(id);
        if (active) {
          setState(next);
          setError(null);
        }
      } catch (err: unknown) {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Failed to load quiz state.");
      }
    }

    tick();
    interval = setInterval(tick, 1000);
    return () => {
      active = false;
      if (interval) clearInterval(interval);
    };
  }, [sessionId]);

  const currentQuestion = state?.currentQuestion;
  const canAnswer = state?.status === "LIVE" && !!currentQuestion && !state?.myAnswer;

  const handleAnswer = async (answer: string) => {
    if (!sessionId || !canAnswer) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await api.quizSessions.submitAnswer(sessionId, answer);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to submit answer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const header = useMemo(() => {
    if (!state) return { title: "Joining quiz…", subtitle: "" };
    const idx = state.currentQuestionIndex ?? -1;
    const qLabel = idx >= 0 ? `Q${idx + 1} / ${state.totalQuestions}` : "Lobby";
    return {
      title: state.quizTitle ?? "Live Quiz",
      subtitle: `${qLabel} • Score: ${state.myScore ?? 0}`,
    };
  }, [state]);

  if (!state && !error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader size="lg" label="Joining live quiz..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--color-surface)" }}>
      <main className="pt-6 pb-24 px-4 md:px-8 lg:px-16">
        <div className="max-w-3xl mx-auto grid gap-6">
          <header
            className="bg-surface-container-lowest rounded-lg p-6 shadow-sm overflow-hidden"
            style={{
              border: "1px solid var(--color-outline-variant)",
              background:
                "linear-gradient(180deg, rgba(44,95,110,0.10), transparent 60%), var(--color-surface-container-lowest)",
            }}
          >
            <p className="m-0 text-xs font-bold tracking-widest uppercase" style={{ color: "var(--color-primary)" }}>
              Live Quiz
            </p>
            <div className="mt-2 flex items-start justify-between gap-4">
              <h1 className="m-0 text-2xl font-extrabold tracking-tight text-on-surface">
              {header.title}
            </h1>
              <CountdownRing
                secondsRemaining={state?.secondsRemaining}
                totalSeconds={state?.timePerQuestionSec}
              />
            </div>
            <p className="m-0 mt-2 text-sm text-on-surface-variant">
              {header.subtitle} • Code: <span className="font-semibold text-on-surface">{sessionCode}</span>
            </p>
            <p className="m-0 mt-2 text-xs text-on-surface-variant">
              Tip: answer fast for extra points (speed bonus on correct answers).
            </p>
          </header>

          {error ? (
            <div className="rounded-md border border-error/20 bg-error-container/50 py-3 px-4 text-[0.8125rem] leading-[1.6] text-on-surface">
              {error}
            </div>
          ) : null}

          <AnimatePresence mode="wait">
            {state?.status === "LOBBY" ? (
              <motion.section
                key="lobby"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="bg-surface-container-lowest rounded-lg p-8 shadow-sm text-center"
              >
                <motion.div
                  initial={{ scale: 0.98 }}
                  animate={{ scale: [0.98, 1.01, 0.98] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full"
                  style={{ background: "var(--color-surface-container-low)", color: "var(--color-on-surface-variant)" }}
                >
                  <span className="h-2 w-2 rounded-full bg-primary" />
                  Waiting for start
                </motion.div>
                <h2 className="m-0 mt-5 text-lg font-bold text-on-surface">Get ready…</h2>
                <p className="mt-3 mb-0 text-sm text-on-surface-variant">
                  The first question will appear automatically. Keep this page open.
                </p>
              </motion.section>
            ) : null}

            {state?.status === "LIVE" && currentQuestion ? (
              <motion.section
                key={`live-${state.currentQuestionIndex}`}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.25 }}
                className="bg-surface-container-lowest rounded-lg p-8 shadow-sm grid gap-4"
                style={{ border: "1px solid var(--color-outline-variant)" }}
              >
                <div className="flex items-start justify-between gap-4">
                  <h2 className="m-0 text-base font-extrabold text-on-surface leading-relaxed">
                    {state.currentQuestionIndex + 1}. {currentQuestion.text}
                  </h2>
                  <span className="text-[0.75rem] font-bold tracking-wider px-3 py-1 rounded-full shrink-0"
                    style={{ background: "var(--color-surface-container)", color: "var(--color-on-surface-variant)" }}
                  >
                    FAST FINGERS
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {(currentQuestion.options ?? []).map((opt, idx) => {
                    const isSelected = state.myAnswer === opt;
                    const disabled = !canAnswer || isSubmitting;
                    return (
                      <motion.button
                        key={opt}
                        type="button"
                        disabled={disabled}
                        onClick={() => handleAnswer(opt)}
                        whileTap={!disabled ? { scale: 0.98 } : undefined}
                        whileHover={!disabled ? { y: -1 } : undefined}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, delay: idx * 0.03 }}
                        className="flex items-center justify-between gap-3 p-4 rounded-xl transition-all text-left text-sm border"
                        style={{
                          background: isSelected
                            ? "linear-gradient(145deg, var(--color-primary-container), rgba(44,95,110,0.10))"
                            : "var(--color-surface-container-low)",
                          borderColor: isSelected ? "var(--color-primary)" : "transparent",
                          opacity: disabled ? 0.8 : 1,
                          cursor: disabled ? "not-allowed" : "pointer",
                        }}
                      >
                        <span
                          className="text-sm font-semibold"
                          style={{
                            color: isSelected ? "var(--color-on-primary-container)" : "var(--color-on-surface)",
                          }}
                        >
                          {String.fromCharCode(65 + idx)}) {opt}
                        </span>
                        {isSelected ? (
                          <span className="text-xs font-extrabold tracking-widest uppercase" style={{ color: "var(--color-primary)" }}>
                            Locked
                          </span>
                        ) : null}
                      </motion.button>
                    );
                  })}
                </div>

                {state.myAnswer ? (
                  <p className="m-0 text-sm text-on-surface-variant">
                    Answer submitted: <span className="font-semibold text-on-surface">{state.myAnswer}</span>
                  </p>
                ) : (
                  <p className="m-0 text-xs text-on-surface-variant">
                    Choose once. Correct + fast answers earn more points.
                  </p>
                )}
              </motion.section>
            ) : null}
          </AnimatePresence>

          {(state?.status === "REVEAL" || state?.status === "ENDED") ? (
            <motion.section
              key={`reveal-${state.currentQuestionIndex}-${state.status}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="bg-surface-container-lowest rounded-lg p-8 shadow-sm grid gap-4"
              style={{ border: "1px solid var(--color-outline-variant)" }}
            >
              <h2 className="m-0 text-lg font-bold text-on-surface">
                {state.status === "ENDED" ? "Quiz Ended" : "Answer Reveal"}
              </h2>
              {state.correctAnswer ? (
                <p className="m-0 text-sm text-on-surface-variant">
                  Correct answer: <span className="font-semibold text-on-surface">{state.correctAnswer}</span>
                </p>
              ) : null}
              {typeof state.myCorrect === "boolean" ? (
                <p className="m-0 text-sm">
                  You are{" "}
                  <span className="font-bold" style={{ color: state.myCorrect ? "var(--color-primary)" : "var(--color-error)" }}>
                    {state.myCorrect ? "correct" : "incorrect"}
                  </span>
                  {typeof state.myPointsAwarded === "number" ? (
                    <> • <span className="font-extrabold">+{state.myPointsAwarded}</span> points</>
                  ) : null}
                </p>
              ) : (
                <p className="m-0 text-sm text-on-surface-variant">No answer submitted for this question.</p>
              )}

              <Leaderboard entries={state.leaderboard ?? []} />

              {state.status === "ENDED" ? (
                <button
                  type="button"
                  onClick={() => router.push("/student/dashboard")}
                  className="mt-4 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-sm text-sm font-bold transition-all active:scale-95"
                  style={{ background: "linear-gradient(145deg, var(--color-primary), var(--color-primary-dim))", color: "var(--color-on-primary)" }}
                >
                  Go to Dashboard
                </button>
              ) : (
                <p className="m-0 text-xs text-on-surface-variant">
                  Waiting for the next question…
                </p>
              )}
            </motion.section>
          ) : null}
        </div>
      </main>
    </div>
  );
}
