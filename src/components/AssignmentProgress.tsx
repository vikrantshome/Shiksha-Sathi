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
      <header className="mb-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-4">
          <div>
            <span className="text-[0.875rem] font-medium tracking-wide uppercase mb-1 block" style={{ color: "var(--color-m3-primary)" }}>
              Ongoing Assessment
            </span>
            <h1 className="text-[2rem] font-semibold tracking-tight" style={{ color: "var(--color-m3-on-surface)" }}>
              {assignment.title}
            </h1>
            {assignment.description && (
              <p className="text-sm mt-1" style={{ color: "var(--color-m3-on-surface-variant)" }}>
                {assignment.description}
              </p>
            )}
          </div>
          <div className="text-right">
            <p className="text-xs font-bold tracking-tight uppercase" style={{ color: "var(--color-m3-primary)" }}>
              Progress
            </p>
            <p className="text-lg font-semibold" style={{ color: "var(--color-m3-on-surface)" }}>
              {answered} / {total} Answered
            </p>
          </div>
        </div>
        {/* M3 Linear Progress Indicator */}
        <div className="w-full h-1 rounded-full overflow-hidden" style={{ background: "var(--color-m3-surface-variant)" }}>
          <div
            className="h-full rounded-full transition-all duration-500 ease-in-out"
            style={{ width: `${progressPercent}%`, background: "var(--color-m3-primary)" }}
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
