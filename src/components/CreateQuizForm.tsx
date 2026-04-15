"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useQuiz } from "@/components/QuizContext";
import { api } from "@/lib/api";
import Loader from "@/components/Loader";
import QuizTray from "@/components/QuizTray";

interface ClassType {
  id: string;
  name: string;
  section: string;
}

const SUPPORTED_TYPES = new Set(["MCQ", "TRUE_FALSE", "MULTIPLE_CHOICE"]);

export default function CreateQuizForm({ classes }: { classes: ClassType[] }) {
  const { selectedQuestions, clearSelection } = useQuiz();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [publishSelfPaced, setPublishSelfPaced] = useState(true);
  const [timePerQuestionSec, setTimePerQuestionSec] = useState<number>(30);
  const [result, setResult] = useState<{
    quizId: string;
    title: string;
    sessionId?: string;
    sessionCode?: string;
    selfPacedCode?: string;
  } | null>(null);

  // With separate quiz context, we expect only quiz-compatible questions
  // Filter as safety measure but ideally question bank should prevent non-compatible selection
  const supportedQuestions = selectedQuestions.filter((q) => SUPPORTED_TYPES.has(q.type));
  const totalMarks = supportedQuestions.reduce((acc, q) => acc + (q.points ?? 1), 0);

  const handleCreate = (formData: FormData) => {
    startTransition(async () => {
      setError(null);
      try {
        const title = String(formData.get("title") ?? "").trim();
        if (!title) {
          setError("Please enter a quiz title.");
          return;
        }
        if (!selectedClassId) {
          setError("Please select a class.");
          return;
        }
        if (supportedQuestions.length === 0) {
          setError("Add at least one MCQ/True-False question to the tray before finalizing.");
          return;
        }

        const created = await api.quizzes.create({
          title,
          classId: selectedClassId,
          description: `Quiz for class ${selectedClassId}`,
          questionIds: supportedQuestions.map((q) => q.id),
          questionPointsMap: supportedQuestions.reduce((acc, q) => {
            acc[q.id] = q.points ?? 1;
            return acc;
          }, {} as Record<string, number>),
          timePerQuestionSec,
        });

        let publishedCode: string | undefined;
        if (publishSelfPaced) {
          const published = await api.quizzes.publishSelfPaced(created.id);
          publishedCode = published.selfPacedCode;
        }

        clearSelection();

        setResult({
          quizId: created.id,
          title,
          selfPacedCode: publishedCode,
        });
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to create quiz.");
      }
    });
  };

  const handleStartLive = () => {
    if (!result) return;
    startTransition(async () => {
      setError(null);
      try {
        const started = await api.quizzes.startSession(result.quizId);
        setResult((prev) =>
          prev
            ? {
                ...prev,
                sessionId: started.sessionId,
                sessionCode: started.sessionCode,
              }
            : prev
        );
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to start live session.");
      }
    });
  };

  if (result) {
    const selfPacedLink = result.selfPacedCode
      ? `${window.location.origin}/student/quizzes/${result.selfPacedCode}`
      : null;

    return (
      <div className="grid gap-6">
        <section className="bg-surface-container-lowest rounded-lg p-10 shadow-sm text-center">
          <div className="w-20 h-20 rounded-full bg-primary-container text-primary flex items-center justify-center mx-auto mb-6">
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-label-sm text-primary m-0">Quiz Ready</p>
          <h2 className="font-manrope text-[clamp(2rem,4vw,3rem)] font-extrabold tracking-[-0.04em] text-on-surface mt-3 mb-0">
            {result.title}
          </h2>
          <p className="text-on-surface-variant text-[0.9375rem] leading-[1.7] max-w-[36rem] mx-auto mt-4 mb-6">
            Publish a self‑paced code for practice, or start a live session for in‑class hosting.
          </p>

          {result.selfPacedCode ? (
            <div className="inline-flex flex-col items-center gap-3 bg-primary-container/30 rounded-xl px-8 py-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-on-primary-container m-0">
                Self‑Paced Code
              </p>
              <code className="text-3xl font-extrabold tracking-[0.15em] text-primary font-mono">
                {result.selfPacedCode}
              </code>
              {selfPacedLink ? (
                <button
                  type="button"
                  onClick={() => navigator.clipboard.writeText(selfPacedLink)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium leading-[1.3] tracking-[0.02em] rounded-sm transition-all duration-150 ease-out hover:opacity-90 hover:shadow-sm active:scale-[0.98]"
                  style={{ background: "linear-gradient(145deg, var(--color-primary), var(--color-primary-dim))", color: "var(--color-on-primary)" }}
                >
                  Copy Link
                </button>
              ) : null}
              <p className="text-xs text-on-primary-container/70 m-0">
                Students open <span className="font-semibold">Student Portal → Quizzes</span>
              </p>
            </div>
          ) : (
            <div className="inline-flex flex-col items-center gap-3 bg-surface-container-low rounded-xl px-8 py-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant m-0">
                Self‑Paced
              </p>
              <p className="m-0 text-sm text-on-surface-variant">
                Not published yet. You can publish from the quiz details page.
              </p>
            </div>
          )}
        </section>

        {error ? (
          <div className="rounded-md border border-error/20 bg-error-container/50 py-3 px-4 text-[0.8125rem] leading-[1.6] text-on-surface">
            {error}
          </div>
        ) : null}

        <section className="bg-surface-container-lowest rounded-lg p-8 shadow-sm">
          <h3 className="m-0 text-lg font-bold text-on-surface">Live Session</h3>
          <p className="mt-2 mb-0 text-sm text-on-surface-variant leading-[1.7]">
            Start a live quiz session, share the join code, and control the flow question‑by‑question.
          </p>

          <div className="mt-6 flex gap-3 flex-wrap items-center">
            {result.sessionId ? (
              <>
                <span className="text-xs font-bold px-3 py-2 rounded-full" style={{ background: "var(--color-primary-container)", color: "var(--color-on-primary-container)" }}>
                  Join code: {result.sessionCode}
                </span>
                <Link href={`/teacher/quizzes/session/${result.sessionId}`} className="btn-ghost">
                  Open Host Console
                </Link>
              </>
            ) : (
              <button
                type="button"
                onClick={handleStartLive}
                disabled={isPending}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-sm text-sm font-bold transition-all active:scale-95 disabled:opacity-75 disabled:cursor-wait"
                style={{ background: "linear-gradient(145deg, var(--color-primary), var(--color-primary-dim))", color: "var(--color-on-primary)" }}
              >
                {isPending ? <Loader size="sm" color="currentColor" label="Starting…" /> : "Start Live Session"}
              </button>
            )}

            <Link href={`/teacher/quizzes/${result.quizId}`} className="btn-ghost">
              View Quiz Details
            </Link>
          </div>
        </section>
      </div>
    );
  }

   if (selectedQuestions.length === 0) {
     return (
       <section className="bg-surface-container-lowest rounded-lg py-12 px-8 border border-dashed border-outline/25 text-center">
         <div className="w-16 h-16 rounded-full bg-surface-container-low text-primary flex items-center justify-center mx-auto mb-5">
           <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
             <path d="M12 5v14" />
             <path d="M5 12h14" />
           </svg>
         </div>
         <h2 className="m-0 text-2xl font-bold text-on-surface">
           No questions selected yet
         </h2>
         <p className="mt-4 mx-auto mb-0 text-on-surface-variant max-w-[30rem] leading-[1.7]">
           Select MCQ/True‑False questions from the Question Bank below to build your quiz.
         </p>
         <div className="mt-6">
           <Link href="/teacher/question-bank?context=quiz" className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-on-primary text-sm font-medium leading-[1.3] tracking-[0.02em] rounded-sm transition-all duration-150 ease_out hover:opacity-90 hover:shadow-sm active:scale-[0.98]" style={{ background: "linear-gradient(145deg, var(--color-primary), var(--color-primary-dim))" }}>
             Browse Question Bank
           </Link>
         </div>
       </section>
     );
   }

  return (
    <form action={handleCreate} className="grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(20rem,24rem)] lg:items-start gap-6">
       {/* Removed duplicate question summary - now handled by QuizTray */}

      <aside className="grid gap-6">
        <section className="bg-surface-container-lowest rounded-lg p-8 shadow-sm">
          <h2 className="m-0 text-lg font-bold text-on-surface">
            Quiz Settings
          </h2>

          <div className="mt-6 grid gap-5">
            <div>
              <label htmlFor="quiz-title" className="text-label-sm text-on-surface-variant block mb-2">
                Quiz Title
              </label>
              <input
                id="quiz-title"
                name="title"
                required
                placeholder="e.g. Algebra Exit Ticket"
                className="w-full rounded-md border border-outline-variant/15 bg-surface-container-low px-4 py-3 text-on-surface outline-none transition-all placeholder:text-on-surface-variant/70 focus:border-primary focus:ring-2 focus:ring-primary/10"
              />
            </div>

            <div>
              <label htmlFor="quiz-class" className="text-label-sm text-on-surface-variant block mb-2">
                Target Class
              </label>
              <select
                id="quiz-class"
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="w-full rounded-md border border-outline-variant/15 bg-surface-container-low px-4 py-3 text-on-surface outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10 [&>option]:text-on-surface"
              >
                <option value="" disabled>
                  {classes.length === 0 ? "No classes yet" : "Select a class"}
                </option>
                {classes.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} • Section {item.section}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="quiz-time" className="text-label-sm text-on-surface-variant block mb-2">
                Time per Question (seconds)
              </label>
              <input
                id="quiz-time"
                type="number"
                min={5}
                max={300}
                value={timePerQuestionSec}
                onChange={(e) => setTimePerQuestionSec(Number(e.target.value))}
                className="w-full rounded-md border border-outline-variant/15 bg-surface-container-low px-4 py-3 text-on-surface outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10"
              />
            </div>

            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={publishSelfPaced}
                onChange={(e) => setPublishSelfPaced(e.target.checked)}
                className="mt-1"
              />
              <span className="text-sm text-on-surface-variant leading-[1.6]">
                Publish self‑paced code immediately (recommended)
              </span>
            </label>
          </div>

          {error ? (
            <div className="mt-5 rounded-md border border-error/20 bg-error-container/50 py-3 px-4 text-[0.8125rem] leading-[1.6] text-on-surface">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={isPending}
            className="mt-6 w-full rounded-xl border-none px-5 py-4 font-extrabold tracking-[0.04em] uppercase text-on-primary shadow-[0_8px_18px_rgba(48,51,47,0.10)] disabled:cursor-wait disabled:opacity-75 cursor-pointer"
            style={{ background: "linear-gradient(145deg, var(--color-primary), var(--color-primary-dim))", color: "var(--color-on-primary)" }}
          >
            {isPending ? <Loader size="sm" color="currentColor" label="Creating…" /> : "Create Quiz"}
          </button>

          <p className="mt-4 mb-0 text-[0.8125rem] leading-[1.7] text-on-surface-variant">
            After creating, you can start a live session from the confirmation screen or the quiz details page.
          </p>
        </section>
      </aside>
    </form>
  );
}

