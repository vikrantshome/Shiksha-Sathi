"use client";

import { useState } from "react";
import { Question } from "@/lib/api/types";
import { useAssignment } from "./AssignmentContext";
import { useQuiz } from "./QuizContext";

/* ── Type Badge Color Map ── */
const typeBadgeClasses: Record<string, string> = {
  MCQ: "bg-primary/10 text-primary",
  TRUE_FALSE: "bg-secondary/10 text-secondary",
  FILL_IN_BLANKS: "bg-tertiary-container text-on-tertiary-container",
  SHORT_ANSWER: "bg-secondary/10 text-secondary",
};

const getTypeBadge = (type: string) => {
  const className = typeBadgeClasses[type] || typeBadgeClasses["MCQ"];
  const label = type.replace(/_/g, " ");
  return { className, label };
};

/* ── Difficulty Badge (colored) ── */
const getDifficultyBadge = (points: number) => {
  if (points <= 1) return { label: "Easy", className: "bg-emerald-50 text-emerald-700" };
  if (points <= 3) return { label: "Medium", className: "bg-surface-container text-on-surface-variant" };
  return { label: "Hard", className: "bg-error-container text-error" };
};

/* ── Dummy usage count (stable per question ID) ── */
const getUsageCount = (id: string): number => {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = ((hash << 5) - hash) + id.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash % 30) + 2;
};

/* ── Formatted Source Label ── */
const getSourceLabel = (q: Question): string => {
  if (q.sourceKind === "CANONICAL") return "NCERT";
  if (q.sourceKind === "DERIVED") return "Practice";
  if (q.provenance?.book) {
    if (q.provenance.book.toLowerCase().includes("exemplar")) return "NCERT Exemplar";
    return q.provenance.book;
  }
  return "LOCAL";
};

