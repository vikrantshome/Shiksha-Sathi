import { api } from "@/lib/api";
import { AssignmentWithStats } from "@/lib/api/types";
import Link from "next/link";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

/* ─────────────────────────────────────────────────────────
   Stitch-Directed Teacher Dashboard
   Design Source: doc/stitch_shiksha_sathi_ui_refresh/teacher_dashboard_consolidated
   Design System: design-system.md ("Digital Atelier")
   ───────────────────────────────────────────────────────── */

/* ── Inline SVG Icon Components (2px stroke, outline style) ── */
const IconAssignment = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
    <rect x="9" y="3" width="6" height="4" rx="1" />
    <path d="M9 12h6" /><path d="M9 16h6" />
  </svg>
);
const IconGroups = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);
const IconTrending = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
    <polyline points="16 7 22 7 22 13" />
  </svg>
);
const IconSchool = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
    <path d="M6 12v5c0 1 2 3 6 3s6-2 6-3v-5" />
  </svg>
);
const IconPlus = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M8 12h8" /><path d="M12 8v8" />
  </svg>
);
const IconArrow = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
  </svg>
);
const IconChevronRight = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="m9 18 6-6-6-6" />
  </svg>
);

/* ── Curriculum Navigator Subjects ── */
const curriculumTiles = [
  { grade: "Grade 9", subject: "Mathematics" },
  { grade: "Grade 9", subject: "Physics" },
  { grade: "Grade 10", subject: "Chemistry" },
  { grade: "Grade 10", subject: "Biology" },
  { grade: "Grade 11", subject: "Calculus" },
  { grade: "Grade 12", subject: "Quantum" },
];

/* ── Activity Feed Data ── */
const recentActivity = [
  { text: "New submission in Class 9A", time: "12 minutes ago", isNew: true },
  { text: "Assignment 'Periodic Table' scheduled", time: "2 hours ago", isNew: false },
  { text: "Question Bank updated: Biology", time: "Yesterday", isNew: false },
];

