"use client";

import { useAssignment } from "@/components/AssignmentContext";
import Link from "next/link";

export default function AssignmentTray() {
  const { selectedQuestions, removeQuestion } = useAssignment();

  if (selectedQuestions.length === 0) {
    return (
      <div className="sticky top-6 hidden lg:flex flex-col h-[calc(100vh-6rem)] p-4 bg-surface-container-lowest rounded-lg border border-outline-variant">
        <h2 className="text-label-md text-on-surface-variant font-medium mb-4">Assignment Basket</h2>
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

  const totalMarks = selectedQuestions.reduce((acc, q) => acc + q.points, 0);

  return (
    <>
      {/* Desktop Sticky Tray */}
      <div className="sticky top-6 hidden lg:flex flex-col h-[calc(100vh-6rem)] p-4 bg-surface-container-lowest rounded-lg border border-outline-variant">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-label-md text-on-surface-variant font-medium">Assignment Basket</h2>
          <span className="badge bg-primary-container text-on-primary-container">{selectedQuestions.length} Qs</span>
        </div>
        
        <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
          {selectedQuestions.map((q) => (
            <div key={q.id} className="p-3 bg-surface-container-low rounded-lg relative group">
              <button 
                onClick={() => removeQuestion(q.id)}
                className="absolute top-2 right-2 w-6 h-6 rounded-full bg-surface-container hover:bg-error hover:text-white flex items-center justify-center text-on-surface-variant transition-colors"
                title="Remove"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <p className="text-body-sm text-on-surface font-medium pr-6 line-clamp-2">{q.text}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-label-sm text-on-surface-variant">{q.points} {q.points === 1 ? 'Mark' : 'Marks'}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-4 mt-4 border-t border-outline-variant">
          <div className="flex justify-between items-center mb-4">
            <span className="text-body-sm text-on-surface-variant">Total Marks</span>
            <span className="text-headline-xs">{totalMarks}</span>
          </div>
          <Link href="/teacher/assignments/create" className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-br from-primary to-primary-dim text-on-primary text-sm font-medium leading-[1.3] tracking-[0.02em] rounded-sm transition-all duration-150 ease-out hover:opacity-90 hover:shadow-sm active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed w-full justify-center">
            Continue to Publish →
          </Link>
        </div>
      </div>

      {/* Mobile/Tablet Floating Action Card */}
      <div className="lg:hidden fixed left-1/2 z-40 w-[calc(100%-1.5rem)] max-w-md -translate-x-1/2 bottom-[calc(env(safe-area-inset-bottom)+4.75rem)]">
        <div className="rounded-2xl border border-outline-variant/25 bg-[var(--color-surface-container-lowest)]/98 px-4 py-3 shadow-[0_14px_32px_rgba(0,0,0,0.14)] backdrop-blur-xl">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <span className="block text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-on-surface-variant">
                Ready to review
              </span>
              <span className="block text-sm font-semibold text-on-surface">
                {selectedQuestions.length} Questions · {totalMarks} Marks
              </span>
            </div>
            <Link
              href="/teacher/assignments/create"
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-primary to-primary-dim px-4 py-3 text-center text-sm font-medium leading-[1.3] tracking-[0.02em] text-on-primary no-underline transition-all duration-150 ease-out hover:opacity-90 hover:shadow-sm active:scale-[0.98] sm:w-auto sm:px-5 sm:py-2.5"
            >
              Continue to Publish
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
