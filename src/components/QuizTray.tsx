"use client";

import { useQuiz } from "@/components/QuizContext";
import Link from "next/link";

/* ─────────────────────────────────────────────────────────
   Quiz Tray — Stitch-Directed
   Design Source: Similar to AssignmentTray but for quizzes
   Implements:
     - Bento summary: questions count, total points
     - Numbered selected items list with hover-remove
     - Clear action buttons
   ───────────────────────────────────────────────────────── */

export default function QuizTray() {
  const { selectedQuestions, removeQuestion, clearSelection } = useQuiz();

  if (selectedQuestions.length === 0) {
    return (
      <div className="sticky top-6 hidden lg:flex flex-col h-[calc(100vh-6rem)] p-4 bg-surface-container-lowest rounded-lg border border-outline-variant/10">
        <h2 className="text-label-md text-on-surface-variant font-medium mb-4">Quiz Basket</h2>
        <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
          <div className="w-12 h-12 bg-surface-container rounded-full flex items-center justify-center mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-on-surface-variant">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </div>
          <p className="text-body-sm text-on-surface-variant mb-2">No questions selected</p>
          <p className="text-label-sm text-on-surface-variant/70">Click + on questions to add them</p>
        </div>
      </div>
    );
  }

  const totalMarks = selectedQuestions.reduce((acc, q) => acc + (q.points || 1), 0);

  return (
    <>
      {/* Desktop Sticky Tray — "Quiz Draft" */}
      <div className="sticky top-6 hidden lg:flex flex-col h-[calc(100vh-6rem)] p-4 bg-surface-container-lowest rounded-lg border border-outline-variant/10">
        <div className="mb-4">
          <h3 className="text-base font-bold text-primary m-0">Quiz Draft</h3>
          <p className="text-[0.5625rem] text-on-surface-variant font-medium uppercase tracking-widest mt-0.5">In Progress</p>
        </div>

        {/* Bento Summary */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="bg-surface-container-low p-3 rounded-lg flex flex-col gap-0.5">
            <span className="text-xl font-extrabold text-primary">{selectedQuestions.length}</span>
            <span className="text-[0.5625rem] text-on-surface-variant font-bold uppercase tracking-tighter leading-tight">Questions</span>
          </div>
          <div className="bg-surface-container-low p-3 rounded-lg flex flex-col gap-0.5">
            <span className="text-xl font-extrabold text-primary">{totalMarks}</span>
            <span className="text-[0.5625rem] text-on-surface-variant font-bold uppercase tracking-tighter leading-tight">Total Points</span>
          </div>
        </div>

        {/* Selected Items List */}
        <div className="flex-1 overflow-y-auto pr-1 -mx-1 px-1 space-y-3 custom-scrollbar mb-4">
          <h4 className="text-[0.5625rem] font-bold text-on-surface-variant/50 uppercase tracking-widest mb-2 sticky top-0 bg-surface-container-lowest py-1">
            Selected Items
          </h4>
          {selectedQuestions.map((q, i) => (
            <div key={q.id} className="flex items-start gap-2 group">
              <div className="w-6 h-6 rounded bg-secondary-container flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-[0.5625rem] font-bold text-primary">{String(i + 1).padStart(2, "0")}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-on-surface truncate">{q.text}</p>
                <span className="text-[0.5625rem] text-on-surface-variant/70">{q.type.replace(/_/g, " ")} · {q.points} pts</span>
              </div>
              <button
                onClick={() => removeQuestion(q.id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 text-on-surface-variant/40 hover:text-error shrink-0 cursor-pointer bg-transparent border-none"
                title="Remove"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>

        {/* Footer Actions */}
        <div className="pt-3 mt-2 border-t border-outline-variant/10">
          <div className="mb-3 flex justify-between items-center px-1">
            <span className="text-[0.5625rem] font-bold text-on-surface-variant uppercase tracking-tight">Ready to Create</span>
          </div>
          <Link
            href="/teacher/quizzes/create"
            className="w-full py-3 px-4 rounded-lg text-xs font-bold tracking-tight shadow-[0_10px_20px_-5px_rgba(68,99,113,0.25)] hover:translate-y-[-1px] active:translate-y-[0px] transition-all flex items-center justify-center gap-2 no-underline"
            style={{ background: "linear-gradient(145deg, var(--color-primary), var(--color-primary-dim))", color: "var(--color-on-primary)" }}
          >
            Create Quiz
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>
      </div>

      {/* Mobile/Tablet Floating Selection Pill */}
      <div className="lg:hidden fixed left-1/2 z-40 w-[calc(100%-1.5rem)] max-w-md -translate-x-1/2 bottom-[calc(env(safe-area-inset-bottom)+4.75rem)]">
        <div className="rounded-full border border-outline-variant/10 bg-[var(--color-primary)] px-4 py-3 shadow-[0_14px_32px_rgba(68,99,113,0.20)] backdrop-blur-xl">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-full bg-[var(--color-primary-container)] flex items-center justify-center shrink-0">
                <span className="text-sm font-bold text-primary">{selectedQuestions.length}</span>
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-[var(--color-on-primary)] tracking-tight leading-tight">Questions Selected</p>
                <p className="text-[0.5625rem] opacity-60 uppercase tracking-widest font-medium text-[var(--color-on-primary)]">{totalMarks} Marks</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={clearSelection}
                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-full text-[0.5625rem] font-bold uppercase tracking-widest transition-colors text-[var(--color-on-primary)] cursor-pointer border-none"
              >
                Clear All
              </button>
              <Link
                href="/teacher/quizzes/create"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[var(--color-primary-container)] text-primary rounded-full text-[0.6875rem] font-bold shadow-lg hover:scale-[1.03] active:scale-[0.97] transition-transform no-underline"
              >
                Create Quiz
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}