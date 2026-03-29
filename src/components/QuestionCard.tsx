"use client";

import { useState } from "react";
import { Question } from "@/lib/api/types";
import { useAssignment } from "./AssignmentContext";

export default function QuestionCard({ question: q }: { question: Question }) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const { toggleQuestion, isSelected } = useAssignment();

  const selected = isSelected(q.id);

  return (
    <div
      style={{
        background: selected
          ? "rgba(198, 232, 248, 0.15)"
          : "var(--color-surface-container-lowest)",
        borderRadius: "var(--radius-md)",
        padding: "var(--space-5)",
        border: selected
          ? "1.5px solid var(--color-primary)"
          : "1px solid rgba(176, 179, 173, 0.15)",
        transition: "all var(--transition-fast)",
      }}
    >
      {/* Meta row: Topic + Type */}
      <div
        className="flex justify-between items-center"
        style={{ marginBottom: "var(--space-3)" }}
      >
        <span
          className="text-label-sm"
          style={{ color: "var(--color-on-surface-variant)" }}
        >
          {q.topic}
        </span>
        <span className="badge">{q.type.replace(/_/g, " ")}</span>
      </div>

      {/* Question text */}
      <p
        style={{
          color: "var(--color-on-surface)",
          fontWeight: 500,
          fontSize: "0.875rem",
          lineHeight: 1.6,
        }}
      >
        {q.text}
      </p>

      {/* MCQ Options */}
      {q.options && (
        <ul
          style={{
            listStyle: "none",
            padding: 0,
            margin: 0,
            marginTop: "var(--space-3)",
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-1-5)",
          }}
        >
          {q.options.map((opt, i) => (
            <li
              key={i}
              style={{
                padding: "var(--space-2) var(--space-3)",
                fontSize: "0.8125rem",
                color: "var(--color-on-surface-variant)",
                background: "var(--color-surface-container-low)",
                borderRadius: "var(--radius-sm)",
              }}
            >
              <span
                style={{
                  color: "var(--color-primary)",
                  fontWeight: 500,
                  marginRight: "var(--space-2)",
                }}
              >
                {String.fromCharCode(65 + i)}.
              </span>
              {opt}
            </li>
          ))}
        </ul>
      )}

      {/* Action row */}
      <div
        className="flex justify-between items-center"
        style={{
          marginTop: "var(--space-4)",
          paddingTop: "var(--space-3)",
        }}
      >
        <button
          onClick={() => setIsPreviewOpen(!isPreviewOpen)}
          className="btn-ghost"
          style={{
            padding: "var(--space-1) var(--space-2)",
            fontSize: "0.8125rem",
          }}
        >
          {isPreviewOpen ? "Hide Preview" : "Preview"}
        </button>

        <button
          onClick={() => toggleQuestion(q)}
          className={selected ? "btn-primary" : "btn-ghost"}
          style={{
            padding: "var(--space-1-5) var(--space-4)",
            fontSize: "0.8125rem",
            ...(selected
              ? {}
              : {
                  background: "var(--color-surface-container)",
                  color: "var(--color-on-surface)",
                }),
          }}
        >
          {selected ? "✓ Added" : "Add to Assignment"}
        </button>
      </div>

      {/* Preview Area */}
      {isPreviewOpen && (
        <div
          style={{
            marginTop: "var(--space-4)",
            padding: "var(--space-4)",
            background: "var(--color-surface-container-low)",
            borderRadius: "var(--radius-md)",
          }}
        >
          <h4 className="text-label-sm" style={{ color: "var(--color-primary)", marginBottom: "var(--space-3)" }}>
            Teacher Preview
          </h4>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "var(--space-3)",
              fontSize: "0.8125rem",
            }}
          >
            <div>
              <span
                style={{
                  fontWeight: 500,
                  color: "var(--color-on-surface-variant)",
                }}
              >
                Correct Answer:
              </span>
              <span
                style={{
                  marginLeft: "var(--space-2)",
                  color: "var(--color-success)",
                  fontWeight: 600,
                }}
              >
                {q.correctAnswer}
              </span>
            </div>

            {q.explanation && (
              <div>
                <span
                  style={{
                    fontWeight: 500,
                    color: "var(--color-on-surface-variant)",
                    display: "block",
                    marginBottom: "var(--space-1)",
                  }}
                >
                  Explanation:
                </span>
                <p
                  style={{
                    color: "var(--color-on-surface)",
                    background: "var(--color-surface-container-lowest)",
                    padding: "var(--space-3)",
                    borderRadius: "var(--radius-sm)",
                    lineHeight: 1.6,
                  }}
                >
                  {q.explanation}
                </p>
              </div>
            )}

            <div
              className="grid grid-cols-2 gap-2"
              style={{
                fontSize: "0.75rem",
                paddingTop: "var(--space-2)",
              }}
            >
              <div>
                <span style={{ color: "var(--color-on-surface-variant)" }}>
                  Points:
                </span>{" "}
                <span style={{ color: "var(--color-on-surface)" }}>
                  {q.points}
                </span>
              </div>
              <div>
                <span style={{ color: "var(--color-on-surface-variant)" }}>
                  Source:
                </span>{" "}
                <span style={{ color: "var(--color-on-surface)" }}>
                  {q.sourceKind || "LOCAL"}
                </span>
              </div>
              {q.provenance && (
                <>
                  <div className="col-span-2">
                    <span
                      style={{ color: "var(--color-on-surface-variant)" }}
                    >
                      Book:
                    </span>{" "}
                    <span style={{ color: "var(--color-on-surface)" }}>
                      {q.provenance.book} (Class{" "}
                      {q.provenance.classLevel})
                    </span>
                  </div>
                  <div>
                    <span
                      style={{ color: "var(--color-on-surface-variant)" }}
                    >
                      Chapter:
                    </span>{" "}
                    <span style={{ color: "var(--color-on-surface)" }}>
                      {q.provenance.chapterNumber}.{" "}
                      {q.provenance.chapterTitle}
                    </span>
                  </div>
                  <div>
                    <span
                      style={{ color: "var(--color-on-surface-variant)" }}
                    >
                      Section:
                    </span>{" "}
                    <span style={{ color: "var(--color-on-surface)" }}>
                      {q.provenance.section || "N/A"}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