export default async function TeacherDashboard() {
  /* ── Data Fetching (Server Component) ── */
  let user;
  try {
    user = await api.auth.getMe();
  } catch {
    redirect("/login");
  }

  let assignments: AssignmentWithStats[] = [];
  try {
    assignments = await api.assignments.getStats(user.id);
  } catch (error) {
    console.error("Failed to load assignments:", error);
  }

  const totalSubmissions = assignments.reduce(
    (acc: number, a: AssignmentWithStats) => acc + (a.submissionCount || 0),
    0
  );
  const activeAssignments = assignments.filter(
    (a: AssignmentWithStats) => a.submissionCount > 0
  ).length;

  /* ── Stat Cards Configuration ── */
  const stats = [
    {
      icon: <IconAssignment />,
      value: assignments.length,
      label: "Total Assignments",
      badge: `+${Math.min(assignments.length, 2)} this week`,
    },
    {
      icon: <IconGroups />,
      value: totalSubmissions,
      label: "Total Submissions",
      badge: `${assignments.length > 0 ? Math.round((totalSubmissions / (assignments.length * 45)) * 100) : 0}% completion`,
    },
    {
      icon: <IconTrending />,
      value: assignments.length > 0
        ? `${Math.round(assignments.reduce((acc: number, a: AssignmentWithStats) => acc + (a.averageScore || 0), 0) / assignments.length)}%`
        : "—",
      label: "Average Score",
      badge: "+4.2% trend",
    },
    {
      icon: <IconSchool />,
      value: new Set(assignments.map((a: AssignmentWithStats) => a.className).filter(Boolean)).size || 0,
      label: "Active Classes",
      badge: "All Grades",
    },
  ];

  /* ── Get time-based greeting ── */
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div style={{ maxWidth: "100%", paddingBottom: "var(--space-12)" }}>
      {/* ═══ Welcome Banner ═══ */}
      <header style={{ marginBottom: "var(--space-12)" }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-6)",
          }}
        >
          <div>
            <span
              style={{
                display: "block",
                fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
                fontSize: "0.6875rem",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                color: "var(--color-primary)",
                marginBottom: "var(--space-2)",
              }}
            >
              Teacher Dashboard
            </span>
            <h1
              style={{
                fontFamily: "var(--font-manrope), system-ui, sans-serif",
                fontSize: "clamp(1.5rem, 3vw, 1.875rem)",
                fontWeight: 800,
                color: "var(--color-on-surface)",
                letterSpacing: "-0.02em",
                lineHeight: 1.2,
                margin: 0,
              }}
            >
              {greeting}, {user.name || "Teacher"}.
            </h1>
            <p
              style={{
                fontSize: "0.875rem",
                color: "var(--color-on-surface-variant)",
                marginTop: "var(--space-2)",
                maxWidth: "28rem",
                lineHeight: 1.6,
              }}
            >
              Your teaching studio is aligned for the day. You have{" "}
              {activeAssignments}{" "}
              active assignment{activeAssignments === 1 ? "" : "s"}{" "}
              ready for review or follow-up.
            </p>
          </div>
        </div>
      </header>

      {/* ═══ Summary Stat Cards ═══ */}
      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(1, 1fr)",
          gap: "var(--space-6)",
          marginBottom: "var(--space-12)",
        }}
        className="stat-grid"
      >
        {stats.map((stat, i) => (
          <div
            key={i}
            style={{
              background: "var(--color-surface-container-lowest)",
              padding: "var(--space-6)",
              borderRadius: "var(--radius-md)",
              border: "1px solid rgba(176, 179, 173, 0.05)",
              boxShadow: "0 4px 12px rgba(48, 51, 47, 0.03)",
              transition: "box-shadow 200ms ease-out",
            }}
            className="stat-card"
          >
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
                  padding: "var(--space-2)",
                  background: "var(--color-surface-container-low)",
                  borderRadius: "var(--radius-sm)",
                  color: "var(--color-primary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "background 120ms ease-out",
                }}
                className="stat-icon"
              >
                {stat.icon}
              </div>
              <span
                style={{
                  fontSize: "0.625rem",
                  fontWeight: 700,
                  color: "var(--color-primary-dim)",
                }}
              >
                {stat.badge}
              </span>
            </div>
            <h3
              style={{
                fontFamily: "var(--font-manrope), system-ui, sans-serif",
                fontSize: "1.5rem",
                fontWeight: 700,
                color: "var(--color-on-surface)",
                margin: 0,
              }}
            >
              {stat.value}
            </h3>
            <p
              style={{
                fontSize: "0.6875rem",
                fontWeight: 500,
                color: "var(--color-on-surface-variant)",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginTop: "var(--space-1)",
              }}
            >
              {stat.label}
            </p>
          </div>
        ))}
      </section>

      {/* ═══ Bento Grid: Assignments + Sidebar ═══ */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: "var(--space-8)",
        }}
        className="bento-grid"
      >
        {/* ── Left: Recent Assignments ── */}
        <section className="bento-main">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "var(--space-4)",
            }}
          >
            <h2
              style={{
                fontFamily: "var(--font-manrope), system-ui, sans-serif",
                fontSize: "1.125rem",
                fontWeight: 700,
                color: "var(--color-on-surface)",
                letterSpacing: "-0.01em",
              }}
            >
              Recent Assignments
            </h2>
          </div>

          {assignments.length === 0 ? (
            /* ── Empty State ── */
            <div
              style={{
                background: "var(--color-surface-container-low)",
                borderRadius: "var(--radius-md)",
                border: "2px dashed rgba(176, 179, 173, 0.3)",
                padding: "var(--space-10)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  width: "3rem",
                  height: "3rem",
                  background: "var(--color-surface-container)",
                  borderRadius: "var(--radius-full)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "var(--space-4)",
                  color: "var(--color-outline)",
                }}
              >
                <IconPlus />
              </div>
              <h4
                style={{
                  fontSize: "0.875rem",
                  fontWeight: 700,
                  color: "var(--color-on-surface)",
                  margin: 0,
                }}
              >
                No Assignments Yet
              </h4>
              <p
                style={{
                  fontSize: "0.75rem",
                  color: "var(--color-on-surface-variant)",
                  marginTop: "var(--space-2)",
                  lineHeight: 1.6,
                  maxWidth: "20rem",
                }}
              >
                Browse the Question Bank to build your first assignment and
                start your classroom workflow.
              </p>
              <Link
                href="/teacher/question-bank"
                style={{
                  marginTop: "var(--space-6)",
                  fontSize: "0.6875rem",
                  fontWeight: 700,
                  color: "var(--color-primary)",
                  textDecoration: "none",
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--space-2)",
                }}
              >
                Create New Assignment
                <IconArrow />
              </Link>
            </div>
          ) : (
            /* ── Assignments Table ── */
            <div
              style={{
                background: "var(--color-surface-container-lowest)",
                borderRadius: "var(--radius-md)",
                border: "1px solid rgba(176, 179, 173, 0.1)",
                overflow: "hidden",
              }}
            >
              {/* Desktop Table */}
              <div className="table-desktop">
                <div style={{ overflowX: "auto" }}>
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      textAlign: "left",
                      fontSize: "0.875rem",
                    }}
                  >
                    <thead>
                      <tr
                        style={{
                          background: "var(--color-surface-container-low)",
                          borderBottom: "1px solid rgba(176, 179, 173, 0.1)",
                        }}
                      >
                        {["Assignment Title", "Class", "Submissions", "Avg. Score", "Action"].map(
                          (h, idx) => (
                            <th
                              key={h}
                              style={{
                                padding: "var(--space-4) var(--space-6)",
                                fontSize: "0.625rem",
                                fontWeight: 700,
                                textTransform: "uppercase",
                                letterSpacing: "0.1em",
                                color: "var(--color-on-surface-variant)",
                                textAlign: idx === 4 ? "right" : "left",
                              }}
                            >
                              {h}
                            </th>
                          )
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {assignments.map((assignment: AssignmentWithStats) => {
                        const submissionPct = assignment.maxScore > 0 
                          ? Math.round((assignment.submissionCount / 45) * 100)
                          : 0;
                        return (
                          <tr
                            key={assignment.id}
                            style={{
                              borderBottom: "1px solid rgba(176, 179, 173, 0.05)",
                              transition: "background 120ms ease-out",
                            }}
                            className="table-row-hover"
                          >
                            <td style={{ padding: "var(--space-4) var(--space-6)" }}>
                              <p
                                style={{
                                  fontWeight: 600,
                                  color: "var(--color-on-surface)",
                                  margin: 0,
                                  fontSize: "0.875rem",
                                }}
                              >
                                {assignment.title}
                              </p>
                              <p
                                style={{
                                  fontSize: "0.625rem",
                                  color: "var(--color-on-surface-variant)",
                                  margin: 0,
                                  marginTop: "2px",
                                }}
                              >
                                ID: {assignment.linkId}
                              </p>
                            </td>
                            <td
                              style={{
                                padding: "var(--space-4) var(--space-6)",
                                color: "var(--color-on-surface-variant)",
                                fontSize: "0.875rem",
                              }}
                            >
                              {assignment.className || "Unassigned"}
                            </td>
                            <td style={{ padding: "var(--space-4) var(--space-6)" }}>
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "var(--space-2)",
                                }}
                              >
                                <span
                                  style={{
                                    fontWeight: 500,
                                    color: "var(--color-on-surface)",
                                    fontSize: "0.875rem",
                                  }}
                                >
                                  {assignment.submissionCount}
                                </span>
                                <div
                                  style={{
                                    width: "4rem",
                                    height: "2px",
                                    background: "var(--color-surface-container)",
                                    borderRadius: "9999px",
                                    overflow: "hidden",
                                  }}
                                >
                                  <div
                                    style={{
                                      height: "100%",
                                      background: "var(--color-primary)",
                                      width: `${Math.min(submissionPct, 100)}%`,
                                      borderRadius: "9999px",
                                    }}
                                  />
                                </div>
                              </div>
                            </td>
                            <td
                              style={{
                                padding: "var(--space-4) var(--space-6)",
                                fontWeight: 600,
                                color: "var(--color-primary)",
                                fontSize: "0.875rem",
                              }}
                            >
                              {assignment.averageScore}
                              <span
                                style={{
                                  fontWeight: 400,
                                  color: "var(--color-on-surface-variant)",
                                }}
                              >
                                {" "}/ {assignment.maxScore}
                              </span>
                            </td>
                            <td
                              style={{
                                padding: "var(--space-4) var(--space-6)",
                                textAlign: "right",
                              }}
                            >
                              <Link
                                href={`/teacher/assignments/${assignment.id}`}
                                style={{
                                  fontSize: "0.6875rem",
                                  fontWeight: 700,
                                  color: "var(--color-primary)",
                                  textTransform: "uppercase",
                                  letterSpacing: "0.05em",
                                  textDecoration: "none",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "var(--space-1)",
                                }}
                              >
                                View Report
                                <IconChevronRight />
                              </Link>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mobile Card Fallback */}
              <div className="table-mobile">
                {assignments.map((assignment: AssignmentWithStats) => (
                  <Link
                    key={assignment.id}
                    href={`/teacher/assignments/${assignment.id}`}
                    style={{
                      display: "block",
                      padding: "var(--space-4) var(--space-5)",
                      borderBottom: "1px solid rgba(176, 179, 173, 0.05)",
                      textDecoration: "none",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                      }}
                    >
                      <div>
                        <p
                          style={{
                            fontWeight: 600,
                            color: "var(--color-on-surface)",
                            fontSize: "0.875rem",
                            margin: 0,
                          }}
                        >
                          {assignment.title}
                        </p>
                        <p
                          style={{
                            fontSize: "0.6875rem",
                            color: "var(--color-on-surface-variant)",
                            margin: "2px 0 0",
                          }}
                        >
                          {assignment.className || "Unassigned"} • {assignment.submissionCount} submissions
                        </p>
                      </div>
                      <span
                        style={{
                          fontSize: "0.875rem",
                          fontWeight: 600,
                          color: "var(--color-primary)",
                        }}
                      >
                        {assignment.averageScore}/{assignment.maxScore}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* ── Right Sidebar Column ── */}
        <section className="bento-side">
          {/* Teaching Focus */}
          <div style={{ marginBottom: "var(--space-8)" }}>
            <h2
              style={{
                fontFamily: "var(--font-manrope), system-ui, sans-serif",
                fontSize: "1.125rem",
                fontWeight: 700,
                color: "var(--color-on-surface)",
                letterSpacing: "-0.01em",
                marginBottom: "var(--space-6)",
              }}
            >
              Teaching Focus
            </h2>
            <div
              style={{
                background: "var(--color-surface-container-low)",
                borderRadius: "var(--radius-md)",
                padding: "var(--space-8)",
                display: "grid",
                gap: "var(--space-5)",
              }}
            >
              <div>
                <p
                  style={{
                    fontSize: "0.6875rem",
                    fontWeight: 700,
                    color: "var(--color-on-surface-variant)",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    margin: 0,
                  }}
                >
                  Review Queue
                </p>
                <p
                  style={{
                    margin: "var(--space-2) 0 0",
                    fontFamily: "var(--font-manrope), system-ui, sans-serif",
                    fontSize: "1.75rem",
                    fontWeight: 700,
                    color: "var(--color-primary)",
                  }}
                >
                  {activeAssignments}
                </p>
                <p
                  style={{
                    fontSize: "0.8125rem",
                    color: "var(--color-on-surface-variant)",
                    margin: "var(--space-2) 0 0",
                    lineHeight: 1.6,
                  }}
                >
                  Assignment{activeAssignments === 1 ? "" : "s"} currently collecting or awaiting submissions.
                </p>
              </div>
              <div
                style={{
                  display: "grid",
                  gap: "var(--space-3)",
                  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                }}
              >
                <Link
                  href="/teacher/question-bank"
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    color: "var(--color-on-primary)",
                    textDecoration: "none",
                    background: "var(--color-primary)",
                    borderRadius: "var(--radius-sm)",
                    padding: "var(--space-3) var(--space-4)",
                    textAlign: "center",
                  }}
                >
                  Create Assignment
                </Link>
                <Link
                  href="/teacher/classes"
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    color: "var(--color-primary)",
                    textDecoration: "none",
                    background: "var(--color-surface-container-lowest)",
                    borderRadius: "var(--radius-sm)",
                    padding: "var(--space-3) var(--space-4)",
                    textAlign: "center",
                  }}
                >
                  Manage Classes
                </Link>
              </div>
            </div>
          </div>

          {/* Recent Activity Timeline */}
          <div>
            <h2
              style={{
                fontFamily: "var(--font-manrope), system-ui, sans-serif",
                fontSize: "1.125rem",
                fontWeight: 700,
                color: "var(--color-on-surface)",
                letterSpacing: "-0.01em",
                marginBottom: "var(--space-4)",
              }}
            >
              Recent Activity
            </h2>
            <div
              style={{
                paddingLeft: "var(--space-2)",
                borderLeft: "2px solid var(--color-surface-container)",
              }}
            >
              {recentActivity.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    position: "relative",
                    paddingLeft: "var(--space-6)",
                    paddingBottom: idx < recentActivity.length - 1 ? "var(--space-6)" : 0,
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      width: "0.5rem",
                      height: "0.5rem",
                      borderRadius: "var(--radius-full)",
                      background: item.isNew
                        ? "var(--color-primary)"
                        : "var(--color-outline-variant)",
                      left: "-5px",
                      top: "4px",
                    }}
                  />
                  <p
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      color: "var(--color-on-surface)",
                      margin: 0,
                    }}
                  >
                    {item.text}
                  </p>
                  <p
                    style={{
                      fontSize: "0.625rem",
                      color: "var(--color-on-surface-variant)",
                      textTransform: "uppercase",
                      marginTop: "var(--space-1)",
                    }}
                  >
                    {item.time}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* ═══ NCERT Curriculum Navigator ═══ */}
      <section style={{ marginTop: "var(--space-16)" }}>
        <h2
          style={{
            fontFamily: "var(--font-manrope), system-ui, sans-serif",
            fontSize: "1.125rem",
            fontWeight: 700,
            color: "var(--color-on-surface)",
            letterSpacing: "-0.01em",
            marginBottom: "var(--space-6)",
          }}
        >
          Curriculum Explorer
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "var(--space-4)",
          }}
          className="curriculum-grid"
        >
          {curriculumTiles.map((tile, idx) => (
            <div
              key={idx}
              style={{
                aspectRatio: "1",
                background: "var(--color-surface-container-high)",
                borderRadius: "var(--radius-sm)",
                padding: "var(--space-4)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                cursor: "pointer",
                transition: "background 200ms ease-out",
              }}
              className="curriculum-tile"
            >
              <span
                style={{
                  fontSize: "0.625rem",
                  fontWeight: 700,
                  color: "var(--color-on-surface-variant)",
                  textTransform: "uppercase",
                  letterSpacing: "-0.02em",
                }}
                className="tile-label"
              >
                {tile.grade}
              </span>
              <span
                style={{
                  fontSize: "0.875rem",
                  fontWeight: 700,
                  color: "var(--color-on-surface)",
                }}
              >
                {tile.subject}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ Responsive Styles (CSS-in-JSX) ═══ */}
      <style>{`
        /* ── Stat Grid: 1→2→4 columns ── */
        .stat-grid {
          grid-template-columns: 1fr;
        }
        @media (min-width: 640px) {
          .stat-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (min-width: 1024px) {
          .stat-grid {
            grid-template-columns: repeat(4, 1fr);
          }
        }

        /* ── Stat Card Hover ── */
        .stat-card:hover {
          box-shadow: 0 12px 32px rgba(48, 51, 47, 0.06);
        }
        .stat-card:hover .stat-icon {
          background: rgba(68, 99, 113, 0.05);
        }

        /* ── Bento Grid: stack→side-by-side ── */
        .bento-grid {
          grid-template-columns: 1fr;
        }
        @media (min-width: 1024px) {
          .bento-grid {
            grid-template-columns: 2fr 1fr;
          }
        }

        /* ── Table: Desktop vs Mobile ── */
        .table-desktop {
          display: none;
        }
        .table-mobile {
          display: block;
        }
        @media (min-width: 768px) {
          .table-desktop {
            display: block;
          }
          .table-mobile {
            display: none;
          }
        }

        /* ── Table Row Hover ── */
        .table-row-hover:hover {
          background: var(--color-surface-container-high);
        }

        /* ── Curriculum Grid: 2→4→6 columns ── */
        .curriculum-grid {
          grid-template-columns: repeat(2, 1fr);
        }
        @media (min-width: 768px) {
          .curriculum-grid {
            grid-template-columns: repeat(4, 1fr);
          }
        }
        @media (min-width: 1024px) {
          .curriculum-grid {
            grid-template-columns: repeat(6, 1fr);
          }
        }

        /* ── Curriculum Tile Hover ── */
        .curriculum-tile:hover {
          background: var(--color-primary-container) !important;
        }
        .curriculum-tile:hover .tile-label {
          color: var(--color-primary) !important;
        }
      `}</style>
    </div>
  );
}
