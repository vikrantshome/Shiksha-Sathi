"use client";

import { useState } from "react";
import { Question } from "@/lib/api/types";
import { useAssignment } from "./AssignmentContext";

/* ─────────────────────────────────────────────────────────
   Question Card — Stitch-Directed Redesign
   Design Source: doc/stitch_shiksha_sathi_ui_refresh/question_bank
   Implements: left-border accent for selected cards,
   type badge pills (MCQ/Fill in Blanks/True-False),
   source label (NCERT EXAMPLAR, etc.), selection checkbox,
   expandable preview with detailed explanation, and
   metadata chips (Weightage, Avg. Time).
   ───────────────────────────────────────────────────────── */

/* ── Type Badge Color Map ── */
const typeBadgeClasses: Record<string, string> = {
  MCQ: "bg-primary-container text-on-primary-container",
  TRUE_FALSE: "bg-secondary-container text-on-secondary-container",
  FILL_IN_BLANKS: "bg-tertiary-container text-on-tertiary-container",
};

const getTypeBadge = (type: string) => {
  const className = typeBadgeClasses[type] || typeBadgeClasses["MCQ"];
  const label = type.replace(/_/g, " ");
  return { className, label };
};

export default function QuestionCard({ question: q }: { question: Question }) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const { toggleQuestion, isSelected } = useAssignment();

  const selected = isSelected(q.id);
  const badge = getTypeBadge(q.type);

  return (
    <div
      className={`group relative overflow-hidden bg-surface-container-lowest transition-all duration-300 ease-out border-l-4 border-y border-r border-y-transparent border-r-transparent hover:border-outline-variant/20 ${
        selected ? "border-l-primary shadow-[0_1px_4px_rgba(48,51,47,0.08)]" : "border-l-transparent shadow-none"
      }`}
    >
      {/* ═══ Card Content ═══ */}
      <div className="p-6">
        {/* Meta Row: Type Badge + Chapter/Level + Source + Selection */}
        <div className="mb-4 flex items-start justify-between">
          <div className="flex flex-wrap items-center gap-2">
            {/* Type Badge */}
            <span
              className={`rounded-full px-2 py-[2px] text-[0.625rem] font-bold tracking-[0.08em] uppercase ${badge.className}`}
            >
              {badge.label}
            </span>
            {/* Chapter/Topic */}
            <span className="text-xs font-medium text-on-surface-variant">
              {q.topic}
            </span>
            {/* Difficulty Dot */}
            {q.provenance && (
              <>
                <span className="inline-block h-[3px] w-[3px] rounded-full bg-outline-variant" />
                <span className="text-xs font-medium text-on-surface-variant">
                  Class {q.provenance.classLevel}
                </span>
              </>
            )}
          </div>

          {/* Source + Selection Circle */}
          <div className="flex items-center gap-3">
            <span className="text-[0.625rem] font-bold tracking-wider text-on-surface-variant uppercase">
              SOURCE: {q.sourceKind || "LOCAL"}
            </span>

            {/* Selection Checkbox Circle */}
            <button
              type="button"
              onClick={() => toggleQuestion(q)}
              className={`flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded-full border-0 p-0 transition-all duration-150 ease-out ${
                selected
                  ? "bg-primary"
                  : "bg-transparent ring-1 ring-inset ring-outline-variant/30"
              }`}
              aria-label={selected ? "Remove from assignment" : "Add to assignment"}
            >
              {selected && (
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Question Text */}
        <p className="mb-6 text-base font-medium leading-relaxed text-on-surface">
          {q.text}
        </p>

        {/* MCQ Options Grid */}
        {q.options && (
          <div className="mb-6 grid grid-cols-[repeat(auto-fit,minmax(14rem,1fr))] gap-3">
            {q.options.map((opt, i) => {
              const isCorrect = q.correctAnswer ===  opt || q.correctAnswer === String.fromCharCode(65 + i);
              return (
                <div
                  key={i}
                  className={`flex cursor-pointer items-center gap-3 rounded-md p-3 transition-all duration-200 ease-out hover:bg-surface-container-low ${
                    isCorrect && isPreviewOpen
                      ? "border border-primary/20 bg-primary/5 hover:bg-primary/10"
                      : "border border-outline-variant/10 bg-transparent"
                  }`}
                >
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                      isCorrect && isPreviewOpen
                        ? "bg-primary text-white"
                        : "bg-surface-container text-on-surface-variant"
                    }`}
                  >
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span className={`text-sm ${isCorrect && isPreviewOpen ? "font-medium" : "font-normal"}`}>
                    {opt}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Action Row: Preview Toggle + Action Buttons */}
        <div className="flex items-center justify-between border-t border-outline-variant/10 pt-4">
          <button
            type="button"
            onClick={() => setIsPreviewOpen(!isPreviewOpen)}
            className="flex cursor-pointer items-center gap-2 border-0 bg-transparent p-0 text-[0.6875rem] font-bold tracking-widest text-primary uppercase"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`transition-transform duration-200 ease-out ${
                isPreviewOpen ? "rotate-180" : "rotate-0"
              }`}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
            {isPreviewOpen ? "Hide Explanation" : "Preview Question"}
          </button>

          <div className="flex gap-4">
            {/* Add to Assignment */}
            <button
              type="button"
              onClick={() => toggleQuestion(q)}
              className={`cursor-pointer border-0 bg-transparent p-0 transition-colors duration-150 ease-out ${
                selected ? "text-primary" : "text-on-surface-variant hover:text-primary"
              }`}
              title={selected ? "Remove from assignment" : "Add to assignment"}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill={selected ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </button>
            {/* Copy */}
            <button
              type="button"
              className="cursor-pointer border-0 bg-transparent p-0 text-on-surface-variant transition-colors hover:text-primary"
              title="Copy question"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* ═══ Expanded Explanation Area ═══ */}
      {isPreviewOpen && (
        <div className="border-t border-outline-variant/10 bg-surface-container-low p-6">
          <div className="grid grid-cols-1 gap-4">
            {/* Correct Answer */}
            <div>
              <h4 className="mb-1 text-[0.625rem] font-bold tracking-widest text-on-surface-variant uppercase">
                Correct Answer
              </h4>
              <p className="m-0 text-sm font-semibold text-primary">
                {q.correctAnswer}
              </p>
            </div>

            {/* Detailed Explanation */}
            {q.explanation && (
              <div>
                <h4 className="mb-1 text-[0.625rem] font-bold tracking-widest text-on-surface-variant uppercase">
                  Detailed Explanation
                </h4>
                <p className="m-0 text-sm leading-relaxed text-on-surface">
                  {q.explanation}
                </p>
              </div>
            )}

            {/* Metadata Chips */}
            <div className="flex gap-4">
              <div className="rounded-sm border border-outline-variant/10 bg-surface-container-lowest px-3 py-1">
                <p className="m-0 text-[0.5625rem] font-bold text-on-surface-variant uppercase">
                  Weightage
                </p>
                <p className="m-0 text-sm font-bold text-primary">
                  {q.points} Point{q.points !== 1 ? "s" : ""}
                </p>
              </div>

              {q.provenance && (
                <div className="rounded-sm border border-outline-variant/10 bg-surface-container-lowest px-3 py-1">
                  <p className="m-0 text-[0.5625rem] font-bold text-on-surface-variant uppercase">
                    Source
                  </p>
                  <p className="m-0 text-sm font-bold text-primary">
                    {q.provenance.book}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
