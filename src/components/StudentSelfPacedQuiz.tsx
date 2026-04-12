"use client";

import { motion } from "framer-motion";
import { useEffect, useMemo, useState, useTransition } from "react";
import { api } from "@/lib/api";
import Loader from "@/components/Loader";
import type { StudentQuizDTO, SubmitAssignmentResponse } from "@/lib/api/types";

export default function StudentSelfPacedQuiz({ quiz }: { quiz: StudentQuizDTO }) {
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<SubmitAssignmentResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    let active = true;
    async function start() {
      try {
        const res = await api.quizAttempts.start(quiz.id);
        if (active) setAttemptId(res.attemptId);
      } catch (err: unknown) {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Failed to start quiz attempt.");
      }
    }
    start();
    return () => {
      active = false;
    };
  }, [quiz.id]);

  const totalQuestions = quiz.questions.length;
  const answeredCount = Object.keys(answers).length;

  const totalMarks = useMemo(() => quiz.totalMarks ?? quiz.questions.reduce((acc, q) => acc + (q.marks ?? 1), 0), [quiz]);

  const submit = () => {
    if (!attemptId) return;
    setError(null);
    startTransition(async () => {
      try {
        const res = await api.quizAttempts.submit(attemptId, answers);
        setResult(res);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to submit quiz.");
      }
    });
  };

  if (result) {
    const percent = totalMarks > 0 ? Math.round((result.score / totalMarks) * 100) : 0;
    return (
      <div className="grid gap-6">
        <section className="bg-surface-container-lowest rounded-lg p-10 shadow-sm text-center">
          <p className="text-label-sm text-primary m-0">Completed</p>
          <h1 className="m-0 mt-2 text-2xl font-extrabold tracking-tight text-on-surface">
            {quiz.title}
          </h1>
          <div className="mt-6 flex items-baseline justify-center gap-3">
            <motion.span
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="text-6xl font-extrabold text-primary tabular-nums"
            >
              {result.score}
            </motion.span>
            <span className="text-2xl font-bold text-on-surface-variant">/ {totalMarks}</span>
          </div>
          <p className="m-0 mt-3 text-sm text-on-surface-variant">
            Score: {percent}%
          </p>
        </section>

        <section className="bg-surface-container-lowest rounded-lg p-8 shadow-sm">
          <h2 className="m-0 text-lg font-bold text-on-surface">Review</h2>
          <div className="mt-6 grid gap-4">
            {(result.feedback ?? []).map((fb) => (
              <div key={fb.questionId} className="rounded-lg p-5" style={{ background: "var(--color-surface-container-low)" }}>
                <p className="m-0 text-sm font-semibold text-on-surface">{fb.questionText}</p>
                <p className="m-0 mt-2 text-xs text-on-surface-variant">
                  Your answer: <span className="font-semibold text-on-surface">{fb.studentAnswer || "—"}</span>
                </p>
                <p className="m-0 mt-1 text-xs text-on-surface-variant">
                  Correct: <span className="font-semibold text-on-surface">{String(fb.correctAnswer || "—")}</span>
                </p>
                <p className="m-0 mt-2 text-xs font-bold" style={{ color: fb.isCorrect ? "var(--color-primary)" : "var(--color-error)" }}>
                  {fb.isCorrect ? "Correct" : "Incorrect"} • {fb.marksAwarded} marks
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      <header className="bg-surface-container-lowest rounded-lg p-6 shadow-sm">
        <p className="m-0 text-xs font-bold tracking-widest uppercase" style={{ color: "var(--color-primary)" }}>
          Self‑Paced Quiz
        </p>
        <h1 className="m-0 mt-2 text-2xl font-extrabold tracking-tight text-on-surface">
          {quiz.title}
        </h1>
        <p className="m-0 mt-2 text-sm text-on-surface-variant">
          {answeredCount} / {totalQuestions} answered • {totalMarks} marks
        </p>
      </header>

      {error ? (
        <div className="rounded-md border border-error/20 bg-error-container/50 py-3 px-4 text-[0.8125rem] leading-[1.6] text-on-surface">
          {error}
        </div>
      ) : null}

      <section className="grid gap-4">
        {quiz.questions.map((q, index) => (
          <article
            key={q.id}
            className="p-6 rounded-xl"
            style={{ background: "var(--color-surface-container-lowest)" }}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex gap-4 items-start">
                <span className="text-sm font-semibold shrink-0" style={{ color: "var(--color-primary)" }}>
                  {String(index + 1).padStart(2, "0")}.
                </span>
                <h2 className="text-base font-medium leading-relaxed m-0" style={{ color: "var(--color-on-surface)" }}>
                  {q.text}
                </h2>
              </div>
              <span className="text-[0.75rem] font-bold tracking-wider px-3 py-1 rounded-full shrink-0 ml-4" style={{ background: "var(--color-surface-container)", color: "var(--color-on-surface-variant)" }}>
                {q.marks ?? 1} MARKS
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-10">
              {(q.options ?? []).map((opt) => {
                const isSelected = answers[q.id] === opt;
                return (
                  <motion.button
                    key={opt}
                    type="button"
                    onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: opt }))}
                    whileTap={{ scale: 0.98 }}
                    whileHover={{ y: -1 }}
                    className="flex items-center gap-3 p-4 rounded-xl transition-all text-left text-sm"
                    style={{
                      background: isSelected ? "var(--color-primary-container)" : "var(--color-surface-container-low)",
                      border: isSelected ? "1px solid var(--color-primary)" : "1px solid transparent",
                    }}
                  >
                    <span className="text-sm" style={{
                      color: isSelected ? "var(--color-on-primary-container)" : "var(--color-on-surface)",
                      fontWeight: isSelected ? 600 : 400,
                    }}>
                      {opt}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </article>
        ))}
      </section>

      <div className="mt-4 flex justify-center">
        <button
          type="button"
          onClick={submit}
          disabled={isPending || !attemptId}
          className="px-8 py-4 rounded-full font-semibold text-sm flex items-center gap-3 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ background: "var(--color-primary-container)", color: "var(--color-on-primary-container)" }}
        >
          {isPending ? <Loader size="sm" color="currentColor" label="Submitting…" /> : "Submit Quiz"}
        </button>
      </div>
    </div>
  );
}
