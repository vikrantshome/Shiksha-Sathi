import { api } from "@/lib/api";
import Link from "next/link";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function TeacherDashboard() {
  let user;
  try {
    user = await api.auth.getMe();
  } catch (error) {
    redirect("/login");
  }

  let assignments: any[] = [];
  try {
    assignments = await api.assignments.getStats(user.id);
  } catch (error) {
    console.error("Failed to load assignments", error);
  }

  const totalSubmissions = assignments.reduce(
    (acc: number, a: any) => acc + a.submissionCount,
    0
  );

  return (
    <div>
      {/* Page Header */}
      <div
        className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4"
        style={{ marginBottom: "var(--space-8)" }}
      >
        <div>
          <p
            className="text-label-md"
            style={{
              color: "var(--color-primary)",
              marginBottom: "var(--space-1)",
            }}
          >
            Welcome back
          </p>
          <h1 className="text-display-sm">{user.name || "Teacher"}</h1>
        </div>
        <Link href="/teacher/question-bank" className="btn-primary">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            style={{ width: "1rem", height: "1rem" }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4.5v15m7.5-7.5h-15"
            />
          </svg>
          Create New Assignment
        </Link>
      </div>

      {/* Stat Cards */}
      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
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
            Total Assignments
          </p>
          <p
            className="text-display-sm"
            style={{ letterSpacing: "-0.03em" }}
          >
            {assignments.length}
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
            Total Submissions
          </p>
          <p
            className="text-display-sm"
            style={{ letterSpacing: "-0.03em" }}
          >
            {totalSubmissions}
          </p>
        </div>
        <div className="card-static sm:col-span-2 lg:col-span-1">
          <p
            className="text-label-sm"
            style={{
              color: "var(--color-on-surface-variant)",
              marginBottom: "var(--space-2)",
            }}
          >
            Active Assignments
          </p>
          <p
            className="text-display-sm"
            style={{ letterSpacing: "-0.03em" }}
          >
            {assignments.filter((a: any) => a.submissionCount > 0).length}
          </p>
        </div>
      </div>

      {/* Recent Assignments */}
      <h2
        className="text-headline-md"
        style={{ marginBottom: "var(--space-4)" }}
      >
        Recent Assignments
      </h2>

      {assignments.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "var(--space-12) var(--space-8)",
            background: "var(--color-surface-container-lowest)",
            borderRadius: "var(--radius-md)",
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
            You haven&apos;t created any assignments yet.
          </p>
          <Link href="/teacher/question-bank" className="btn-ghost">
            Browse the Question Bank to get started →
          </Link>
        </div>
      ) : (
        <div
          style={{
            background: "var(--color-surface-container-lowest)",
            borderRadius: "var(--radius-md)",
            overflow: "hidden",
          }}
        >
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr
                style={{
                  background: "var(--color-surface-container)",
                }}
              >
                <th
                  className="text-label-sm"
                  style={{
                    padding: "var(--space-3) var(--space-5)",
                    textAlign: "left",
                    color: "var(--color-on-surface-variant)",
                  }}
                >
                  Assignment
                </th>
                <th
                  className="text-label-sm"
                  style={{
                    padding: "var(--space-3) var(--space-5)",
                    textAlign: "left",
                    color: "var(--color-on-surface-variant)",
                  }}
                >
                  Class
                </th>
                <th
                  className="text-label-sm"
                  style={{
                    padding: "var(--space-3) var(--space-5)",
                    textAlign: "left",
                    color: "var(--color-on-surface-variant)",
                  }}
                >
                  Submissions
                </th>
                <th
                  className="text-label-sm"
                  style={{
                    padding: "var(--space-3) var(--space-5)",
                    textAlign: "left",
                    color: "var(--color-on-surface-variant)",
                  }}
                >
                  Avg Score
                </th>
                <th
                  className="text-label-sm"
                  style={{
                    padding: "var(--space-3) var(--space-5)",
                    textAlign: "right",
                    color: "var(--color-on-surface-variant)",
                  }}
                >
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {assignments.map((assignment: any) => (
                <tr
                  key={assignment.id}
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
                      padding: "var(--space-4) var(--space-5)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    <div
                      style={{
                        fontWeight: 500,
                        color: "var(--color-on-surface)",
                        fontSize: "0.875rem",
                      }}
                    >
                      {assignment.title}
                    </div>
                    <div
                      className="text-label-md"
                      style={{
                        color: "var(--color-on-surface-variant)",
                        marginTop: "2px",
                      }}
                      title={`Link: /student/assignment/${assignment.linkId}`}
                    >
                      ID: {assignment.linkId}
                    </div>
                  </td>
                  <td
                    className="text-body-sm"
                    style={{
                      padding: "var(--space-4) var(--space-5)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {assignment.className}
                  </td>
                  <td
                    style={{
                      padding: "var(--space-4) var(--space-5)",
                      whiteSpace: "nowrap",
                      fontWeight: 500,
                      color: "var(--color-on-surface)",
                      fontSize: "0.875rem",
                    }}
                  >
                    {assignment.submissionCount}
                  </td>
                  <td
                    style={{
                      padding: "var(--space-4) var(--space-5)",
                      whiteSpace: "nowrap",
                      fontWeight: 500,
                      color: "var(--color-on-surface)",
                      fontSize: "0.875rem",
                    }}
                  >
                    {assignment.averageScore} / {assignment.maxScore}
                  </td>
                  <td
                    style={{
                      padding: "var(--space-4) var(--space-5)",
                      whiteSpace: "nowrap",
                      textAlign: "right",
                    }}
                  >
                    <Link
                      href={`/teacher/assignments/${assignment.id}`}
                      className="btn-ghost"
                      style={{
                        padding: "var(--space-1) var(--space-3)",
                        fontSize: "0.8125rem",
                      }}
                    >
                      View Report
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
