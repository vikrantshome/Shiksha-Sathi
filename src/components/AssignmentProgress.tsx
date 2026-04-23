"use client";

import { useState, useCallback } from "react";
import StudentAssignmentForm from "./StudentAssignmentForm";
import type { AssignmentByLinkResponse } from "@/lib/api/types";

/* ─────────────────────────────────────────────────────────
   Assignment Progress Tracker
   Client component that wraps the assignment form to track
   progress and update the header live.
   ───────────────────────────────────────────────────────── */

export default function AssignmentProgress({
  assignment,
}: {
  assignment: AssignmentByLinkResponse;
}) {
  const [answered, setAnswered] = useState(0);
  const total = assignment.questions.length;
  const progressPercent = total > 0 ? (answered / total) * 100 : 0;

  // Memoized to prevent infinite re-render loop
  const handleProgress = useCallback((a: number) => setAnswered(a), []);

  return (
    <>
      {/* Assignment Header Card */}
      <header className="mb-8 card-elevated p-6 md:p-8" style={{ background: "var(--color-surface-container-low)" }}>
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="badge" style={{ background: "var(--color-primary-container)", color: "var(--color-on-primary-container)" }}>
                Ongoing Assessment
              </span>
              <span className="text-xs font-medium" style={{ color: "var(--color-on-surface-variant)" }}>
                ID: {assignment.id.split('-')[0].toUpperCase()}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight" style={{ color: "var(--color-on-surface)" }}>
              {assignment.title}
            </h1>
            {assignment.description && (
              <p className="text-sm leading-relaxed max-w-2xl" style={{ color: "var(--color-on-surface-variant)" }}>
                {assignment.description}
              </p>
            )}
          </div>
          
          <div className="flex flex-col items-start md:items-end justify-center min-w-[140px]">
            <span className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "var(--color-primary)" }}>
              Completion
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold" style={{ color: "var(--color-on-surface)" }}>{Math.round(progressPercent)}%</span>
              <span className="text-sm font-medium" style={{ color: "var(--color-on-surface-variant)" }}>done</span>
            </div>
            <p className="text-xs mt-1 font-medium" style={{ color: "var(--color-on-surface-variant)" }}>
              {answered} of {total} questions
            </p>
          </div>
        </div>

        {/* Integrated M3 Linear Progress */}
        <div className="relative pt-2">
          <div 
            className="w-full h-2 rounded-full overflow-hidden" 
            style={{ background: "var(--color-surface-container-highest)" }}
          >
            <div
              className="h-full rounded-full transition-all duration-700 ease-out"
              style={{ 
                width: `${progressPercent}%`, 
                background: "var(--color-primary)",
                boxShadow: "0 0 8px var(--color-primary-container)"
              }}
            />
          </div>
        </div>
      </header>

      {/* Question Sequence */}
      <StudentAssignmentForm
        assignment={assignment}
        onProgressChange={handleProgress}
      />
    </>
  );
}
