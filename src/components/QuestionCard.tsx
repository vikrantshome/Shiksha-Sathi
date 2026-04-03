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
      role="button"
      tabIndex={0}
      onClick={() => toggleQuestion(q)}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleQuestion(q); } }}
      className={`group relative overflow-hidden rounded-lg bg-surface-container-lowest transition-all duration-300 ease-out border border-outline-variant/12 cursor-pointer hover:border-outline-variant/30 hover:shadow-[0_6px_20px_rgba(48,51,47,0.08)] ${
        selected
          ? "border-emerald-500/50 bg-emerald-50/50 shadow-[0_0_0_1px_rgba(34,197,94,0.22),0_10px_26px_rgba(34,197,94,0.10)]"
          : "shadow-[0_4px_14px_rgba(48,51,47,0.05)]"
      }`}
    >
      <div
        className={`absolute inset-x-0 top-0 h-1 transition-colors duration-200 ${
          selected ? "bg-emerald-500" : "bg-surface-container-high"
        }`}
      />

      {/* ═══ Card Content ═══ */}
      <div className="p-5 md:p-6">
        {/* Meta Row: Type Badge + Source + Checkbox */}
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {/* Type Badge */}
            <span
              className={`rounded-full px-2 py-[2px] text-[0.625rem] font-bold tracking-[0.08em] uppercase ${badge.className}`}
            >
              {badge.label}
            </span>
            {q.provenance && (
              <span className="rounded-full bg-surface-container px-2 py-[2px] text-[0.625rem] font-bold tracking-[0.08em] uppercase text-on-surface-variant">
                {q.sourceKind || "LOCAL"}
              </span>
            )}
          </div>

          <label
            className="inline-flex items-center gap-2 cursor-pointer group/checkbox"
            onClick={(e) => e.stopPropagation()}
          >
            <input
              type="checkbox"
              checked={selected}
              onChange={() => toggleQuestion(q)}
              className="sr-only"
              aria-label={selected ? "Remove from assignment" : "Add to assignment"}
            />
            <span
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-all duration-150 ease-out ${
                selected
                  ? "border-emerald-600 bg-emerald-600"
                  : "border-outline-variant/40 bg-transparent group-hover/checkbox:border-emerald-400"
              }`}
            >
              {selected && (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </span>
          </label>
        </div>

        {/* Question Text */}
        <p className="mb-5 text-base font-medium leading-relaxed text-on-surface">
          {q.text}
        </p>

        <div className="mb-5 flex flex-wrap items-center gap-2 text-xs text-on-surface-variant">
          {q.topic && (
            <span className="inline-flex items-center rounded-full bg-surface-container-low px-2.5 py-1">
              {q.topic}
            </span>
          )}
        </div>

        {/* MCQ Options Grid */}
        {q.options && (
          <div className="mb-5 grid grid-cols-[repeat(auto-fit,minmax(14rem,1fr))] gap-3">
            {q.options.map((opt, i) => {
              const isCorrect = q.correctAnswer ===  opt || q.correctAnswer === String.fromCharCode(65 + i);
              return (
                <div
                  key={i}
                  className={`flex items-center gap-3 rounded-md p-3 transition-all duration-200 ease-out ${
                    isCorrect && isPreviewOpen
                      ? "border border-emerald-500/50 bg-emerald-50/80"
                      : "border border-outline-variant/10 bg-surface-container-lowest hover:bg-surface-container hover:border-outline-variant/20"
                  }`}
                >
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                      isCorrect && isPreviewOpen
                        ? "bg-emerald-600 text-white"
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

        {/* Action Row: Preview Toggle + Add to Assignment */}
        <div className="flex items-center justify-between gap-3 border-t border-outline-variant/10 pt-4">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setIsPreviewOpen(!isPreviewOpen); }}
            className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 border-0 bg-transparent text-[0.6875rem] font-bold tracking-widest text-primary uppercase transition-colors duration-150 ease-out hover:bg-primary/5"
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
            {isPreviewOpen ? "Hide Explanation" : "View Answer & Explanation"}
          </button>

          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); toggleQuestion(q); }}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold border-0 transition-all duration-150 ease-out active:scale-[0.97] ${
              selected
                ? "bg-emerald-600 text-white shadow-[0_4px_12px_rgba(34,197,94,0.25)]"
                : "bg-primary text-on-primary hover:bg-primary-dim hover:shadow-[0_4px_12px_rgba(34,197,94,0.15)]"
            }`}
          >
            {selected ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14" />
                <path d="M5 12h14" />
              </svg>
            )}
            <span>{selected ? "Added" : "Add to Assignment"}</span>
          </button>
        </div>
      </div>

      {/* ═══ Expanded Explanation Area ═══ */}
      {isPreviewOpen && (
        <div className={`border-t border-outline-variant/10 p-5 md:p-6 ${
          selected ? "bg-emerald-50/40" : "bg-surface-container-low"
        }`}>
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
