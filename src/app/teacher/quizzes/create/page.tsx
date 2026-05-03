"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import CreateQuizForm from "@/components/CreateQuizForm";
import { QuizProvider } from "@/components/QuizContext";
import Loader from "@/components/Loader";

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
        <header className="mb-8 flex items-end justify-between gap-4 flex-wrap">
          <div className="grid gap-2">
            <p className="m-0 text-label-sm text-on-surface-variant">
              Review &amp; Publish
            </p>
            <h1 className="m-0 font-headline text-[clamp(2rem,4vw,2.75rem)] font-extrabold tracking-[-0.04em] text-primary">
              Finalize Your Quiz
            </h1>
            <p className="text-[0.9375rem] text-on-surface-variant leading-[1.7] max-w-[44rem] m-0">
              Quizzes support <span className="font-semibold">MCQ</span> and <span className="font-semibold">True / False</span> only. Use the Question Bank tray to pick questions, then publish a self‑paced code or start a live session.
            </p>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full bg-surface-container-low px-3 py-2 text-xs font-bold text-on-surface-variant">
            <span className="w-2 h-2 rounded-full bg-primary" />
            Live + self‑paced
          </span>
        </header>

        <CreateQuizForm classes={classes} />
      </div>
    </QuizProvider>
  );
}
