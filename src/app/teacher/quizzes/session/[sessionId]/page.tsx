"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import Loader from "@/components/Loader";
import type { TeacherQuizSessionStateDTO } from "@/lib/api/types";
import CountdownRing from "@/components/quiz/CountdownRing";
import Leaderboard from "@/components/quiz/Leaderboard";

export default function TeacherQuizSessionPage() {
  const router = useRouter();
  const params = useParams<{ sessionId: string }>();
  const sessionId = params.sessionId;

  const [state, setState] = useState<TeacherQuizSessionStateDTO | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  const status = state?.status ?? "LOBBY";

  useEffect(() => {
    let active = true;
    let interval: ReturnType<typeof setInterval> | null = null;

    async function tick() {
      try {
        const next = await api.quizSessions.getTeacherState(sessionId);
        if (active) {
          setState(next);
          setError(null);
        }
      } catch (err: unknown) {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Failed to load session state.");
      }
    }

    tick();
    interval = setInterval(tick, 1000);
    return () => {
      active = false;
      if (interval) clearInterval(interval);
    };
  }, [sessionId]);

  const questionLabel = useMemo(() => {
    if (!state) return "";
    const idx = state.currentQuestionIndex ?? -1;
    if (idx < 0) return "Lobby";
    return `Q${idx + 1} / ${state.totalQuestions}`;
  }, [state]);

  const run = async (fn: () => Promise<unknown>) => {
    setIsBusy(true);
    setError(null);
    try {
      await fn();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Action failed.");
    } finally {
      setIsBusy(false);
    }
  };

  if (!state && !error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader size="lg" label="Loading live console..." />
      </div>
    );
  }

  return (
    <div className="pb-12 grid gap-6">
      <header className="flex items-start justify-between gap-4 flex-wrap">
        <div className="grid gap-2">
          <p className="m-0 text-label-sm text-on-surface-variant">Live Quiz Console</p>
          <h1 className="m-0 font-headline text-[clamp(1.75rem,3vw,2.5rem)] font-extrabold tracking-[-0.04em] text-primary">
            {state?.quizTitle ?? "Quiz"}
          </h1>
          <p className="m-0 text-sm text-on-surface-variant flex items-center gap-3 flex-wrap">
            Join code: <span className="font-semibold text-on-surface">{state?.sessionCode}</span> • {questionLabel} • Status:{" "}
            <span className="font-semibold text-on-surface">{status}</span>
          </p>
          <div className="flex items-center gap-3">
            <CountdownRing secondsRemaining={state?.secondsRemaining} totalSeconds={state?.timePerQuestionSec} size={40} />
          </div>
        </div>
        <button
          type="button"
          className="btn-ghost"
          onClick={() => router.push("/teacher/quizzes")}
        >
          Back to Quizzes
        </button>
        <button
          type="button"
          className="btn-primary"
          onClick={() => window.open(`/teacher/quizzes/display/${sessionId}`, "_blank", "width=1024,height=768")}
        >
          Open Display Mode
        </button>
      </header>

      {error ? (
        <div className="rounded-md border border-error/20 bg-error-container/50 py-3 px-4 text-[0.8125rem] leading-[1.6] text-on-surface">
          {error}
        </div>
      ) : null}

      <section className="bg-surface-container-lowest rounded-lg p-8 shadow-sm grid gap-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs font-bold px-3 py-2 rounded-full" style={{ background: "var(--color-primary-container)", color: "var(--color-on-primary-container)" }}>
              Participants: {state?.participants?.length ?? 0}
            </span>
            {typeof state?.secondsRemaining === "number" ? (
              <span className="text-xs font-bold px-3 py-2 rounded-full" style={{ background: "var(--color-surface-container)", color: "var(--color-on-surface)" }}>
                Time left: {state.secondsRemaining}s
              </span>
            ) : null}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              disabled={isBusy}
              className="btn-ghost"
              onClick={() => run(() => api.quizSessions.lock(sessionId, !state?.locked))}
            >
              {state?.locked ? "Unlock" : "Lock"}
            </button>
            <button
              type="button"
              disabled={isBusy}
              className="btn-ghost"
              onClick={() => run(() => api.quizSessions.start(sessionId))}
            >
              Start
            </button>
            <button
              type="button"
              disabled={isBusy}
              className="btn-ghost"
              onClick={() => run(() => api.quizSessions.reveal(sessionId))}
            >
              Reveal
            </button>
            <button
              type="button"
              disabled={isBusy}
              className="btn-ghost"
              onClick={() => run(() => api.quizSessions.next(sessionId))}
            >
              Next
            </button>
            <button
              type="button"
              disabled={isBusy}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-sm text-sm font-bold transition-all active:scale-95 disabled:opacity-75 disabled:cursor-wait"
              style={{ background: "var(--color-error-container)", color: "var(--color-error)" }}
              onClick={() => run(() => api.quizSessions.end(sessionId))}
            >
              End
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {state?.currentQuestion ? (
            <motion.div
              key={`q-${state.currentQuestionIndex}-${state.status}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="grid gap-3"
            >
              <div className="flex items-start justify-between gap-4">
                <h2 className="m-0 text-base font-extrabold text-on-surface leading-relaxed">
                  {state.currentQuestionIndex + 1}. {state.currentQuestion.text}
                </h2>
                <span className="text-[0.75rem] font-bold tracking-wider px-3 py-1 rounded-full shrink-0"
                  style={{ background: "var(--color-surface-container)", color: "var(--color-on-surface-variant)" }}
                >
                  FAST FINGERS
                </span>
              </div>

              {state.currentQuestion.options?.length ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {state.currentQuestion.options.map((opt) => {
                    const count = state.answerDistribution?.[opt] ?? 0;
                    const total = state.totalResponses ?? 0;
                    const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                    return (
                      <div
                        key={opt}
                        className="rounded-md p-4 overflow-hidden border"
                        style={{ background: "var(--color-surface-container-low)", borderColor: "transparent" }}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-sm font-semibold text-on-surface">{opt}</span>
                          <span className="text-xs font-extrabold tabular-nums" style={{ color: "var(--color-primary)" }}>
                            {count}
                          </span>
                        </div>
                        <div className="mt-3 h-2 rounded-full overflow-hidden" style={{ background: "var(--color-outline-variant)", opacity: 0.35 }}>
                          <motion.div
                            initial={false}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.35, ease: "easeOut" }}
                            className="h-full rounded-full"
                            style={{ background: "var(--color-primary)" }}
                          />
                        </div>
                        <p className="m-0 mt-2 text-[0.6875rem] font-semibold text-on-surface-variant">
                          {pct}% of responses
                        </p>
                      </div>
                    );
                  })}
                </div>
              ) : null}
              {state.correctAnswer ? (
                <p className="m-0 text-sm text-on-surface-variant">
                  Correct answer: <span className="font-semibold text-on-surface">{state.correctAnswer}</span>
                </p>
              ) : (
                <p className="m-0 text-xs text-on-surface-variant">
                  Tip: reveal the correct answer before moving to the next question to reinforce learning.
                </p>
              )}
            </motion.div>
          ) : (
            <motion.p
              key="lobby"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25 }}
              className="m-0 text-sm text-on-surface-variant"
            >
              Session is in lobby. Students can join using the code above.
            </motion.p>
          )}
        </AnimatePresence>
      </section>

      <Leaderboard entries={state?.leaderboard ?? []} title="Live Leaderboard" />
    </div>
  );
}
