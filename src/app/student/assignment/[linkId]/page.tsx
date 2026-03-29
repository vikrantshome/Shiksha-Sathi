import { notFound } from "next/navigation";
import StudentAssignmentForm from "@/components/StudentAssignmentForm";
import { api } from "@/lib/api";

export const dynamic = "force-dynamic";

interface StudentAssignmentPageProps {
  params: Promise<{
    linkId: string;
  }>;
}

export default async function StudentAssignmentPage({
  params,
}: StudentAssignmentPageProps) {
  const resolvedParams = await params;

  if (!resolvedParams.linkId) {
    notFound();
  }

  try {
    const assignment = await api.assignments.getByLinkId(
      resolvedParams.linkId
    );

    if (!assignment) {
      notFound();
    }

    return (
      <main
        className="min-h-screen"
        style={{
          background: "var(--color-surface)",
          padding: "var(--space-8) var(--space-4)",
        }}
      >
        <div className="max-w-4xl mx-auto">
          <div
            style={{
              background: "var(--color-surface-container-lowest)",
              borderRadius: "var(--radius-md)",
              overflow: "hidden",
            }}
          >
            {/* Header */}
            <div
              style={{
                background: "var(--color-primary)",
                padding: "var(--space-6) var(--space-8)",
                color: "var(--color-on-primary)",
                position: "relative",
              }}
            >
              <span
                className="badge"
                style={{
                  background: "rgba(255,255,255,0.15)",
                  color: "var(--color-on-primary)",
                  marginBottom: "var(--space-3)",
                  display: "inline-flex",
                }}
              >
                Student Assignment
              </span>
              <h1
                className="text-display-sm"
                style={{ color: "var(--color-on-primary)" }}
              >
                {assignment.title}
              </h1>
              <div
                className="flex flex-wrap gap-5"
                style={{
                  marginTop: "var(--space-4)",
                  fontSize: "0.8125rem",
                  opacity: 0.85,
                }}
              >
                <div className="flex items-center gap-1.5">
                  <svg
                    style={{ width: "1rem", height: "1rem" }}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Due:{" "}
                  {new Date(assignment.dueDate).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-1.5">
                  <svg
                    style={{ width: "1rem", height: "1rem" }}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                  {assignment.totalMarks} Marks
                </div>
              </div>
            </div>

            <StudentAssignmentForm assignment={assignment} />
          </div>
        </div>
      </main>
    );
  } catch (error) {
    notFound();
  }
}
