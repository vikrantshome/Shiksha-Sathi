"use client";

import { useState, useTransition } from "react";
import { Question, GradedAnswer } from "@/lib/questions";
import { api } from "@/lib/api";

interface StudentAssignmentFormProps {
  assignment: {
    id: string;
    title: string;
    totalMarks: number;
    questions: Omit<Question, "correctAnswer">[];
  };
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
  const [result, setResult] = useState<{
    success: boolean;
    score: number;
    totalMarks: number;
    feedback?: GradedAnswer[];
  } | null>(null);
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

  /* ── Results View ── */
  if (result) {
    return (
      <div
        style={{
          padding: "var(--space-8)",
          textAlign: "center",
        }}
      >
        {/* Success icon */}
        <div
          style={{
            width: "4rem",
            height: "4rem",
            borderRadius: "50%",
            background: "var(--color-success-container)",
            color: "var(--color-success)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto var(--space-5)",
          }}
        >
          <svg
            style={{ width: "2rem", height: "2rem" }}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h2 className="text-display-sm" style={{ marginBottom: "var(--space-2)" }}>
          Assignment Submitted!
        </h2>
        <p
          className="text-body-md"
          style={{
            color: "var(--color-on-surface-variant)",
            marginBottom: "var(--space-8)",
          }}
        >
          Thank you, {identity?.name}. Your responses have been recorded.
        </p>

        {/* Score card */}
        <div
          className="card-static"
          style={{
            maxWidth: "24rem",
            margin: "0 auto var(--space-8)",
            textAlign: "center",
          }}
        >
          <p
            className="text-label-sm"
            style={{
              color: "var(--color-on-surface-variant)",
              marginBottom: "var(--space-2)",
            }}
          >
            Your Score
          </p>
          <p className="text-display-lg" style={{ letterSpacing: "-0.03em" }}>
            <span style={{ color: "var(--color-primary)" }}>
              {result.score}
            </span>
            <span
              style={{
                fontSize: "1.25rem",
                color: "var(--color-on-surface-variant)",
                marginLeft: "var(--space-2)",
              }}
            >
              / {result.totalMarks}
            </span>
          </p>
        </div>

        {/* Feedback */}
        {result.feedback && result.feedback.length > 0 && (
          <div
            style={{
              maxWidth: "36rem",
              margin: "0 auto",
              textAlign: "left",
            }}
          >
            <h3
              className="text-headline-md"
              style={{ marginBottom: "var(--space-4)" }}
            >
              Answer Feedback
            </h3>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "var(--space-3)",
              }}
            >
              {result.feedback.map((f: GradedAnswer, i: number) => (
                <div
                  key={f.questionId}
                  style={{
                    padding: "var(--space-4)",
                    borderRadius: "var(--radius-md)",
                    background: f.isCorrect
                      ? "var(--color-success-container)"
                      : "var(--color-error-container)",
                  }}
                >
                  <div
                    className="flex justify-between items-start"
                    style={{ marginBottom: "var(--space-2)" }}
                  >
                    <span
                      style={{
                        fontWeight: 600,
                        color: "var(--color-on-surface)",
                        fontSize: "0.875rem",
                      }}
                    >
                      Question {i + 1}
                    </span>
                    {f.isCorrect ? (
                      <span
                        className="flex items-center gap-1"
                        style={{
                          color: "var(--color-success)",
                          fontWeight: 600,
                          fontSize: "0.8125rem",
                        }}
                      >
                        ✓ Correct ({f.marksAwarded} Marks)
                      </span>
                    ) : (
                      <span
                        className="flex items-center gap-1"
                        style={{
                          color: "var(--color-error)",
                          fontWeight: 600,
                          fontSize: "0.8125rem",
                        }}
                      >
                        ✗ Incorrect (0 Marks)
                      </span>
                    )}
                  </div>
                  <p
                    style={{
                      color: "var(--color-on-surface)",
                      fontSize: "0.875rem",
                      marginBottom: "var(--space-3)",
                    }}
                  >
                    {f.questionText}
                  </p>
                  <div
                    style={{
                      fontSize: "0.8125rem",
                      display: "flex",
                      flexDirection: "column",
                      gap: "var(--space-1)",
                    }}
                  >
                    <div>
                      <span
                        style={{
                          color: "var(--color-on-surface-variant)",
                        }}
                      >
                        Your Answer:
                      </span>{" "}
                      <span
                        style={{
                          fontWeight: 500,
                          color: "var(--color-on-surface)",
                        }}
                      >
                        {f.studentAnswer}
                      </span>
                    </div>
                    {!f.isCorrect && (
                      <div>
                        <span
                          style={{
                            color: "var(--color-on-surface-variant)",
                          }}
                        >
                          Correct Answer:
                        </span>{" "}
                        <span
                          style={{
                            fontWeight: 500,
                            color: "var(--color-success)",
                          }}
                        >
                          {Array.isArray(f.correctAnswer)
                            ? f.correctAnswer.join(" or ")
                            : f.correctAnswer}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  /* ── Identity Form ── */
  if (!identity) {
    return (
      <div style={{ padding: "var(--space-6) var(--space-8)" }}>
        <div style={{ maxWidth: "24rem", margin: "0 auto" }}>
          <h2
            className="text-headline-md"
            style={{
              textAlign: "center",
              marginBottom: "var(--space-6)",
            }}
          >
            Enter your details to start
          </h2>
          {error && (
            <div
              style={{
                marginBottom: "var(--space-5)",
                padding: "var(--space-3)",
                background: "var(--color-error-container)",
                color: "var(--color-error)",
                borderRadius: "var(--radius-sm)",
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
              gap: "var(--space-5)",
            }}
          >
            <div>
              <label
                className="text-label-md"
                style={{
                  display: "block",
                  color: "var(--color-on-surface-variant)",
                  marginBottom: "var(--space-1-5)",
                }}
              >
                Full Name
              </label>
              <input
                name="name"
                required
                placeholder="e.g. Aarav Patel"
                className="input-academic"
              />
            </div>
            <div>
              <label
                className="text-label-md"
                style={{
                  display: "block",
                  color: "var(--color-on-surface-variant)",
                  marginBottom: "var(--space-1-5)",
                }}
              >
                Student ID / Roll Number
              </label>
              <input
                name="rollNumber"
                required
                placeholder="e.g. 101"
                className="input-academic"
              />
            </div>
            <button
              type="submit"
              className="btn-primary"
              style={{
                width: "100%",
                padding: "var(--space-3)",
              }}
            >
              Start Assignment
            </button>
          </form>
        </div>
      </div>
    );
  }

  /* ── Question Form ── */
  return (
    <div style={{ padding: "var(--space-6) var(--space-8)" }}>
      {/* Student info + progress bar */}
      <div
        className="flex justify-between items-center"
        style={{
          marginBottom: "var(--space-6)",
          paddingBottom: "var(--space-4)",
        }}
      >
        <div>
          <span
            className="text-label-sm"
            style={{ color: "var(--color-on-surface-variant)" }}
          >
            Student
          </span>
          <p
            style={{
              fontWeight: 500,
              color: "var(--color-on-surface)",
              fontSize: "0.875rem",
            }}
          >
            {identity.name} ({identity.rollNumber})
          </p>
        </div>
        <div style={{ textAlign: "right" }}>
          <span
            className="text-label-sm"
            style={{ color: "var(--color-on-surface-variant)" }}
          >
            Progress
          </span>
          <p
            style={{
              fontWeight: 500,
              color: "var(--color-primary)",
              fontSize: "0.875rem",
            }}
          >
            {Object.keys(answers).length} / {assignment.questions.length}{" "}
            Answered
          </p>
        </div>
      </div>

      {/* Progress track */}
      <div className="progress-track" style={{ marginBottom: "var(--space-6)" }}>
        <div
          className="progress-indicator"
          style={{
            width: `${(Object.keys(answers).length / assignment.questions.length) * 100}%`,
          }}
        ></div>
      </div>

      {/* Questions */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-6)",
        }}
      >
        {assignment.questions.map((q, index) => (
          <div
            key={q.id}
            style={{
              background: "var(--color-surface-container-low)",
              borderRadius: "var(--radius-md)",
              padding: "var(--space-5)",
            }}
          >
            <div
              className="flex justify-between items-start"
              style={{ marginBottom: "var(--space-4)" }}
            >
              <span
                className="text-label-sm"
                style={{ color: "var(--color-on-surface-variant)" }}
              >
                Question {index + 1}
              </span>
              <span className="badge">{q.marks} Marks</span>
            </div>
            <p
              style={{
                fontSize: "1rem",
                fontWeight: 500,
                color: "var(--color-on-surface)",
                marginBottom: "var(--space-4)",
                lineHeight: 1.6,
              }}
            >
              {q.text}
            </p>

            {q.options &&
            (q.type === "MCQ" || q.type === "TRUE_FALSE") ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "var(--space-2)",
                }}
              >
                {q.options.map((opt, i) => (
                  <label
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      padding: "var(--space-3)",
                      borderRadius: "var(--radius-sm)",
                      cursor: "pointer",
                      transition: "all var(--transition-fast)",
                      background:
                        answers[q.id] === opt
                          ? "var(--color-primary-container)"
                          : "var(--color-surface-container-lowest)",
                      border:
                        answers[q.id] === opt
                          ? "1.5px solid var(--color-primary)"
                          : "1px solid rgba(176, 179, 173, 0.15)",
                    }}
                  >
                    <input
                      type="radio"
                      name={`question-${q.id}`}
                      value={opt}
                      checked={answers[q.id] === opt}
                      onChange={() => handleAnswerChange(q.id, opt)}
                      style={{
                        width: "1rem",
                        height: "1rem",
                        accentColor: "var(--color-primary)",
                      }}
                    />
                    <span
                      style={{
                        marginLeft: "var(--space-3)",
                        color: "var(--color-on-surface)",
                        fontSize: "0.875rem",
                      }}
                    >
                      {opt}
                    </span>
                  </label>
                ))}
              </div>
            ) : (
              <div>
                <input
                  type="text"
                  value={answers[q.id] || ""}
                  onChange={(e) =>
                    handleAnswerChange(q.id, e.target.value)
                  }
                  placeholder="Type your answer here..."
                  className="input-academic"
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div
          style={{
            marginTop: "var(--space-6)",
            padding: "var(--space-3)",
            background: "var(--color-error-container)",
            color: "var(--color-error)",
            borderRadius: "var(--radius-sm)",
            fontSize: "0.8125rem",
            textAlign: "center",
          }}
        >
          {error}
        </div>
      )}

      {/* Submit Button */}
      <div
        className="flex justify-end"
        style={{
          marginTop: "var(--space-8)",
          paddingTop: "var(--space-5)",
        }}
      >
        <button
          onClick={handleSubmitAssignment}
          disabled={isPending}
          className="btn-primary"
          style={{
            padding: "var(--space-3) var(--space-8)",
            fontSize: "1rem",
            fontWeight: 600,
          }}
        >
          {isPending ? "Submitting…" : "Submit Assignment"}
        </button>
      </div>
    </div>
  );
}
