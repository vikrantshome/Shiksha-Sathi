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
const typeBadgeStyles: Record<string, { bg: string; color: string }> = {
  MCQ: {
    bg: "var(--color-primary-container)",
    color: "var(--color-on-primary-container)",
  },
  TRUE_FALSE: {
    bg: "var(--color-secondary-container)",
    color: "var(--color-on-secondary-container)",
  },
  FILL_IN_BLANKS: {
    bg: "var(--color-tertiary-container)",
    color: "var(--color-on-tertiary-container)",
  },
};

const getTypeBadge = (type: string) => {
  const style = typeBadgeStyles[type] || typeBadgeStyles["MCQ"];
  const label = type.replace(/_/g, " ");
  return { style, label };
};

export default function QuestionCard({ question: q }: { question: Question }) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const { toggleQuestion, isSelected } = useAssignment();

  const selected = isSelected(q.id);
  const badge = getTypeBadge(q.type);

  return (
    <div
      style={{
        background: "var(--color-surface-container-lowest)",
        borderLeft: selected
          ? "4px solid var(--color-primary)"
          : "4px solid transparent",
        boxShadow: selected
          ? "0 1px 4px rgba(48, 51, 47, 0.08)"
          : "none",
        overflow: "hidden",
        transition: "all 300ms ease-out",
      }}
      className="question-card"
    >
      {/* ═══ Card Content ═══ */}
      <div style={{ padding: "var(--space-6)" }}>
        {/* Meta Row: Type Badge + Chapter/Level + Source + Selection */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: "var(--space-4)",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: "var(--space-2)",
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            {/* Type Badge */}
            <span
              style={{
                background: badge.style.bg,
                color: badge.style.color,
                fontSize: "0.625rem",
                fontWeight: 700,
                padding: "2px var(--space-2)",
                borderRadius: "var(--radius-full)",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              {badge.label}
            </span>
            {/* Chapter/Topic */}
            <span
              style={{
                fontSize: "0.75rem",
                fontWeight: 500,
                color: "var(--color-on-surface-variant)",
              }}
            >
              {q.topic}
            </span>
            {/* Difficulty Dot */}
            {q.provenance && (
              <>
                <span
                  style={{
                    width: "3px",
                    height: "3px",
                    borderRadius: "50%",
                    background: "var(--color-outline-variant)",
                    display: "inline-block",
                  }}
                />
                <span
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 500,
                    color: "var(--color-on-surface-variant)",
                  }}
                >
                  Class {q.provenance.classLevel}
                </span>
              </>
            )}
          </div>

          {/* Source + Selection Circle */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--space-3)",
            }}
          >
            <span
              style={{
                fontSize: "0.625rem",
                fontWeight: 700,
                color: "var(--color-on-surface-variant)",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              SOURCE: {q.sourceKind || "LOCAL"}
            </span>

            {/* Selection Checkbox Circle */}
            <button
              type="button"
              onClick={() => toggleQuestion(q)}
              style={{
                width: "1.25rem",
                height: "1.25rem",
                borderRadius: "50%",
                border: selected
                  ? "none"
                  : "1.5px solid rgba(176, 179, 173, 0.3)",
                background: selected
                  ? "var(--color-primary)"
                  : "transparent",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "all 150ms ease-out",
                padding: 0,
                flexShrink: 0,
              }}
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
        <p
          style={{
            fontSize: "1rem",
            fontWeight: 500,
            lineHeight: 1.6,
            color: "var(--color-on-surface)",
            margin: "0 0 var(--space-6)",
          }}
        >
          {q.text}
        </p>

        {/* MCQ Options Grid */}
        {q.options && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(14rem, 1fr))",
              gap: "var(--space-3)",
              marginBottom: "var(--space-6)",
            }}
          >
            {q.options.map((opt, i) => {
              const isCorrect = q.correctAnswer ===  opt || q.correctAnswer === String.fromCharCode(65 + i);
              return (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "var(--space-3)",
                    padding: "var(--space-3)",
                    border: isCorrect && isPreviewOpen
                      ? "1px solid rgba(68, 99, 113, 0.2)"
                      : "1px solid rgba(176, 179, 173, 0.1)",
                    background: isCorrect && isPreviewOpen
                      ? "rgba(68, 99, 113, 0.05)"
                      : "transparent",
                    borderRadius: "var(--radius-sm)",
                    transition: "all 200ms ease-out",
                  }}
                  className="option-item"
                >
                  <span
                    style={{
                      width: "1.5rem",
                      height: "1.5rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: "50%",
                      background: isCorrect && isPreviewOpen
                        ? "var(--color-primary)"
                        : "var(--color-surface-container)",
                      color: isCorrect && isPreviewOpen
                        ? "white"
                        : "var(--color-on-surface-variant)",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span
                    style={{
                      fontSize: "0.875rem",
                      fontWeight: isCorrect && isPreviewOpen ? 500 : 400,
                    }}
                  >
                    {opt}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Action Row: Preview Toggle + Action Buttons */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingTop: "var(--space-4)",
            borderTop: "1px solid rgba(176, 179, 173, 0.1)",
          }}
        >
          <button
            type="button"
            onClick={() => setIsPreviewOpen(!isPreviewOpen)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--space-2)",
              fontSize: "0.6875rem",
              fontWeight: 700,
              color: "var(--color-primary)",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
            }}
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
              style={{
                transition: "transform 200ms ease-out",
                transform: isPreviewOpen ? "rotate(180deg)" : "rotate(0deg)",
              }}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
            {isPreviewOpen ? "Hide Explanation" : "Preview Question"}
          </button>

          <div
            style={{
              display: "flex",
              gap: "var(--space-4)",
            }}
          >
            {/* Add to Assignment */}
            <button
              type="button"
              onClick={() => toggleQuestion(q)}
              style={{
                color: selected
                  ? "var(--color-primary)"
                  : "var(--color-on-surface-variant)",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
                transition: "color 150ms ease-out",
              }}
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
              style={{
                color: "var(--color-on-surface-variant)",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
                transition: "color 150ms ease-out",
              }}
              title="Copy question"
              className="action-icon"
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
        <div
          style={{
            background: "var(--color-surface-container-low)",
            padding: "var(--space-6)",
            borderTop: "1px solid rgba(176, 179, 173, 0.1)",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr",
              gap: "var(--space-4)",
            }}
          >
            {/* Correct Answer */}
            <div>
              <h4
                style={{
                  fontSize: "0.625rem",
                  fontWeight: 700,
                  color: "var(--color-on-surface-variant)",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  marginBottom: "var(--space-1)",
                }}
              >
                Correct Answer
              </h4>
              <p
                style={{
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  color: "var(--color-primary)",
                  margin: 0,
                }}
              >
                {q.correctAnswer}
              </p>
            </div>

            {/* Detailed Explanation */}
            {q.explanation && (
              <div>
                <h4
                  style={{
                    fontSize: "0.625rem",
                    fontWeight: 700,
                    color: "var(--color-on-surface-variant)",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    marginBottom: "var(--space-1)",
                  }}
                >
                  Detailed Explanation
                </h4>
                <p
                  style={{
                    fontSize: "0.875rem",
                    color: "var(--color-on-surface)",
                    lineHeight: 1.6,
                    margin: 0,
                  }}
                >
                  {q.explanation}
                </p>
              </div>
            )}

            {/* Metadata Chips */}
            <div style={{ display: "flex", gap: "var(--space-4)" }}>
              <div
                style={{
                  padding: "var(--space-1) var(--space-3)",
                  background: "var(--color-surface-container-lowest)",
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid rgba(176, 179, 173, 0.1)",
                }}
              >
                <p
                  style={{
                    fontSize: "0.5625rem",
                    color: "var(--color-on-surface-variant)",
                    textTransform: "uppercase",
                    fontWeight: 700,
                    margin: 0,
                  }}
                >
                  Weightage
                </p>
                <p
                  style={{
                    fontSize: "0.875rem",
                    fontWeight: 700,
                    color: "var(--color-primary)",
                    margin: 0,
                  }}
                >
                  {q.points} Point{q.points !== 1 ? "s" : ""}
                </p>
              </div>

              {q.provenance && (
                <div
                  style={{
                    padding: "var(--space-1) var(--space-3)",
                    background: "var(--color-surface-container-lowest)",
                    borderRadius: "var(--radius-sm)",
                    border: "1px solid rgba(176, 179, 173, 0.1)",
                  }}
                >
                  <p
                    style={{
                      fontSize: "0.5625rem",
                      color: "var(--color-on-surface-variant)",
                      textTransform: "uppercase",
                      fontWeight: 700,
                      margin: 0,
                    }}
                  >
                    Source
                  </p>
                  <p
                    style={{
                      fontSize: "0.875rem",
                      fontWeight: 700,
                      color: "var(--color-primary)",
                      margin: 0,
                    }}
                  >
                    {q.provenance.book}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ═══ Card Hover Styles ═══ */}
      <style>{`
        .question-card {
          border: 1px solid transparent;
        }
        .question-card:hover {
          border-color: rgba(176, 179, 173, 0.2);
        }
        .option-item:hover {
          background: var(--color-surface-container-low) !important;
          cursor: pointer;
        }
        .action-icon:hover {
          color: var(--color-primary) !important;
        }
      `}</style>
    </div>
  );
}