export default function QuestionCard({ question: q, mode = "assignment" }: { question: Question; mode?: "assignment" | "quiz" }) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const assignmentCtx = useAssignment();
  const quizCtx = useQuiz();
  const { toggleQuestion, isSelected } = mode === "quiz" ? { toggleQuestion: quizCtx.toggleQuestion, isSelected: quizCtx.isSelected } : assignmentCtx;

  const selected = isSelected(q.id);
  const badge = getTypeBadge(q.type);
  const difficultyBadge = getDifficultyBadge(q.points || 1);
  const sourceLabel = getSourceLabel(q);

  return (
    <div
      className={`group bg-surface-container-lowest rounded-xl p-4 md:p-6 transition-all duration-300 relative border border-outline-variant ${
        selected
          ? "border-primary shadow-md shadow-primary/10"
          : "hover:shadow-md hover:border-outline"
      }`}
    >
      {/* ═══ Card Content ═══ */}
      <div>
        {/* Meta Row + Add Button */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex flex-wrap items-center gap-2">
            {/* Type Badge */}
            <span
              className={`rounded-full px-2 py-0.5 text-[0.625rem] font-bold tracking-wider uppercase ${badge.className}`}
            >
              {badge.label}
            </span>
            {/* Difficulty Badge */}
            <span
              className={`rounded-full px-2 py-0.5 text-[0.625rem] font-bold tracking-wider uppercase ${difficultyBadge.className}`}
            >
              {difficultyBadge.label}
            </span>
            {/* Chapter */}
            {q.provenance?.chapterTitle && (
              <>
                <span className="text-xs font-medium text-on-surface-variant">{q.provenance.chapterTitle}</span>
                <span className="w-1 h-1 rounded-full bg-outline-variant" />
              </>
            )}
          </div>

          {/* Add/Check Button — w-10 h-10 rounded-full */}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); toggleQuestion(q); }}
            className={`w-10 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center border transition-all active:scale-95 group/btn ${
              selected
                ? "bg-primary text-on-primary border-primary"
                : "border-outline-variant text-outline hover:bg-primary hover:text-on-primary hover:border-primary"
            }`}
            title={selected ? `Remove from ${mode}` : `Add to ${mode}`}
          >
            {selected ? (
              <svg className="w-4 h-4 md:w-5 md:h-5" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            ) : (
              <svg className="w-4 h-4 md:w-5 md:h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14" /><path d="M5 12h14" />
              </svg>
            )}
          </button>
        </div>

        {/* Question Text */}
        <p className="mb-4 md:mb-6 text-base md:text-lg font-semibold leading-relaxed text-on-surface">
          {q.text}
        </p>

        {/* MCQ Options Grid — correct option highlighted by default */}
        {q.options && (
          <div className="grid grid-cols-1 gap-3 md:gap-4 md:grid-cols-2 mb-4 md:mb-6">
            {q.options.map((opt, i) => {
              const isCorrect = q.correctAnswer === opt || q.correctAnswer === String.fromCharCode(65 + i);
              return (
                <div
                  key={i}
                  className={`p-3 md:p-4 rounded-lg md:rounded-xl text-xs md:text-sm flex items-center gap-2 md:gap-3 transition-all duration-200 ${
                    isCorrect
                      ? "border-2 border-[#1B6B47] bg-[#1B6B47]/10 font-semibold text-[#1B6B47] shadow-sm"
                      : "border border-outline/10 bg-surface-variant/30 font-medium text-on-surface-variant"
                  }`}
                >
                  <span
                    className={`w-5 h-5 md:w-6 md:h-6 rounded-full flex items-center justify-center text-[8px] md:text-[10px] font-bold shrink-0 ${
                      isCorrect
                        ? "bg-[#1B6B47] text-white"
                        : "bg-surface-container-lowest border border-outline-variant text-on-surface-variant"
                    }`}
                  >
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span className="line-clamp-2">{opt}</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Action Row: Preview Toggle */}
        <div className="flex items-center justify-between gap-3 pt-4 border-t border-outline/10">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setIsPreviewOpen(!isPreviewOpen); }}
            className="flex cursor-pointer items-center gap-2 text-xs font-bold text-primary uppercase tracking-widest bg-transparent border-none hover:bg-primary/5 px-2 py-1.5 rounded-lg transition-colors"
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
            {isPreviewOpen ? "Hide Explanation" : "Preview Explanation"}
          </button>
        </div>
      </div>

      {/* ═══ Expanded Explanation Area ═══ */}
      {isPreviewOpen && (
        <div className="p-6 border-t bg-surface-container-low border-outline-variant/10">
          <div className="grid grid-cols-3 gap-8">
            <div className="col-span-2 space-y-4">
              {/* Correct Answer */}
              <div className="p-4 rounded-lg bg-[#1B6B47]/10 border border-[#1B6B47]/20">
                <h4 className="mb-1 text-[0.625rem] font-bold tracking-widest text-[#1B6B47] uppercase">
                  Correct Answer
                </h4>
                <p className="m-0 text-lg font-bold text-[#1B6B47]">
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
            </div>

            {/* Metadata Sidebar */}
            <div className="col-span-1 space-y-3">
              <div className="rounded-sm border border-outline-variant/10 bg-white px-3 py-1">
                <p className="m-0 text-[0.5625rem] font-bold text-on-surface-variant uppercase">
                  Weightage
                </p>
                <p className="m-0 text-sm font-bold text-primary">
                  {q.points} Point{q.points !== 1 ? "s" : ""}
                </p>
              </div>
              <div className="rounded-sm border border-outline-variant/10 bg-white px-3 py-1">
                <p className="m-0 text-[0.5625rem] font-bold text-on-surface-variant uppercase">
                  Avg. Time
                </p>
                <p className="m-0 text-sm font-bold text-primary">
                  {q.points <= 1 ? "30 Sec" : q.points <= 2 ? "45 Sec" : q.points <= 3 ? "1 Min" : q.points <= 4 ? "1.5 Min" : "2 Min"}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
