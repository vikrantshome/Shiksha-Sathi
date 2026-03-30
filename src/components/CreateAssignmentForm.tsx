"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useAssignment } from "@/components/AssignmentContext";
import { api } from "@/lib/api";

interface ClassType {
  id: string;
  name: string;
  section: string;
}

interface PublishResult {
  assignmentId: string;
  classLabel: string;
  dueDate: string;
  linkId: string;
  title: string;
}

const typeLabels: Record<string, string> = {
  MCQ: "MCQ",
  TRUE_FALSE: "True / False",
  FILL_IN_BLANKS: "Fill in the Blank",
  MULTIPLE_CHOICE: "Multiple Choice",
  SHORT_ANSWER: "Short Answer",
  ESSAY: "Essay",
};

function formatDueDate(value: string) {
  if (!value) return "Not scheduled";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function CreateAssignmentForm({
  classes,
}: {
  classes: ClassType[];
}) {
  const { selectedQuestions, removeQuestion, clearSelection } = useAssignment();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [publishResult, setPublishResult] = useState<PublishResult | null>(null);

  const totalMarks = selectedQuestions.reduce((acc, question) => acc + question.points, 0);

  const handlePublish = (formData: FormData) => {
    startTransition(async () => {
      setError(null);

      try {
        const title = formData.get("title") as string;
        const classId = formData.get("classId") as string;
        const dueDate = formData.get("dueDate") as string;

        const result = await api.assignments.create({
          title,
          classId,
          dueDate,
          description: `Assignment for class ${classId}`,
          questionIds: selectedQuestions.map((question) => question.id),
          maxScore: totalMarks,
          status: "PUBLISHED",
        });

        const targetClass = classes.find((item) => item.id === classId);

        setPublishResult({
          assignmentId: result.id,
          classLabel: targetClass
            ? `${targetClass.name} • Section ${targetClass.section}`
            : "Assigned class",
          dueDate,
          linkId: result.linkId || result.id,
          title,
        });
        clearSelection();
      } catch (submissionError: unknown) {
        setError(
          submissionError instanceof Error
            ? submissionError.message
            : "We could not publish the assignment right now."
        );
      }
    });
  };

  if (publishResult) {
    const shareLink = `${window.location.origin}/student/assignment/${publishResult.linkId}`;

    return (
      <div
        style={{
          display: "grid",
          gap: "var(--space-8)",
        }}
      >
        <section
          style={{
            background: "var(--color-surface-container-lowest)",
            borderRadius: "var(--radius-lg)",
            padding: "var(--space-10)",
            boxShadow: "var(--shadow-sm)",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: "5rem",
              height: "5rem",
              borderRadius: "50%",
              background: "var(--color-primary-container)",
              color: "var(--color-primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto var(--space-6)",
            }}
          >
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-label-sm" style={{ color: "var(--color-primary)", margin: 0 }}>
            Publish Complete
          </p>
          <h2
            style={{
              fontFamily: "var(--font-manrope), system-ui, sans-serif",
              fontSize: "clamp(2rem, 4vw, 3rem)",
              fontWeight: 800,
              letterSpacing: "-0.04em",
              color: "var(--color-on-surface)",
              margin: "var(--space-3) 0 0",
            }}
          >
            Assignment Published
          </h2>
          <p
            style={{
              color: "var(--color-on-surface-variant)",
              fontSize: "0.9375rem",
              lineHeight: 1.7,
              maxWidth: "34rem",
              margin: "var(--space-4) auto 0",
            }}
          >
            {publishResult.title} is now live for students. Share the unique link below to begin collecting submissions.
          </p>
        </section>

        <div className="publish-success-grid" style={{ display: "grid", gap: "var(--space-6)" }}>
          <section
            style={{
              background: "var(--color-surface-container-lowest)",
              borderRadius: "var(--radius-lg)",
              padding: "var(--space-8)",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", marginBottom: "var(--space-6)" }}>
              <div
                style={{
                  width: "2.75rem",
                  height: "2.75rem",
                  borderRadius: "var(--radius-lg)",
                  background: "rgba(68, 99, 113, 0.08)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--color-primary)",
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                </svg>
              </div>
              <div>
                <p className="text-label-sm" style={{ color: "var(--color-on-surface-variant)", margin: 0 }}>
                  Student Assignment Link
                </p>
                <h3 style={{ margin: "var(--space-1) 0 0", fontSize: "1.125rem", fontWeight: 700, color: "var(--color-on-surface)" }}>
                  Ready to share
                </h3>
              </div>
            </div>

            <div
              style={{
                background: "var(--color-surface-container-low)",
                borderRadius: "var(--radius-lg)",
                padding: "var(--space-5)",
                display: "grid",
                gap: "var(--space-4)",
              }}
            >
              <div>
                <p className="text-label-sm" style={{ color: "var(--color-on-surface-variant)", margin: 0 }}>
                  Unique Access URL
                </p>
                <code
                  style={{
                    display: "block",
                    marginTop: "var(--space-2)",
                    color: "var(--color-primary)",
                    fontSize: "0.875rem",
                    lineHeight: 1.7,
                    overflowWrap: "anywhere",
                  }}
                >
                  {shareLink}
                </code>
              </div>

              <div style={{ display: "flex", gap: "var(--space-3)", flexWrap: "wrap" }}>
                <button
                  type="button"
                  onClick={() => navigator.clipboard.writeText(shareLink)}
                  className="btn-primary"
                >
                  Copy Link
                </button>
                <Link href={`/teacher/assignments/${publishResult.assignmentId}`} className="btn-ghost">
                  View Assignment Report
                </Link>
              </div>
            </div>
          </section>

          <aside style={{ display: "grid", gap: "var(--space-6)" }}>
            <section
              style={{
                background: "var(--color-primary)",
                color: "var(--color-on-primary)",
                borderRadius: "var(--radius-lg)",
                padding: "var(--space-6)",
                boxShadow: "var(--shadow-md)",
              }}
            >
              <h3 style={{ margin: 0, fontSize: "1.125rem", fontWeight: 700 }}>Assignment Snapshot</h3>
              <div style={{ display: "grid", gap: "var(--space-4)", marginTop: "var(--space-6)" }}>
                <div>
                  <p className="text-label-sm" style={{ color: "rgba(242, 250, 255, 0.72)", margin: 0 }}>
                    Due Date
                  </p>
                  <p style={{ margin: "var(--space-2) 0 0", fontSize: "1rem", fontWeight: 700 }}>
                    {formatDueDate(publishResult.dueDate)}
                  </p>
                </div>
                <div>
                  <p className="text-label-sm" style={{ color: "rgba(242, 250, 255, 0.72)", margin: 0 }}>
                    Target Class
                  </p>
                  <p style={{ margin: "var(--space-2) 0 0", fontSize: "1rem", fontWeight: 700 }}>
                    {publishResult.classLabel}
                  </p>
                </div>
              </div>
            </section>

            <section
              style={{
                background: "var(--color-surface-container-low)",
                borderRadius: "var(--radius-lg)",
                padding: "var(--space-6)",
              }}
            >
              <p className="text-label-sm" style={{ color: "var(--color-primary)", margin: 0 }}>
                Quick Tip
              </p>
              <p
                style={{
                  margin: "var(--space-3) 0 0",
                  color: "var(--color-on-surface-variant)",
                  lineHeight: 1.7,
                  fontSize: "0.875rem",
                }}
              >
                Students can open the shared link directly. Track progress and scores from the assignment report once submissions start arriving.
              </p>
            </section>

            <Link href="/teacher/dashboard" className="btn-ghost" style={{ justifyContent: "center" }}>
              Return to Dashboard
            </Link>
          </aside>
        </div>

        <style>{`
          .publish-success-grid {
            grid-template-columns: 1fr;
          }
          @media (min-width: 1024px) {
            .publish-success-grid {
              grid-template-columns: minmax(0, 2fr) minmax(18rem, 22rem);
              align-items: start;
            }
          }
        `}</style>
      </div>
    );
  }

  if (selectedQuestions.length === 0) {
    return (
      <section
        style={{
          background: "var(--color-surface-container-lowest)",
          borderRadius: "var(--radius-lg)",
          padding: "var(--space-12) var(--space-8)",
          border: "1px dashed rgba(176, 179, 173, 0.25)",
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: "4rem",
            height: "4rem",
            borderRadius: "50%",
            background: "var(--color-surface-container-low)",
            color: "var(--color-primary)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto var(--space-5)",
          }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14" />
            <path d="M5 12h14" />
          </svg>
        </div>
        <h2 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 700, color: "var(--color-on-surface)" }}>
          No questions in the review tray yet
        </h2>
        <p
          style={{
            margin: "var(--space-4) auto 0",
            color: "var(--color-on-surface-variant)",
            maxWidth: "30rem",
            lineHeight: 1.7,
          }}
        >
          Browse the curated question bank, add the questions you want, and return here to organize and publish the final assignment.
        </p>
        <div style={{ marginTop: "var(--space-6)" }}>
          <Link href="/teacher/question-bank" className="btn-primary">
            Browse Question Bank
          </Link>
        </div>
      </section>
    );
  }

  return (
    <form action={handlePublish} className="review-grid" style={{ display: "grid", gap: "var(--space-8)" }}>
      <section style={{ display: "grid", gap: "var(--space-5)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "var(--space-4)", flexWrap: "wrap" }}>
          <div>
            <h2
              style={{
                fontFamily: "var(--font-manrope), system-ui, sans-serif",
                fontSize: "1.5rem",
                fontWeight: 700,
                color: "var(--color-primary)",
                letterSpacing: "-0.03em",
                margin: 0,
              }}
            >
              Selected Questions ({selectedQuestions.length})
            </h2>
            <p style={{ margin: "var(--space-2) 0 0", color: "var(--color-on-surface-variant)", fontSize: "0.875rem" }}>
              Review the sequence, remove anything unnecessary, and publish once the set feels right.
            </p>
          </div>
          <Link href="/teacher/question-bank" className="btn-ghost">
            Add More Questions
          </Link>
        </div>

        {selectedQuestions.map((question, index) => (
          <article
            key={question.id}
            style={{
              background: "var(--color-surface-container-lowest)",
              borderRadius: "var(--radius-lg)",
              padding: "var(--space-6)",
              boxShadow: "var(--shadow-sm)",
              display: "grid",
              gap: "var(--space-4)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "var(--space-4)", flexWrap: "wrap" }}>
              <div style={{ display: "flex", gap: "var(--space-3)", alignItems: "center", flexWrap: "wrap" }}>
                <span
                  style={{
                    background: "var(--color-primary-container)",
                    color: "var(--color-on-primary-container)",
                    borderRadius: "var(--radius-sm)",
                    padding: "2px var(--space-2)",
                    fontSize: "0.6875rem",
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                  }}
                >
                  Q{index + 1}
                </span>
                <span className="text-label-sm" style={{ color: "var(--color-on-surface-variant)", margin: 0 }}>
                  {typeLabels[question.type] || question.type.replace(/_/g, " ")}
                </span>
              </div>

              <div style={{ display: "flex", gap: "var(--space-3)", alignItems: "center", flexWrap: "wrap" }}>
                <span style={{ color: "var(--color-on-surface-variant)", fontSize: "0.8125rem", fontWeight: 600 }}>
                  {question.points} {question.points === 1 ? "Mark" : "Marks"}
                </span>
                <button
                  type="button"
                  onClick={() => removeQuestion(question.id)}
                  className="btn-ghost"
                  style={{ paddingInline: "var(--space-3)", color: "var(--color-error)" }}
                >
                  Remove
                </button>
              </div>
            </div>

            <p style={{ margin: 0, color: "var(--color-on-surface)", fontSize: "0.9375rem", lineHeight: 1.7 }}>
              {question.text}
            </p>

            {question.options?.length ? (
              <div className="review-options-grid" style={{ display: "grid", gap: "var(--space-3)" }}>
                {question.options.map((option, optionIndex) => (
                  <div
                    key={`${question.id}-${optionIndex}`}
                    style={{
                      background: "var(--color-surface-container-low)",
                      borderRadius: "var(--radius-md)",
                      padding: "var(--space-4)",
                      display: "flex",
                      gap: "var(--space-3)",
                      alignItems: "flex-start",
                    }}
                  >
                    <span
                      style={{
                        width: "1.5rem",
                        height: "1.5rem",
                        borderRadius: "50%",
                        background: "var(--color-surface-container)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        color: "var(--color-on-surface-variant)",
                        flexShrink: 0,
                      }}
                    >
                      {String.fromCharCode(65 + optionIndex)}
                    </span>
                    <span style={{ color: "var(--color-on-surface-variant)", fontSize: "0.875rem", lineHeight: 1.6 }}>
                      {option}
                    </span>
                  </div>
                ))}
              </div>
            ) : question.explanation ? (
              <div
                style={{
                  background: "var(--color-surface-container-low)",
                  borderRadius: "var(--radius-md)",
                  padding: "var(--space-4)",
                  color: "var(--color-on-surface-variant)",
                  fontSize: "0.875rem",
                  lineHeight: 1.7,
                }}
              >
                {question.explanation}
              </div>
            ) : null}
          </article>
        ))}
      </section>

      <aside style={{ display: "grid", gap: "var(--space-6)", alignContent: "start" }}>
        <section
          style={{
            background: "var(--color-primary)",
            color: "var(--color-on-primary)",
            borderRadius: "1rem",
            padding: "var(--space-6)",
            boxShadow: "var(--shadow-md)",
            position: "sticky",
            top: "var(--space-6)",
          }}
        >
          <h3 style={{ margin: 0, fontSize: "1.125rem", fontWeight: 700 }}>Assignment Summary</h3>

          <div className="summary-grid" style={{ display: "grid", gap: "var(--space-4)", marginTop: "var(--space-6)" }}>
            <div
              style={{
                background: "rgba(255, 255, 255, 0.12)",
                borderRadius: "var(--radius-lg)",
                padding: "var(--space-4)",
              }}
            >
              <p className="text-label-sm" style={{ color: "rgba(242, 250, 255, 0.72)", margin: 0 }}>
                Total Marks
              </p>
              <p style={{ margin: "var(--space-2) 0 0", fontSize: "2rem", fontWeight: 800 }}>{totalMarks}</p>
            </div>
            <div
              style={{
                background: "rgba(255, 255, 255, 0.12)",
                borderRadius: "var(--radius-lg)",
                padding: "var(--space-4)",
              }}
            >
              <p className="text-label-sm" style={{ color: "rgba(242, 250, 255, 0.72)", margin: 0 }}>
                Question Count
              </p>
              <p style={{ margin: "var(--space-2) 0 0", fontSize: "2rem", fontWeight: 800 }}>{selectedQuestions.length}</p>
            </div>
          </div>

          <div style={{ display: "grid", gap: "var(--space-5)", marginTop: "var(--space-6)" }}>
            <div>
              <label htmlFor="assignment-title" className="text-label-sm" style={{ color: "rgba(242, 250, 255, 0.72)", display: "block", marginBottom: "var(--space-2)" }}>
                Assignment Title
              </label>
              <input
                id="assignment-title"
                name="title"
                required
                placeholder="e.g. Algebra & Linear Equations"
                style={{
                  width: "100%",
                  background: "rgba(255, 255, 255, 0.12)",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                  borderRadius: "var(--radius-md)",
                  padding: "var(--space-3) var(--space-4)",
                  color: "var(--color-on-primary)",
                  outline: "none",
                }}
              />
            </div>

            <div>
              <label htmlFor="assignment-class" className="text-label-sm" style={{ color: "rgba(242, 250, 255, 0.72)", display: "block", marginBottom: "var(--space-2)" }}>
                Target Class
              </label>
              <select
                id="assignment-class"
                name="classId"
                required
                defaultValue=""
                style={{
                  width: "100%",
                  background: "rgba(255, 255, 255, 0.12)",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                  borderRadius: "var(--radius-md)",
                  padding: "var(--space-3) var(--space-4)",
                  color: "var(--color-on-primary)",
                  outline: "none",
                }}
              >
                <option value="" disabled style={{ color: "var(--color-on-surface)" }}>
                  Select a class
                </option>
                {classes.map((item) => (
                  <option key={item.id} value={item.id} style={{ color: "var(--color-on-surface)" }}>
                    {item.name} • Section {item.section}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="assignment-due-date" className="text-label-sm" style={{ color: "rgba(242, 250, 255, 0.72)", display: "block", marginBottom: "var(--space-2)" }}>
                Due Date
              </label>
              <input
                id="assignment-due-date"
                type="date"
                name="dueDate"
                required
                style={{
                  width: "100%",
                  background: "rgba(255, 255, 255, 0.12)",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                  borderRadius: "var(--radius-md)",
                  padding: "var(--space-3) var(--space-4)",
                  color: "var(--color-on-primary)",
                  outline: "none",
                }}
              />
            </div>
          </div>

          {error ? (
            <div
              style={{
                marginTop: "var(--space-5)",
                background: "rgba(168, 56, 54, 0.18)",
                color: "var(--color-on-primary)",
                borderRadius: "var(--radius-md)",
                padding: "var(--space-3) var(--space-4)",
                fontSize: "0.8125rem",
                lineHeight: 1.6,
              }}
            >
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={isPending}
            style={{
              width: "100%",
              marginTop: "var(--space-6)",
              background: "var(--color-on-primary)",
              color: "var(--color-primary)",
              border: "none",
              borderRadius: "var(--radius-lg)",
              padding: "var(--space-4) var(--space-5)",
              fontWeight: 800,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              cursor: isPending ? "wait" : "pointer",
            }}
          >
            {isPending ? "Publishing…" : "Finalize & Publish"}
          </button>

          <p style={{ margin: "var(--space-4) 0 0", fontSize: "0.8125rem", lineHeight: 1.7, color: "rgba(242, 250, 255, 0.72)" }}>
            Publishing keeps the student flow link-based and Shiksha Sathi-native. No external classroom integrations are added in this implementation wave.
          </p>
        </section>
      </aside>

      <style>{`
        .review-grid {
          grid-template-columns: 1fr;
        }
        .review-options-grid {
          grid-template-columns: 1fr;
        }
        .summary-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
        @media (min-width: 768px) {
          .review-options-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }
        @media (min-width: 1024px) {
          .review-grid {
            grid-template-columns: minmax(0, 2fr) minmax(20rem, 24rem);
            align-items: start;
          }
        }
      `}</style>
    </form>
  );
}
