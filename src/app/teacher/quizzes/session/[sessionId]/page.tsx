"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import Loader from "@/components/Loader";
import type { TeacherQuizSessionStateDTO } from "@/lib/api/types";
import CountdownRing from "@/components/quiz/CountdownRing";
import Leaderboard from "@/components/quiz/Leaderboard";

function getQuestionTypeBadge(type: string): { label: string; color: string; bg: string } {
  const t = type?.toUpperCase() ?? "";
  if (t === "TRUE_FALSE" || t === "TF") return { label: "True / False", color: "var(--color-on-tertiary-container)", bg: "var(--color-tertiary-container)" };
  if (t === "MCQ") return { label: "Multiple Choice", color: "var(--color-on-secondary-container)", bg: "var(--color-secondary-container)" };
  if (t === "SHORT_ANSWER") return { label: "Short Answer", color: "var(--color-on-surface-variant)", bg: "var(--color-surface-container)" };
  return { label: type, color: "var(--color-on-surface)", bg: "var(--color-surface-container)" };
}

function LockIcon({ locked }: { locked: boolean }) {
  if (locked) {
    return <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>;
  }
  return <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0"/></svg>;
}

function PlayIcon() {
  return <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>;
}

function EyeIcon() {
  return <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>;
}

function ArrowIcon() {
  return <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>;
}

function CloseIcon() {
  return <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"/></svg>;
}

function BackIcon() {
  return <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>;
}

function MonitorIcon() {
  return <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>;
}

function UsersIcon() {
  return <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>;
}

function ClockIcon() {
  return <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z"/></svg>;
}

function CheckIcon() {
  return <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>;
}

function InfoIcon() {
  return <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M11 7h2v2h-2zm0 4h2v6h-2zm1-9C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/></svg>;
}

function CodeIcon() {
  return <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M3 3h18v18H3V3zm2 2v14h14V5H5zm2 2h10v2H7V7zm0 4h10v2H7v-2zm0 4h7v2H7v-2z"/></svg>;
}



function FastFingersTag() {
  return (
    <span className="shrink-0 px-2 py-1 rounded-md text-xs font-bold tracking-wider" style={{ background: "var(--color-surface-container)", color: "var(--color-on-surface-variant)" }}>
      FAST FINGERS
    </span>
  );
}

