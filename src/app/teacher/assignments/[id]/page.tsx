import { api } from "@/lib/api";
import { notFound } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AssignmentReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  let report;
  try {
    report = await api.assignments.getReport(resolvedParams.id);
  } catch (error) {
    notFound();
  }

  const { assignment, submissions, questionStats } = report;

  const averageScore =
    submissions.length > 0
      ? submissions.reduce((acc: number, sub: any) => acc + sub.score, 0) /
        submissions.length
      : 0;

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: "var(--space-8)" }}>
        <Link
          href="/teacher/dashboard"
          className="btn-ghost"
          style={{
            padding: "var(--space-1) 0",
            fontSize: "0.8125rem",
            marginBottom: "var(--space-4)",
            display: "inline-flex",
          }}
        >
          ← Back to Dashboard
        </Link>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
          <div>
            <h1 className="text-display-sm">{assignment.title}</h1>
            <p
              className="text-body-sm"
              style={{
                color: "var(--color-on-surface-variant)",
                marginTop: "var(--space-1)",
              }}
            >
              Student Link:{" "}
              <code
                style={{
                  background: "var(--color-surface-container)",
                  padding: "2px 6px",
                  borderRadius: "var(--radius-sm)",
                  fontSize: "0.75rem",
                }}
              >
                /student/assignment/{assignment.linkId}
              </code>
            </p>
          </div>
          <div style={{ textAlign: "right" }}>
            <span
              className="text-label-sm"
              style={{
                color: "var(--color-on-surface-variant)",
                display: "block",
              }}
            >
              Total Marks
            </span>
            <span
              className="text-display-sm"
              style={{ letterSpacing: "-0.03em" }}
            >
              {assignment.totalMarks}
            </span>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
        style={{ marginBottom: "var(--space-8)" }}
      >
        <div className="card-static">
          <p
            className="text-label-sm"
            style={{
              color: "var(--color-on-surface-variant)",
              marginBottom: "var(--space-2)",
            }}
          >
            Total Submissions
          </p>
          <p
            className="text-display-sm"
            style={{ letterSpacing: "-0.03em" }}
          >
            {submissions.length}
          </p>
        </div>
        <div className="card-static">
          <p
            className="text-label-sm"
            style={{
              color: "var(--color-on-surface-variant)",
              marginBottom: "var(--space-2)",
            }}
          >
            Average Score
          </p>
          <p className="text-display-sm" style={{ letterSpacing: "-0.03em" }}>
            <span style={{ color: "var(--color-primary)" }}>
              {averageScore.toFixed(1)}
            </span>
            <span
              style={{
                fontSize: "1rem",
                color: "var(--color-on-surface-variant)",
                marginLeft: "var(--space-1)",
              }}
            >
              / {assignment.totalMarks}
            </span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Student Submissions */}
        <div
          style={{
            background: "var(--color-surface-container-lowest)",
            borderRadius: "var(--radius-md)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "var(--space-4) var(--space-5)",
              background: "var(--color-surface-container)",
            }}
          >
            <h2 className="text-headline-sm">Student Results</h2>
          </div>
          {submissions.length === 0 ? (
            <div
              style={{
                padding: "var(--space-8)",
                textAlign: "center",
              }}
            >
              <p
                className="text-body-md"
                style={{ color: "var(--color-on-surface-variant)" }}
              >
                No submissions yet.
              </p>
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th
                    className="text-label-sm"
                    style={{
                      padding: "var(--space-3) var(--space-5)",
                      textAlign: "left",
                      color: "var(--color-on-surface-variant)",
                    }}
                  >
                    Student
                  </th>
                  <th
                    className="text-label-sm"
                    style={{
                      padding: "var(--space-3) var(--space-5)",
                      textAlign: "left",
                      color: "var(--color-on-surface-variant)",
                    }}
                  >
                    Roll No
                  </th>
                  <th
                    className="text-label-sm"
                    style={{
                      padding: "var(--space-3) var(--space-5)",
                      textAlign: "right",
                      color: "var(--color-on-surface-variant)",
                    }}
                  >
                    Score
                  </th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((sub: any) => (
                  <tr
                    key={sub.id}
                    style={{
                      transition: "background var(--transition-fast)",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background =
                        "var(--color-surface-container-high)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "transparent")
                    }
                  >
                    <td
                      style={{
                        padding: "var(--space-3) var(--space-5)",
                        whiteSpace: "nowrap",
                        fontWeight: 500,
                        color: "var(--color-on-surface)",
                        fontSize: "0.875rem",
                      }}
                    >
                      {sub.studentName}
                    </td>
                    <td
                      className="text-body-sm"
                      style={{
                        padding: "var(--space-3) var(--space-5)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {sub.studentRollNumber}
                    </td>
                    <td
                      style={{
                        padding: "var(--space-3) var(--space-5)",
                        whiteSpace: "nowrap",
                        textAlign: "right",
                        fontWeight: 600,
                        color: "var(--color-primary)",
                        fontSize: "0.875rem",
                      }}
                    >
                      {sub.score} / {assignment.totalMarks}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Question Performance */}
        <div
          style={{
            background: "var(--color-surface-container-lowest)",
            borderRadius: "var(--radius-md)",
            overflow: "hidden",
            height: "fit-content",
          }}
        >
          <div
            style={{
              padding: "var(--space-4) var(--space-5)",
              background: "var(--color-surface-container)",
            }}
          >
            <h2 className="text-headline-sm">Question Performance</h2>
          </div>
          <div
            style={{
              padding: "var(--space-5)",
              display: "flex",
              flexDirection: "column",
              gap: "var(--space-5)",
            }}
          >
            {questionStats.map(
              (
                q: {
                  questionId: string;
                  text: string;
                  topic: string;
                  marks: number;
                  correctPercentage: number;
                },
                i: number
              ) => (
                <div key={q.questionId}>
                  <div
                    className="flex justify-between items-start"
                    style={{ marginBottom: "var(--space-2)" }}
                  >
                    <span
                      style={{
                        fontSize: "0.875rem",
                        fontWeight: 500,
                        color: "var(--color-on-surface)",
                      }}
                    >
                      Q{i + 1}. {q.topic}
                    </span>
                    <span
                      className="badge"
                      style={{
                        background:
                          q.correctPercentage >= 70
                            ? "var(--color-success-container)"
                            : q.correctPercentage >= 40
                              ? "var(--color-warning-container)"
                              : "var(--color-error-container)",
                        color:
                          q.correctPercentage >= 70
                            ? "var(--color-success)"
                            : q.correctPercentage >= 40
                              ? "var(--color-warning)"
                              : "var(--color-error)",
                      }}
                    >
                      {q.correctPercentage}% Correct
                    </span>
                  </div>
                  <p
                    className="text-body-sm"
                    style={{
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {q.text}
                  </p>
                  {/* Thin progress bar */}
                  <div className="progress-track" style={{ marginTop: "var(--space-3)" }}>
                    <div
                      className="progress-indicator"
                      style={{
                        width: `${q.correctPercentage}%`,
                        background:
                          q.correctPercentage >= 70
                            ? "var(--color-success)"
                            : q.correctPercentage >= 40
                              ? "var(--color-warning)"
                              : "var(--color-error)",
                      }}
                    ></div>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
