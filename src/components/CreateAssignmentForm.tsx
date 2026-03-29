"use client";

import { useState, useTransition } from "react";
import { useAssignment } from "@/components/AssignmentContext";
import { api } from "@/lib/api";
import Link from "next/link";

interface ClassType {
  id: string;
  name: string;
  section: string;
}

export default function CreateAssignmentForm({
  classes,
}: {
  classes: ClassType[];
}) {
  const { selectedQuestions, removeQuestion, clearSelection } =
    useAssignment();
  const [isPending, startTransition] = useTransition();
  const [publishResult, setPublishResult] = useState<{
    success: boolean;
    linkId?: string;
    error?: string;
  } | null>(null);

  const totalMarks = selectedQuestions.reduce(
    (acc, q) => acc + q.points,
    0
  );

  const handlePublish = (formData: FormData) => {
    startTransition(async () => {
      try {
        const title = formData.get("title") as string;
        const classId = formData.get("classId") as string;
        const dueDate = formData.get("dueDate") as string;

        const result = await api.assignments.create({
          title,
          classId,
          dueDate,
          description: `Assignment for class ${classId}`,
          questionIds: selectedQuestions.map((q) => q.id),
          maxScore: totalMarks,
          status: "PUBLISHED",
        });

        setPublishResult({
          success: true,
          linkId: result.linkId || result.id,
        });
        clearSelection();
      } catch (err: unknown) {
        setPublishResult({
          success: false,
          error:
            err instanceof Error
              ? err.message
              : "An unexpected error occurred",
        });
      }
    });
  };

  /* ── Success View ── */
  if (publishResult?.success) {
    const link = `${window.location.origin}/student/assignment/${publishResult.linkId}`;
    return (
      <div
        style={{
          background: "var(--color-surface-container-lowest)",
          padding: "var(--space-8)",
          borderRadius: "var(--radius-md)",
          textAlign: "center",
          maxWidth: "32rem",
          margin: "0 auto",
        }}
      >
        <div
          style={{
            width: "3.5rem",
            height: "3.5rem",
            borderRadius: "50%",
            background: "var(--color-success-container)",
            color: "var(--color-success)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto var(--space-4)",
          }}
        >
          <svg
            style={{ width: "1.75rem", height: "1.75rem" }}
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
        <h2
          className="text-display-sm"
          style={{ marginBottom: "var(--space-2)" }}
        >
          Assignment Published!
        </h2>
        <p
          className="text-body-md"
          style={{
            color: "var(--color-on-surface-variant)",
            marginBottom: "var(--space-6)",
          }}
        >
          Your assignment is ready to be shared with students.
        </p>

        <div
          className="flex items-center justify-between gap-3"
          style={{
            background: "var(--color-surface-container-low)",
            padding: "var(--space-3) var(--space-4)",
            borderRadius: "var(--radius-sm)",
            marginBottom: "var(--space-6)",
          }}
        >
          <code
            style={{
              fontSize: "0.8125rem",
              color: "var(--color-primary)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {link}
          </code>
          <button
            onClick={() => navigator.clipboard.writeText(link)}
            className="btn-ghost"
            style={{
              padding: "var(--space-1-5) var(--space-3)",
              fontSize: "0.8125rem",
              background: "var(--color-primary-container)",
              color: "var(--color-on-primary-container)",
              whiteSpace: "nowrap",
            }}
          >
            Copy Link
          </button>
        </div>

        <Link href="/teacher/dashboard" className="btn-ghost">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  /* ── Empty Selection ── */
  if (selectedQuestions.length === 0) {
    return (
      <div
        style={{
          background: "var(--color-surface-container-lowest)",
          padding: "var(--space-12) var(--space-8)",
          borderRadius: "var(--radius-md)",
          textAlign: "center",
          border: "1px dashed var(--color-outline-variant)",
        }}
      >
        <p
          className="text-body-md"
          style={{
            color: "var(--color-on-surface-variant)",
            marginBottom: "var(--space-4)",
          }}
        >
          You haven&apos;t selected any questions yet.
        </p>
        <Link href="/teacher/question-bank" className="btn-primary">
          Browse Question Bank
        </Link>
      </div>
    );
  }

  /* ── Main Form ── */
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Selected Questions Review */}
      <div
        className="lg:col-span-2"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-3)",
        }}
      >
        <h2
          className="text-headline-md"
          style={{ marginBottom: "var(--space-2)" }}
        >
          Selected Questions ({selectedQuestions.length})
        </h2>
        {selectedQuestions.map((q, index) => (
          <div
            key={q.id}
            style={{
              background: "var(--color-surface-container-lowest)",
              padding: "var(--space-5)",
              borderRadius: "var(--radius-md)",
            }}
          >
            <div
              className="flex justify-between items-start"
              style={{ marginBottom: "var(--space-2)" }}
            >
              <span
                className="text-label-sm"
                style={{ color: "var(--color-on-surface-variant)" }}
              >
                Question {index + 1}
              </span>
              <button
                onClick={() => removeQuestion(q.id)}
                className="btn-ghost"
                style={{
                  padding: "var(--space-1) var(--space-2)",
                  fontSize: "0.75rem",
                  color: "var(--color-error)",
                }}
              >
                Remove
              </button>
            </div>
            <p
              style={{
                color: "var(--color-on-surface)",
                fontWeight: 500,
                fontSize: "0.875rem",
              }}
            >
              {q.text}
            </p>
            <div
              className="flex gap-2"
              style={{ marginTop: "var(--space-3)" }}
            >
              <span className="badge">
                {q.type.replace(/_/g, " ")}
              </span>
              <span
                className="badge"
                style={{
                  background: "var(--color-success-container)",
                  color: "var(--color-success)",
                }}
              >
                {q.points} Marks
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Assignment Setup Form */}
      <div className="lg:col-span-1">
        <div
          className="sticky top-6"
          style={{
            background: "var(--color-surface-container-lowest)",
            padding: "var(--space-6)",
            borderRadius: "var(--radius-md)",
          }}
        >
          <h2
            className="text-headline-sm"
            style={{ marginBottom: "var(--space-5)" }}
          >
            Publish Assignment
          </h2>

          <form
            action={handlePublish}
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
                Assignment Title
              </label>
              <input
                name="title"
                required
                placeholder="e.g. Chapter 1 Quiz"
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
                Select Class
              </label>
              {classes.length === 0 ? (
                <p
                  className="text-body-sm"
                  style={{ color: "var(--color-error)" }}
                >
                  No classes found. Please create a class first.
                </p>
              ) : (
                <select
                  name="classId"
                  required
                  className="select-academic"
                >
                  <option value="">Choose a class...</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} - Section {c.section}
                    </option>
                  ))}
                </select>
              )}
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
                Due Date (Optional)
              </label>
              <input
                type="date"
                name="dueDate"
                className="input-academic"
              />
            </div>

            <div
              className="flex justify-between items-center"
              style={{
                paddingTop: "var(--space-4)",
                fontWeight: 600,
                color: "var(--color-on-surface)",
              }}
            >
              <span>Total Marks:</span>
              <span style={{ fontSize: "1.25rem" }}>{totalMarks}</span>
            </div>

            {publishResult?.error && (
              <div
                style={{
                  padding: "var(--space-3)",
                  background: "var(--color-error-container)",
                  color: "var(--color-error)",
                  borderRadius: "var(--radius-sm)",
                  fontSize: "0.8125rem",
                }}
              >
                {publishResult.error}
              </div>
            )}

            <button
              type="submit"
              disabled={isPending || classes.length === 0}
              className="btn-primary"
              style={{ width: "100%", padding: "var(--space-3)" }}
            >
              {isPending ? "Publishing…" : "Publish to Students"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
