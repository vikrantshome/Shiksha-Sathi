"use client";

import { useState, useTransition } from "react";
import { api } from "@/lib/api";
import type { AssignmentByLinkResponse, SubmitAssignmentResponse } from "@/lib/api/types";

/* ─────────────────────────────────────────────────────────
   Student Assignment Form — Stitch-Directed Redesign
   Design Source: 
     - identity_entry/code.html  → Identity stage
     - assignment_taking/code.html → Assessment stage  
     - results/code.html → Results stage
   All three views implement Digital Atelier tokens.
   ───────────────────────────────────────────────────────── */

interface StudentAssignmentFormProps {
  assignment: AssignmentByLinkResponse;
}

export default function StudentAssignmentForm({
  assignment,
}: StudentAssignmentFormProps) {
  const [identity, setIdentity] = useState<{
    name: string;
    rollNumber: string;
  } | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<SubmitAssignmentResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleIdentitySubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setIdentity({
      name: formData.get("name") as string,
      rollNumber: formData.get("rollNumber") as string,
    });
    setError(null);
  };

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmitAssignment = () => {
    if (!identity) return;

    // Check if all questions are answered
    if (Object.keys(answers).length < assignment.questions.length) {
      setError("Please answer all questions before submitting.");
      return;
    }

    setError(null);
    startTransition(async () => {
      try {
        const res = await api.assignments.submitAssignment(
          assignment.id,
          identity.name,
          identity.rollNumber,
          answers
        );
        setResult(res);
      } catch (err: unknown) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to submit assignment"
        );
      }
    });
  };

  const answeredCount = Object.keys(answers).length;
  const totalQuestions = assignment.questions.length;
  const progressPercent =
    totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0;

  /* ════════════════════════════════════════════════════════
     STAGE 3: Results View — Stitch "results" direction
     ════════════════════════════════════════════════════════ */
  if (result) {
    const scorePercent = result.totalMarks > 0
      ? Math.round((result.score / result.totalMarks) * 100)
      : 0;

    return (
      <div>
        {/* Success Confirmation */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "var(--space-12)",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: "4rem",
              height: "4rem",
              background: "var(--color-primary-container)",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "var(--space-6)",
            }}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h2
            style={{
              fontFamily: "var(--font-manrope), system-ui, sans-serif",
              fontSize: "0.875rem",
              fontWeight: 600,
              color: "var(--color-on-surface-variant)",
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              marginBottom: "var(--space-2)",
            }}
          >
            Submission Confirmed
          </h2>
          <h1
            style={{
              fontFamily: "var(--font-manrope), system-ui, sans-serif",
              fontSize: "1.75rem",
              fontWeight: 800,
              color: "var(--color-on-surface)",
              letterSpacing: "-0.03em",
              margin: 0,
            }}
          >
            Assignment Submitted Successfully
          </h1>
        </div>

        {/* Score Display — Bento Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: "var(--space-6)",
            marginBottom: "var(--space-12)",
          }}
          className="score-grid"
        >
          {/* Main Score Card */}
          <div
            style={{
              background: "var(--color-surface-container-lowest)",
              padding: "var(--space-12)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "3px",
                background: "var(--color-primary)",
              }}
            />
            <span
              style={{
                fontSize: "0.6875rem",
                fontWeight: 700,
                color: "var(--color-on-surface-variant)",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                marginBottom: "var(--space-4)",
              }}
            >
              Total Performance
            </span>
            <div style={{ display: "flex", alignItems: "baseline", gap: "var(--space-2)" }}>
              <span
                style={{
                  fontFamily: "var(--font-manrope), system-ui, sans-serif",
                  fontSize: "5rem",
                  fontWeight: 800,
                  color: "var(--color-primary)",
                  letterSpacing: "-0.05em",
                  lineHeight: 1,
                }}
              >
                {result.score}
              </span>
              <span
                style={{
                  fontFamily: "var(--font-manrope), system-ui, sans-serif",
                  fontSize: "2rem",
                  fontWeight: 700,
                  color: "var(--color-outline-variant)",
                }}
              >
                / {result.totalMarks}
              </span>
            </div>
            <p
              style={{
                marginTop: "var(--space-6)",
                color: "var(--color-on-surface-variant)",
                fontWeight: 500,
                textAlign: "center",
                maxWidth: "20rem",
                fontSize: "0.875rem",
              }}
            >
              {scorePercent >= 80
                ? `Excellent work, ${identity?.name}! You've demonstrated a strong grasp of the material.`
                : scorePercent >= 50
                ? `Good effort, ${identity?.name}. Review the feedback below to improve.`
                : `Keep studying, ${identity?.name}. Review the detailed feedback for guidance.`}
            </p>
          </div>

          {/* Stats Row */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "var(--space-6)",
            }}
          >
            <div
              style={{
                background: "var(--color-surface-container-low)",
                padding: "var(--space-6)",
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: "var(--space-3)" }}>
                <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
              </svg>
              <div
                style={{
                  fontFamily: "var(--font-manrope), system-ui, sans-serif",
                  fontSize: "1.5rem",
                  fontWeight: 700,
                  color: "var(--color-on-surface)",
                }}
              >
                {totalQuestions}
              </div>
              <div
                style={{
                  fontSize: "0.6875rem",
                  fontWeight: 700,
                  color: "var(--color-on-surface-variant)",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                }}
              >
                Total Questions
              </div>
            </div>
            <div
              style={{
                background: "var(--color-primary)",
                color: "var(--color-on-primary)",
                padding: "var(--space-6)",
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: "var(--space-3)" }}>
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" />
              </svg>
              <div
                style={{
                  fontFamily: "var(--font-manrope), system-ui, sans-serif",
                  fontSize: "1.5rem",
                  fontWeight: 700,
                }}
              >
                {scorePercent}%
              </div>
              <div
                style={{
                  fontSize: "0.6875rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  opacity: 0.8,
                }}
              >
                Score Rate
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Feedback */}
        {result.feedback && result.feedback.length > 0 && (
          <section>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                borderBottom: "1px solid var(--color-surface-container)",
                paddingBottom: "var(--space-4)",
                marginBottom: "var(--space-8)",
              }}
            >
              <h3
                style={{
                  fontFamily: "var(--font-manrope), system-ui, sans-serif",
                  fontSize: "1.25rem",
                  fontWeight: 700,
                  color: "var(--color-on-surface)",
                  letterSpacing: "-0.02em",
                  margin: 0,
                }}
              >
                Detailed Feedback
              </h3>
              <div style={{ display: "flex", gap: "var(--space-4)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", fontSize: "0.75rem", fontWeight: 500, color: "var(--color-on-surface-variant)" }}>
                  <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#34a853" }} /> Correct
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", fontSize: "0.75rem", fontWeight: 500, color: "var(--color-on-surface-variant)" }}>
                  <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--color-error)" }} /> Incorrect
                </div>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-10)" }}>
              {result.feedback.map((f, i: number) => (
                <div key={f.questionId}>
                  <div style={{ display: "flex", gap: "var(--space-6)", alignItems: "flex-start" }}>
                    <div
                      style={{
                        flexShrink: 0,
                        width: "2rem",
                        height: "2rem",
                        background: "var(--color-surface-container)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontFamily: "var(--font-manrope), system-ui, sans-serif",
                        fontWeight: 700,
                        color: "var(--color-primary)",
                        fontSize: "0.75rem",
                      }}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          gap: "var(--space-4)",
                          marginBottom: "var(--space-4)",
                        }}
                      >
                        <h4
                          style={{
                            fontSize: "1rem",
                            fontWeight: 500,
                            color: "var(--color-on-surface)",
                            lineHeight: 1.6,
                            margin: 0,
                          }}
                        >
                          {f.questionText}
                        </h4>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            padding: "2px var(--space-2)",
                            background: f.isCorrect
                              ? "rgba(52, 168, 83, 0.1)"
                              : "rgba(168, 56, 54, 0.1)",
                            color: f.isCorrect ? "#34a853" : "var(--color-error)",
                            fontSize: "0.6875rem",
                            fontWeight: 700,
                            letterSpacing: "0.05em",
                            textTransform: "uppercase",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {f.isCorrect
                            ? `Correct (+${f.marksAwarded})`
                            : "Incorrect"}
                        </span>
                      </div>

                      {f.isCorrect ? (
                        <div
                          style={{
                            background: "var(--color-surface-container-low)",
                            padding: "var(--space-4)",
                            borderLeft: "2px solid #34a853",
                          }}
                        >
                          <div
                            style={{
                              fontSize: "0.6875rem",
                              color: "var(--color-on-surface-variant)",
                              fontWeight: 700,
                              letterSpacing: "0.1em",
                              textTransform: "uppercase",
                              marginBottom: "var(--space-1)",
                            }}
                          >
                            Your Answer
                          </div>
                          <div
                            style={{ color: "#34a853", fontWeight: 500 }}
                          >
                            {f.studentAnswer}
                          </div>
                        </div>
                      ) : (
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: "var(--space-4)",
                          }}
                        >
                          <div
                            style={{
                              background: "var(--color-surface-container-low)",
                              padding: "var(--space-4)",
                              borderLeft: "2px solid var(--color-error)",
                            }}
                          >
                            <div
                              style={{
                                fontSize: "0.6875rem",
                                color: "var(--color-on-surface-variant)",
                                fontWeight: 700,
                                letterSpacing: "0.1em",
                                textTransform: "uppercase",
                                marginBottom: "var(--space-1)",
                              }}
                            >
                              Your Answer
                            </div>
                            <div
                              style={{
                                color: "var(--color-error)",
                                fontWeight: 500,
                                textDecoration: "line-through",
                              }}
                            >
                              {f.studentAnswer}
                            </div>
                          </div>
                          <div
                            style={{
                              background: "rgba(52, 168, 83, 0.05)",
                              padding: "var(--space-4)",
                              borderLeft: "2px solid #34a853",
                            }}
                          >
                            <div
                              style={{
                                fontSize: "0.6875rem",
                                color: "#34a853",
                                fontWeight: 700,
                                letterSpacing: "0.1em",
                                textTransform: "uppercase",
                                marginBottom: "var(--space-1)",
                              }}
                            >
                              Correct Answer
                            </div>
                            <div
                              style={{ color: "#34a853", fontWeight: 500 }}
                            >
                              {Array.isArray(f.correctAnswer)
                                ? f.correctAnswer.join(" or ")
                                : f.correctAnswer}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <style>{`
          @media (min-width: 768px) {
            .score-grid {
              grid-template-columns: 2fr 1fr !important;
            }
            .score-grid > :first-child {
              grid-row: 1 / 2;
            }
            .score-grid > :last-child {
              grid-template-columns: 1fr !important;
              display: flex !important;
              flex-direction: column !important;
            }
          }
        `}</style>
      </div>
    );
  }

  /* ════════════════════════════════════════════════════════
     STAGE 1: Identity Entry — Stitch "identity_entry" direction
     ════════════════════════════════════════════════════════ */
  if (!identity) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "60vh",
        }}
      >
        <div style={{ width: "100%", maxWidth: "28rem", position: "relative" }}>
          {/* Card glow background */}
          <div
            style={{
              position: "absolute",
              inset: "-4px",
              background: "linear-gradient(to top right, rgba(68, 99, 113, 0.04), transparent)",
              filter: "blur(16px)",
              opacity: 0.5,
              borderRadius: "var(--radius-lg)",
            }}
          />
          {/* Card */}
          <div
            style={{
              position: "relative",
              background: "var(--color-surface-container-lowest)",
              border: "1px solid rgba(176, 179, 173, 0.1)",
              padding: "var(--space-8)",
              boxShadow: "0 12px 32px rgba(48, 51, 47, 0.04)",
            }}
            className="identity-card"
          >
            {/* Editorial Header */}
            <div
              style={{
                marginBottom: "var(--space-10)",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "3rem",
                  height: "3rem",
                  background: "rgba(198, 232, 248, 0.3)",
                  borderRadius: "50%",
                  marginBottom: "var(--space-6)",
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <h2
                style={{
                  fontFamily: "var(--font-manrope), system-ui, sans-serif",
                  fontSize: "1.5rem",
                  fontWeight: 700,
                  color: "var(--color-on-surface)",
                  letterSpacing: "-0.02em",
                  marginBottom: "var(--space-2)",
                }}
              >
                Enter your details to start
              </h2>
              <p
                style={{
                  color: "var(--color-on-surface-variant)",
                  fontSize: "0.875rem",
                  lineHeight: 1.5,
                  maxWidth: "18rem",
                  margin: "0 auto",
                }}
              >
                Please provide your institutional identity to begin the assessment module.
              </p>
            </div>

            {error && (
              <div
                style={{
                  marginBottom: "var(--space-5)",
                  padding: "var(--space-3)",
                  background: "rgba(168, 56, 54, 0.06)",
                  color: "var(--color-error)",
                  fontSize: "0.8125rem",
                  textAlign: "center",
                }}
              >
                {error}
              </div>
            )}

            <form
              onSubmit={handleIdentitySubmit}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "var(--space-8)",
              }}
            >
              {/* Full Name */}
              <div>
                <label
                  htmlFor="student-name"
                  style={{
                    display: "block",
                    fontSize: "0.6875rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    color: "var(--color-on-surface-variant)",
                    marginBottom: "var(--space-2)",
                  }}
                >
                  Full Name
                </label>
                <input
                  id="student-name"
                  name="name"
                  required
                  placeholder="e.g. Aarav Patel"
                  type="text"
                  style={{
                    width: "100%",
                    background: "var(--color-surface-container-low)",
                    border: "none",
                    borderBottom: "1px solid rgba(176, 179, 173, 0.2)",
                    padding: "var(--space-3) 0",
                    color: "var(--color-on-surface)",
                    fontSize: "1rem",
                    outline: "none",
                    transition: "border-color 300ms ease-out",
                  }}
                  className="identity-input"
                />
              </div>

              {/* Roll Number */}
              <div>
                <label
                  htmlFor="student-roll"
                  style={{
                    display: "block",
                    fontSize: "0.6875rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    color: "var(--color-on-surface-variant)",
                    marginBottom: "var(--space-2)",
                  }}
                >
                  Roll Number
                </label>
                <input
                  id="student-roll"
                  name="rollNumber"
                  required
                  placeholder="Enter your unique ID"
                  type="text"
                  style={{
                    width: "100%",
                    background: "var(--color-surface-container-low)",
                    border: "none",
                    borderBottom: "1px solid rgba(176, 179, 173, 0.2)",
                    padding: "var(--space-3) 0",
                    color: "var(--color-on-surface)",
                    fontSize: "1rem",
                    outline: "none",
                    transition: "border-color 300ms ease-out",
                  }}
                  className="identity-input"
                />
              </div>

              {/* Submit */}
              <div style={{ paddingTop: "var(--space-4)" }}>
                <button
                  type="submit"
                  style={{
                    width: "100%",
                    background: "linear-gradient(135deg, var(--color-primary), var(--color-primary-dim))",
                    color: "var(--color-on-primary)",
                    padding: "var(--space-4) var(--space-6)",
                    border: "none",
                    fontWeight: 700,
                    letterSpacing: "0.05em",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "var(--space-2)",
                    transition: "all 200ms ease-out",
                    boxShadow: "0 4px 12px rgba(68, 99, 113, 0.2)",
                  }}
                  className="identity-submit"
                >
                  <span>Start Assignment</span>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                  </svg>
                </button>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "var(--space-4)",
                    marginTop: "var(--space-6)",
                    opacity: 0.6,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "var(--space-1)" }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                    <span style={{ fontSize: "0.6875rem", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      Assessment
                    </span>
                  </div>
                  <div style={{ width: "3px", height: "3px", borderRadius: "50%", background: "var(--color-outline-variant)" }} />
                  <div style={{ display: "flex", alignItems: "center", gap: "var(--space-1)" }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18" /></svg>
                    <span style={{ fontSize: "0.6875rem", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      {totalQuestions} Questions
                    </span>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>

        <style>{`
          .identity-input:focus { border-bottom-color: var(--color-primary) !important; border-bottom-width: 2px; }
          .identity-submit:hover { box-shadow: 0 8px 20px rgba(68, 99, 113, 0.3) !important; transform: scale(1.01); }
          .identity-submit:active { transform: scale(0.98); }
          @media (min-width: 768px) {
            .identity-card { padding: var(--space-12) !important; }
          }
        `}</style>
      </div>
    );
  }

  /* ════════════════════════════════════════════════════════
     STAGE 2: Assessment Taking — Stitch "assignment_taking" direction
     ════════════════════════════════════════════════════════ */
  return (
    <div>
      {/* Assignment Header */}
      <header style={{ marginBottom: "var(--space-12)" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            gap: "var(--space-4)",
            marginBottom: "var(--space-6)",
            flexWrap: "wrap",
          }}
        >
          <div>
            <span
              style={{
                fontSize: "0.6875rem",
                fontWeight: 500,
                letterSpacing: "0.05em",
                color: "var(--color-primary)",
                textTransform: "uppercase",
                marginBottom: "var(--space-2)",
                display: "block",
              }}
            >
              Ongoing Assessment
            </span>
            <h1
              style={{
                fontFamily: "var(--font-manrope), system-ui, sans-serif",
                fontSize: "1.75rem",
                fontWeight: 700,
                color: "var(--color-on-surface)",
                letterSpacing: "-0.03em",
                margin: 0,
              }}
            >
              {assignment.title}
            </h1>
            <p
              style={{
                color: "var(--color-on-surface-variant)",
                fontSize: "0.875rem",
                marginTop: "var(--space-1)",
              }}
            >
              Student:{" "}
              <span style={{ color: "var(--color-on-surface)", fontWeight: 500 }}>
                {identity.name}
              </span>
            </p>
          </div>
          <div style={{ textAlign: "right" }}>
            <p
              style={{
                fontSize: "0.6875rem",
                fontWeight: 700,
                color: "var(--color-primary)",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                margin: 0,
              }}
            >
              Progress
            </p>
            <p
              style={{
                fontFamily: "var(--font-manrope), system-ui, sans-serif",
                fontSize: "1.125rem",
                fontWeight: 700,
                color: "var(--color-on-surface)",
                margin: 0,
              }}
            >
              {answeredCount} / {totalQuestions} Answered
            </p>
          </div>
        </div>

        {/* Progress Bar — thin, architectural */}
        <div
          style={{
            width: "100%",
            height: "2px",
            background: "var(--color-surface-container-highest)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${progressPercent}%`,
              background: "var(--color-primary)",
              transition: "width 500ms ease-in-out",
            }}
          />
        </div>
      </header>

      {/* Question Sequence */}
      <section
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-8)",
        }}
      >
        {assignment.questions.map((q, index) => (
          <article
            key={q.id}
            style={{
              background: "var(--color-surface-container-lowest)",
              padding: "var(--space-8)",
              transition: "all 200ms ease-out",
            }}
          >
            {/* Question header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: "var(--space-6)",
              }}
            >
              <div style={{ display: "flex", gap: "var(--space-4)" }}>
                <span
                  style={{
                    color: "var(--color-primary)",
                    fontWeight: 700,
                    fontSize: "0.875rem",
                  }}
                >
                  {String(index + 1).padStart(2, "0")}.
                </span>
                <h2
                  style={{
                    fontSize: "1rem",
                    fontWeight: 500,
                    lineHeight: 1.6,
                    color: "var(--color-on-surface)",
                    margin: 0,
                  }}
                >
                  {q.text}
                </h2>
              </div>
              <span
                style={{
                  fontSize: "0.6875rem",
                  fontWeight: 700,
                  letterSpacing: "0.05em",
                  color: "var(--color-on-surface-variant)",
                  background: "var(--color-surface-container)",
                  padding: "2px var(--space-2)",
                  textTransform: "uppercase",
                  whiteSpace: "nowrap",
                }}
              >
                {q.points} Marks
              </span>
            </div>

            {/* Answer Area */}
            {q.options && (q.type === "MCQ" || q.type === "TRUE_FALSE") ? (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr",
                  gap: "var(--space-3)",
                  paddingLeft: "var(--space-9)",
                }}
                className="options-grid"
              >
                {q.options.map((opt, i) => {
                  const isSelected = answers[q.id] === opt;
                  return (
                    <label
                      key={i}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "var(--space-3)",
                        padding: "var(--space-4)",
                        background: isSelected
                          ? "rgba(68, 99, 113, 0.08)"
                          : "var(--color-surface-container-low)",
                        border: isSelected
                          ? "1px solid rgba(68, 99, 113, 0.25)"
                          : "1px solid transparent",
                        cursor: "pointer",
                        transition: "all 200ms ease-out",
                      }}
                      className="option-label"
                    >
                      {/* Radio Circle */}
                      <div
                        style={{
                          width: "1.25rem",
                          height: "1.25rem",
                          borderRadius: "50%",
                          border: isSelected
                            ? "5px solid var(--color-primary)"
                            : "1.5px solid var(--color-outline-variant)",
                          transition: "all 150ms ease-out",
                          flexShrink: 0,
                        }}
                      />
                      <input
                        type="radio"
                        name={`question-${q.id}`}
                        value={opt}
                        checked={isSelected}
                        onChange={() => handleAnswerChange(q.id, opt)}
                        style={{ display: "none" }}
                      />
                      <span
                        style={{
                          fontSize: "0.875rem",
                          fontWeight: isSelected ? 600 : 400,
                          color: isSelected
                            ? "var(--color-primary)"
                            : "var(--color-on-surface)",
                        }}
                      >
                        {String.fromCharCode(65 + i)}) {opt}
                      </span>
                    </label>
                  );
                })}
              </div>
            ) : (
              <div style={{ paddingLeft: "var(--space-9)", maxWidth: "28rem" }}>
                <input
                  type="text"
                  value={answers[q.id] || ""}
                  onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                  placeholder="Type your answer here..."
                  style={{
                    width: "100%",
                    background: "var(--color-surface-container-low)",
                    border: "none",
                    borderBottom: "2px solid rgba(176, 179, 173, 0.2)",
                    padding: "var(--space-3) var(--space-4)",
                    fontSize: "0.875rem",
                    color: "var(--color-on-surface)",
                    outline: "none",
                    transition: "border-color 300ms ease-out",
                  }}
                  className="fill-input"
                />
                <p
                  style={{
                    marginTop: "var(--space-2)",
                    fontSize: "0.6875rem",
                    color: "var(--color-on-surface-variant)",
                    fontStyle: "italic",
                  }}
                >
                  Enter a single word or a short phrase.
                </p>
              </div>
            )}
          </article>
        ))}
      </section>

      {/* Error */}
      {error && (
        <div
          style={{
            marginTop: "var(--space-6)",
            padding: "var(--space-3)",
            background: "rgba(168, 56, 54, 0.06)",
            color: "var(--color-error)",
            fontSize: "0.8125rem",
            textAlign: "center",
          }}
        >
          {error}
        </div>
      )}

      {/* Submit Section */}
      <div
        style={{
          marginTop: "var(--space-12)",
          paddingTop: "var(--space-8)",
          borderTop: "1px solid var(--color-surface-container)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <p
          style={{
            color: "var(--color-on-surface-variant)",
            fontSize: "0.75rem",
            marginBottom: "var(--space-6)",
            display: "flex",
            alignItems: "center",
            gap: "var(--space-2)",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
          Please review all answers before final submission.
        </p>

        <button
          type="button"
          onClick={handleSubmitAssignment}
          disabled={isPending}
          style={{
            background: "linear-gradient(135deg, var(--color-primary), var(--color-primary-dim))",
            color: "var(--color-on-primary)",
            padding: "var(--space-4) var(--space-12)",
            border: "none",
            fontWeight: 700,
            letterSpacing: "0.05em",
            cursor: isPending ? "wait" : "pointer",
            display: "flex",
            alignItems: "center",
            gap: "var(--space-3)",
            transition: "all 200ms ease-out",
            boxShadow: "0 8px 24px rgba(68, 99, 113, 0.25)",
            opacity: isPending ? 0.7 : 1,
          }}
          className="submit-btn"
        >
          {isPending ? "Submitting…" : "Submit Assignment"}
          {!isPending && (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          )}
        </button>
      </div>

      <style>{`
        @media (min-width: 768px) {
          .options-grid {
            grid-template-columns: 1fr 1fr !important;
          }
        }
        .option-label:hover {
          background: var(--color-surface-container) !important;
        }
        .fill-input:focus {
          border-bottom-color: var(--color-primary) !important;
        }
        .submit-btn:hover {
          box-shadow: 0 12px 32px rgba(68, 99, 113, 0.35) !important;
          transform: scale(1.02);
        }
        .submit-btn:active {
          transform: scale(0.98);
        }
      `}</style>
    </div>
  );
}
