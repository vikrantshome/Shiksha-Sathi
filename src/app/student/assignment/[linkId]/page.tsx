import { notFound } from "next/navigation";
import StudentAssignmentForm from "@/components/StudentAssignmentForm";
import { api } from "@/lib/api";

export const dynamic = "force-dynamic";

/* ─────────────────────────────────────────────────────────
   Student Assignment Page — Stitch-Directed Redesign
   Design Source: doc/stitch_shiksha_sathi_ui_refresh/identity_entry + answer_questions + results
   Implements: centered assessment canvas with branded top bar,
   assignment context metadata, and decorative background.
   ───────────────────────────────────────────────────────── */

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
      <div
        style={{
          minHeight: "100vh",
          background: "var(--color-surface)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* ═══ Top App Bar — Stitch "Identity Entry" pattern ═══ */}
        <header
          style={{
            position: "fixed",
            top: 0,
            width: "100%",
            zIndex: 50,
            background: "rgba(250, 249, 245, 0.85)",
            backdropFilter: "blur(12px)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "var(--space-4) var(--space-8)",
          }}
        >
          <div>
            <h1
              style={{
                fontFamily: "var(--font-manrope), system-ui, sans-serif",
                fontSize: "1.25rem",
                fontWeight: 700,
                color: "var(--color-primary)",
                letterSpacing: "-0.03em",
                margin: 0,
              }}
            >
              Shiksha Sathi
            </h1>
            <span
              style={{
                fontSize: "0.6875rem",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                color: "var(--color-on-surface-variant)",
                fontWeight: 500,
              }}
            >
              Student Assessment
            </span>
          </div>

          {/* Assignment Context Cluster */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--space-6)",
            }}
            className="assignment-context-cluster"
          >
            <div style={{ textAlign: "right" }}>
              <span
                style={{
                  fontSize: "0.75rem",
                  color: "var(--color-on-surface-variant)",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  fontWeight: 600,
                }}
              >
                {assignment.title}
              </span>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-end",
                  gap: "var(--space-2)",
                  marginTop: "var(--space-1)",
                }}
              >
                <span
                  style={{
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    color: "var(--color-primary)",
                  }}
                >
                  {assignment.totalMarks} Marks
                </span>
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
                    fontSize: "0.875rem",
                    color: "var(--color-on-surface-variant)",
                  }}
                >
                  Due {new Date(assignment.dueDate).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Top divider */}
        <div
          style={{
            position: "fixed",
            top: "72px",
            width: "100%",
            height: "1px",
            background: "var(--color-surface-container)",
            zIndex: 40,
          }}
        />

        {/* ═══ Main Content Canvas ═══ */}
        <main
          style={{
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            paddingTop: "5.5rem",
            paddingBottom: "4rem",
            paddingLeft: "var(--space-6)",
            paddingRight: "var(--space-6)",
            position: "relative",
          }}
        >
          {/* Decorative background blurs — Stitch pattern */}
          <div
            style={{
              position: "fixed",
              top: "-10%",
              left: "-5%",
              width: "40%",
              height: "60%",
              background: "rgba(198, 232, 248, 0.08)",
              borderRadius: "50%",
              filter: "blur(120px)",
              pointerEvents: "none",
              zIndex: -1,
            }}
          />
          <div
            style={{
              position: "fixed",
              top: "60%",
              right: "-10%",
              width: "35%",
              height: "50%",
              background: "rgba(215, 227, 250, 0.15)",
              borderRadius: "50%",
              filter: "blur(100px)",
              pointerEvents: "none",
              zIndex: -1,
            }}
          />

          <div style={{ width: "100%", maxWidth: "48rem" }}>
            <StudentAssignmentForm assignment={assignment} />
          </div>
        </main>

        {/* ═══ Footer ═══ */}
        <footer
          style={{
            padding: "var(--space-8)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "var(--space-4)",
          }}
        >
          <div
            style={{
              width: "3rem",
              height: "2px",
              background: "rgba(68, 99, 113, 0.2)",
            }}
          />
          <p
            style={{
              fontSize: "0.6875rem",
              color: "var(--color-on-surface-variant)",
              fontWeight: 500,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
            }}
          >
            Shiksha Sathi © 2025
          </p>
        </footer>

        {/* Hide context cluster on small screens */}
        <style>{`
          @media (max-width: 640px) {
            .assignment-context-cluster { display: none !important; }
          }
        `}</style>
      </div>
    );
  } catch (error) {
    notFound();
  }
}