export default function TeacherQuizSessionPage() {
  const router = useRouter();
  const params = useParams<{ sessionId: string }>();
  const sessionId = params.sessionId;

  const [state, setState] = useState<TeacherQuizSessionStateDTO | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  const status = state?.status ?? "LOBBY";
  const isLive = status === "LIVE";
  const isReveal = status === "REVEAL";
  const isLobby = status === "LOBBY";
  const isEnded = status === "ENDED";

  const questionType = state?.currentQuestion?.type?.toUpperCase() ?? "";
  const isTrueFalse = questionType === "TRUE_FALSE" || questionType === "TF";

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

  const openDisplayMode = () => {
    window.open(`/teacher/quizzes/display/${sessionId}`, "_blank", "width=1024,height=768");
  };

  if (!state && !error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <Loader size="lg" label="Loading live console..." />
      </div>
    );
  }

  const typeBadge = state?.currentQuestion ? getQuestionTypeBadge(state.currentQuestion.type) : null;
  const defaultOptions = ["A", "B", "C", "D"];

  return (
    <div className="pb-8 space-y-4 md:space-y-6">
      {/* Header Card */}
      <header className="rounded-2xl p-4 md:p-6 shadow-elevated1" style={{ background: "var(--color-surface-container-low)", backgroundImage: "linear-gradient(135deg, var(--color-surface-container-low) 0%, var(--color-surface-container) 100%)" }}>
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="space-y-2 md:space-y-3">
            <p className="m-0 text-sm md:text-base text-on-surface-variant flex items-center gap-2">
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: isLive ? "var(--color-error)" : "var(--color-on-surface-variant)" }} />
              <span className="hidden sm:inline">Live Quiz Console</span>
              <span className="sm:hidden">Quiz Console</span>
            </p>
            <h1 className="m-0 font-bold tracking-[-0.02em] text-primary text-xl md:text-2xl lg:text-3xl">
              {state?.quizTitle ?? "Quiz"}
            </h1>
            <p className="m-0 text-sm text-on-surface-variant flex flex-wrap items-center gap-2 md:gap-3">
              <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs md:text-sm font-bold" style={{ background: "var(--color-primary-container)", color: "var(--color-on-primary-container)" }}>
                <CodeIcon />
                <span className="font-mono">{state?.sessionCode}</span>
              </span>
              <span className="font-medium">{questionLabel}</span>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold uppercase" style={{ background: isLive ? "var(--color-error-container)" : isReveal ? "var(--color-tertiary-container)" : "var(--color-surface-container)", color: isLive ? "var(--color-error)" : isReveal ? "var(--color-on-tertiary)" : "var(--color-on-surface-variant)" }}>
                {status}
              </span>
            </p>
            <div className="flex items-center gap-2">
              <CountdownRing secondsRemaining={state?.secondsRemaining} totalSeconds={state?.timePerQuestionSec} size={36} />
            </div>
          </div>
          <div className="flex flex-row md:flex-col gap-2">
            <button
              type="button"
              className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold transition-all hover:shadow-elevated1 active:scale-95"
              style={{ background: "var(--color-surface-container-high)", color: "var(--color-on-surface)" }}
              onClick={() => router.push("/teacher/quizzes")}
            >
              <BackIcon />
              <span className="hidden sm:inline">Back</span>
            </button>
            <button
              type="button"
              className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold transition-all hover:shadow-elevated1 active:scale-95"
              style={{ background: "var(--color-primary)", color: "var(--color-on-primary)" }}
              onClick={openDisplayMode}
            >
              <MonitorIcon />
              <span className="hidden sm:inline">Display</span>
            </button>
          </div>
        </div>
      </header>

      {/* Error Banner */}
      {error ? (
        <div className="rounded-lg p-3 md:p-4 text-sm flex items-center gap-3" style={{ background: "var(--color-error-container)", color: "var(--color-on-error)" }}>
          <InfoIcon />
          {error}
        </div>
      ) : null}

      {/* Control Section */}
      <section className="rounded-2xl p-4 md:p-6 shadow-elevated1" style={{ background: "var(--color-surface-container-lowest)" }}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 md:mb-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold" style={{ background: "var(--color-primary-container)", color: "var(--color-on-primary-container)" }}>
              <UsersIcon />
              {state?.participants?.length ?? 0}
            </span>
            {typeof state?.secondsRemaining === "number" && isLive && (
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold animate-pulse" style={{ background: "var(--color-error-container)", color: "var(--color-error)" }}>
                <ClockIcon />
                {state.secondsRemaining}s
              </span>
            )}
            {typeBadge && (
              <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold" style={{ background: typeBadge.bg, color: typeBadge.color }}>
                {typeBadge.label}
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            <button
              type="button"
              disabled={isBusy || isEnded}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all hover:shadow-elevated1 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: state?.locked ? "#115e59" : "#4b5563", color: "white" }}
              onClick={() => run(() => api.quizSessions.lock(sessionId, !state?.locked))}
            >
              <LockIcon locked={state?.locked ?? false} />
              <span>{state?.locked ? "Unlock" : "Lock"}</span>
            </button>
            <button
              type="button"
              disabled={isBusy || isLive || isReveal || isEnded}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all hover:shadow-elevated1 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: "#022c22", color: "white" }}
              onClick={() => run(() => api.quizSessions.start(sessionId))}
            >
              <PlayIcon />
              <span>Start</span>
            </button>
            <button
              type="button"
              disabled={isBusy || isLobby || isReveal || isEnded}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all hover:shadow-elevated1 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: "#78350f", color: "white" }}
              onClick={() => run(() => api.quizSessions.reveal(sessionId))}
            >
              <EyeIcon />
              <span>Reveal</span>
            </button>
            <button
              type="button"
              disabled={isBusy || isLobby || isEnded}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all hover:shadow-elevated1 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: "#1a4731", color: "white" }}
              onClick={() => run(() => api.quizSessions.next(sessionId))}
            >
              <ArrowIcon />
              <span>Next</span>
            </button>
            <button
              type="button"
              disabled={isBusy || isEnded}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all hover:shadow-elevated1 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: "#7f1d1d", color: "white" }}
              onClick={() => run(() => api.quizSessions.end(sessionId))}
            >
              <CloseIcon />
              <span>End</span>
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {state?.currentQuestion ? (
            <motion.div
              key={`q-${state.currentQuestionIndex}-${state.status}`}
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16, scale: 0.98 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className="space-y-3 md:space-y-4"
            >
              {/* Question Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                <h2 className="m-0 text-base md:text-lg font-bold text-on-surface leading-relaxed flex-1">
                  <span className="mr-1 text-on-surface-variant font-extrabold">{state.currentQuestionIndex + 1}.</span>
                  {state.currentQuestion.text}
                </h2>
                {questionType !== "SHORT_ANSWER" && questionType !== "LONG_ANSWER" && <FastFingersTag />}
              </div>

              {/* TRUE/FALSE Options */}
              {isTrueFalse ? (
                <div className="grid grid-cols-2 gap-2 md:gap-3">
                  {["TRUE", "FALSE"].map((opt) => {
                    const count = state.answerDistribution?.[opt] ?? 0;
                    const total = state.totalResponses ?? 0;
                    const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                    const isCorrect = state.correctAnswer === opt;
                    return (
                      <motion.div
                        key={opt}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative overflow-hidden rounded-xl p-3 md:p-5 transition-all"
                        style={{ 
                          background: isCorrect && isReveal ? "var(--color-primary-container)" : "var(--color-surface-container-low)",
                          border: isCorrect && isReveal ? "2px solid var(--color-primary)" : "2px solid transparent"
                        }}
                      >
                        <div className="flex items-center justify-between gap-2 relative z-10">
                          <span className="text-sm md:text-lg font-bold" style={{ color: isCorrect && isReveal ? "var(--color-primary)" : "var(--color-on-surface)" }}>
                            {opt}
                          </span>
                          <span className="text-xs md:text-sm font-extrabold tabular-nums" style={{ color: isCorrect && isReveal ? "var(--color-primary)" : "var(--color-on-surface-variant)" }}>
                            {count} ({pct}%)
                          </span>
                        </div>
                        <div className="mt-2 md:mt-3 h-2 rounded-full overflow-hidden" style={{ background: "var(--color-surface-container)", opacity: 0.5 }}>
                          <motion.div
                            initial={false}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                            className="h-full rounded-full"
                            style={{ background: isCorrect && isReveal ? "var(--color-primary)" : "var(--color-primary-dim)" }}
                          />
                        </div>
                        {isCorrect && isReveal && (
                          <svg className="absolute top-2 right-2 w-5 h-5 md:w-6 md:h-6" style={{ color: "var(--color-primary)" }} fill="currentColor" viewBox="0 0 24 24">
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                          </svg>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              ) : state.currentQuestion.options?.length ? (
                /* MCQ Options */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
                  {state.currentQuestion.options.map((opt, idx) => {
                    const optionLabel = defaultOptions[idx] || String(idx + 1);
                    const count = state.answerDistribution?.[optionLabel] ?? 0;
                    const total = state.totalResponses ?? 0;
                    const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                    const isCorrect = state.correctAnswer === optionLabel;
                    return (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative overflow-hidden rounded-xl p-3 md:p-4 transition-all"
                        style={{ 
                          background: isCorrect && isReveal ? "var(--color-primary-container)" : "var(--color-surface-container-low)",
                          border: isCorrect && isReveal ? "2px solid var(--color-primary)" : "2px solid transparent"
                        }}
                      >
                        <div className="flex items-center justify-between gap-2 relative z-10">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: isCorrect && isReveal ? "var(--color-primary)" : "var(--color-surface-container)", color: isCorrect && isReveal ? "var(--color-on-primary)" : "var(--color-on-surface-variant)" }}>
                              {optionLabel}
                            </span>
                            <span className="text-xs md:text-sm font-semibold text-on-surface">{opt}</span>
                          </div>
                          <span className="text-xs md:text-sm font-extrabold tabular-nums" style={{ color: isCorrect && isReveal ? "var(--color-primary)" : "var(--color-on-surface-variant)" }}>
                            {count} ({pct}%)
                          </span>
                        </div>
                        <div className="mt-2 md:mt-3 h-2 rounded-full overflow-hidden" style={{ background: "var(--color-surface-container)", opacity: 0.5 }}>
                          <motion.div
                            initial={false}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                            className="h-full rounded-full"
                            style={{ background: isCorrect && isReveal ? "var(--color-primary)" : "var(--color-primary-dim)" }}
                          />
                        </div>
                        {isCorrect && isReveal && (
                          <svg className="absolute top-2 right-2 w-4 h-4 md:w-5 md:h-5" style={{ color: "var(--color-primary)" }} fill="currentColor" viewBox="0 0 24 24">
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                          </svg>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              ) : null}

              {/* Answer Footer */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 md:gap-4 pt-2">
                {state.correctAnswer ? (
                  <div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs md:text-sm font-bold" style={{ background: "var(--color-primary-container)", color: "var(--color-on-primary-container)" }}>
                    <CheckIcon />
                    Correct: {state.correctAnswer}
                  </div>
                ) : !isEnded && (
                  <p className="m-0 text-sm text-on-surface-variant flex items-center gap-2">
                    <InfoIcon />
                    <span className="hidden sm:inline">Reveal answer before moving to next question</span>
                    <span className="sm:hidden">Reveal the answer</span>
                  </p>
                )}
                <span className="ml-auto text-xs md:text-sm text-on-surface-variant">
                  {state.totalResponses ?? 0} responses
                </span>
              </div>
            </motion.div>
          ) : (
            /* Lobby State */
            <motion.div
              key="lobby"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="py-8 md:py-12 text-center"
            >
              <div className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-3 md:mb-4 rounded-full flex items-center justify-center" style={{ background: "var(--color-primary-container)" }}>
                <svg className="w-8 h-8 md:w-10 md:h-10" style={{ color: "var(--color-on-primary-container)" }} fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
              <p className="text-sm md:text-base font-medium text-on-surface">Session is in lobby</p>
              <p className="text-sm text-on-surface-variant mt-1">Students can join using the code above</p>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      <Leaderboard entries={state?.leaderboard ?? []} title="Live Leaderboard" />
    </div>
  );
}