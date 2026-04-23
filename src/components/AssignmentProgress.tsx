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
      {/* Assignment Header with live progress */}
      <header className="mb-5 md:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 sm:gap-4 mb-3 md:mb-4">
          <div>
            <span className="text-[0.7rem] sm:text-[0.8rem] font-medium tracking-wide uppercase mb-0.5 block" style={{ color: "var(--color-primary)" }}>
              Ongoing Assessment
            </span>
            <h1 className="text-xl sm:text-2xl md:text-[2rem] font-semibold tracking-tight leading-tight" style={{ color: "var(--color-on-surface)" }}>
              {assignment.title}
            </h1>
            {assignment.description && (
              <p className="text-xs sm:text-sm mt-1" style={{ color: "var(--color-on-surface-variant)" }}>
                {assignment.description}
              </p>
            )}
          </div>
          <div className="text-left sm:text-right shrink-0">
            <p className="text-[0.6rem] sm:text-xs font-bold tracking-tight uppercase" style={{ color: "var(--color-primary)" }}>
              Progress
            </p>
            <p className="text-sm sm:text-base md:text-lg font-semibold" style={{ color: "var(--color-on-surface)" }}>
              {answered} / {total}
            </p>
          </div>
        </div>
        {/* M3 Linear Progress Indicator */}
        <div className="w-full h-1 rounded-full overflow-hidden" style={{ background: "var(--color-surface-variant)" }}>
          <div
            className="h-full rounded-full transition-all duration-500 ease-in-out"
            style={{ width: `${progressPercent}%`, background: "var(--color-primary)" }}
          />
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
