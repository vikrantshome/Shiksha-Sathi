"use client";

import Link from "next/link";
import { useAssignment } from "./AssignmentContext";

export default function CartIcon() {
  const { selectedQuestions } = useAssignment();

  return (
    <Link
      href="/teacher/assignments/create"
      className="relative flex items-center p-2 text-on-surface-variant no-underline transition-colors hover:text-primary hover:no-underline"
      aria-label={`Create Assignment${selectedQuestions.length > 0 ? ` (${selectedQuestions.length} questions selected)` : ""}`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="h-5 w-5"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184"
        />
      </svg>
      {selectedQuestions.length > 0 && (
        <span
          className="absolute top-0 right-[-2px] flex min-w-[1.125rem] h-[1.125rem] items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-dim px-1 text-[0.625rem] font-semibold tracking-wide leading-none text-on-primary"
        >
          {selectedQuestions.length}
        </span>
      )}
    </Link>
  );
}
