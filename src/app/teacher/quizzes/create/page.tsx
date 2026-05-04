"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import CreateQuizForm from "@/components/CreateQuizForm";
import { QuizProvider, useQuiz } from "@/components/QuizContext";
import Loader from "@/components/Loader";

function QuizHeaderContent() {
  const { selectedQuestions } = useQuiz();
  const totalTimeSec = selectedQuestions.reduce((acc, q) => acc + 30, 0);
  const totalMinutes = Math.floor(totalTimeSec / 60);
  const totalSeconds = totalTimeSec % 60;
  const timeDisplay = totalMinutes > 0 ? `${totalMinutes}m ${totalSeconds}s` : `${totalSeconds}s`;

  return (
    <header className="mb-10">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div className="grid gap-2">
          <p className="m-0 text-[12px] font-semibold text-primary uppercase tracking-widest">
            Step 2 of 3 — Configure
          </p>
          <h1 className="m-0 font-manrope text-[clamp(1.5rem,4vw,2.25rem)] font-extrabold tracking-[-0.04em] text-on-surface">
            Configure Your Quiz
          </h1>
          {selectedQuestions.length > 0 && (
            <div className="flex items-center gap-3 text-[13px] text-on-surface-variant">
              <span className="inline-flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <span className="font-semibold text-on-surface">{selectedQuestions.length}</span> questions
              </span>
              <span className="text-on-surface-variant/40">•</span>
              <span className="inline-flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-semibold text-on-surface">{timeDisplay}</span> total
              </span>
            </div>
          )}
          <p className="text-[0.875rem] text-on-surface-variant leading-[1.6] max-w-[44rem] m-0">
            Set quiz parameters and review selected questions. Supports <span className="font-semibold">MCQ</span> and <span className="font-semibold">True / False</span> only.
          </p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full bg-primary-container/50 px-3 py-2 text-[11px] font-bold text-primary shrink-0">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          Live + Self‑paced
        </span>
      </div>
    </header>
  );
}

export default function CreateQuizPage() {
  const [classes, setClasses] = useState<{ id: string; name: string; section: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        await api.auth.getMe();
      } catch {
        // Silently fail — client-side auth will redirect if needed
      }

      try {
        const classesData = await api.classes.getClasses();
        setClasses(
          classesData.map((item) => ({
            id: item.id,
            name: item.name,
            section: item.section,
          }))
        );
      } catch {
        // Silently fail
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader />
      </div>
    );
  }

  return (
    <QuizProvider>
      <div className="pb-12">
        <QuizHeaderContent />

        <CreateQuizForm classes={classes} />
      </div>
    </QuizProvider>
  );
}
