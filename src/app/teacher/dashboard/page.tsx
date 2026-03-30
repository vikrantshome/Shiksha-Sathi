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
    <div className="max-w-full pb-12">
      {/* ═══ Welcome Banner ═══ */}
      <header className="mb-6 md:mb-8 lg:mb-12">
        <div className="flex flex-col gap-4 md:gap-6">
          <div>
            <span className="block font-sans text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-primary mb-2">
              Teacher Dashboard
            </span>
            <h1 className="font-manrope text-[clamp(1.5rem,3vw,1.875rem)] font-extrabold text-on-surface tracking-[-0.02em] leading-[1.2] m-0">
              {greeting}, {user.name || "Teacher"}.
            </h1>
            <p className="text-sm text-on-surface-variant mt-2 max-w-[28rem] leading-[1.6]">
              Your teaching studio is aligned for the day. You have{" "}
              {activeAssignments}{" "}
              active assignment{activeAssignments === 1 ? "" : "s"}{" "}
              ready for review or follow-up.
            </p>
          </div>
        </div>
      </header>

      {/* ═══ Summary Stat Cards ═══ */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8 md:mb-12">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="group bg-surface-container-lowest p-5 md:p-6 rounded-md border border-outline/5 shadow-sm transition-shadow duration-200 hover:shadow-[0_12px_32px_rgba(48,51,47,0.06)]"
          >
            <div className="flex justify-between items-start mb-3 md:mb-4">
              <div
                className="p-2 bg-surface-container-low rounded-sm text-primary flex items-center justify-center transition-colors duration-200 group-hover:bg-[#4463710D]"
              >
                {stat.icon}
              </div>
              <span className="text-[0.625rem] font-bold text-primary-dim">
                {stat.badge}
              </span>
            </div>
            <h3 className="font-manrope text-2xl font-bold text-on-surface m-0">
              {stat.value}
            </h3>
            <p className="text-[0.6875rem] font-medium text-on-surface-variant uppercase tracking-[0.08em] mt-1">
              {stat.label}
            </p>
          </div>
        ))}
      </section>

      {/* ═══ Bento Grid: Assignments + Sidebar ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6 md:gap-8">
        {/* ── Left: Recent Assignments ── */}
        <section>
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <h2 className="font-manrope text-lg font-bold text-on-surface tracking-[-0.01em]">
              Recent Assignments
            </h2>
          </div>

          {assignments.length === 0 ? (
            /* ── Empty State ── */
            <div className="bg-surface-container-low rounded-md border-2 border-dashed border-outline/30 p-8 md:p-10 flex flex-col items-center text-center">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-surface-container rounded-full flex items-center justify-center mb-3 md:mb-4 text-outline">
                <IconPlus />
              </div>
              <h4 className="text-sm font-bold text-on-surface m-0">
                No Assignments Yet
              </h4>
              <p className="text-xs text-on-surface-variant mt-2 leading-[1.6] max-w-[20rem]">
                Browse the Question Bank to build your first assignment and
                start your classroom workflow.
              </p>
              <Link
                href="/teacher/question-bank"
                className="mt-4 md:mt-6 text-[0.6875rem] font-bold text-primary no-underline flex items-center gap-2"
              >
                Create New Assignment
                <IconArrow />
              </Link>
            </div>
          ) : (
            /* ── Assignments Table ── */
            <div className="bg-surface-container-lowest rounded-md border border-outline/10 overflow-hidden">
              {/* Desktop Table */}
              <div className="hidden md:block">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left text-sm">
                    <thead>
                      <tr className="bg-surface-container-low border-b border-outline/10">
                        {["Assignment Title", "Class", "Submissions", "Avg. Score", "Action"].map(
                          (h, idx) => (
                            <th
                              key={h}
                              className={`p-3 md:p-4 px-4 md:px-6 text-[0.625rem] font-bold uppercase tracking-[0.1em] text-on-surface-variant ${idx === 4 ? "text-right" : "text-left"}`}
                            >
                              {h}
                            </th>
                          )
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {assignments.map((assignment) => {
                        const submissionPct = assignment.maxScore > 0 
                          ? Math.round((assignment.submissionCount / 45) * 100)
                          : 0;
                        return (
                          <tr
                            key={assignment.id}
                            className="border-b border-outline/5 transition-colors duration-200 ease-out hover:bg-surface-container-high"
                          >
                            <td className="p-3 md:p-4 px-4 md:px-6">
                              <p className="font-semibold text-on-surface m-0 text-sm">
                                {assignment.title}
                              </p>
                              <p className="text-[0.625rem] text-on-surface-variant m-0 mt-0.5">
                                ID: {assignment.linkId}
                              </p>
                            </td>
                            <td className="p-3 md:p-4 px-4 md:px-6 text-on-surface-variant text-sm">
                              {assignment.className || "Unassigned"}
                            </td>
                            <td className="p-3 md:p-4 px-4 md:px-6">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-on-surface text-sm">
                                  {assignment.submissionCount}
                                </span>
                                <div className="w-16 h-0.5 bg-surface-container rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-primary rounded-full transition-all duration-300 w-[var(--bar-w)]"
                                    style={{ '--bar-w': `${Math.min(submissionPct, 100)}%` } as React.CSSProperties}
                                  />
                                </div>
                              </div>
                            </td>
                            <td className="p-3 md:p-4 px-4 md:px-6 font-semibold text-primary text-sm">
                              {assignment.averageScore}
                              <span className="font-normal text-on-surface-variant">
                                {" "}/ {assignment.maxScore}
                              </span>
                            </td>
                            <td className="p-3 md:p-4 px-4 md:px-6 text-right">
                              <Link
                                href={`/teacher/assignments/${assignment.id}`}
                                className="text-[0.6875rem] font-bold text-primary uppercase tracking-[0.05em] no-underline inline-flex items-center gap-1"
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
              <div className="block md:hidden">
                {assignments.map((assignment) => (
                  <Link
                    key={assignment.id}
                    href={`/teacher/assignments/${assignment.id}`}
                    className="block p-4 px-5 border-b border-outline/5 no-underline"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-on-surface text-sm m-0">
                          {assignment.title}
                        </p>
                        <p className="text-[0.6875rem] text-on-surface-variant m-[2px_0_0]">
                          {assignment.className || "Unassigned"} • {assignment.submissionCount} submissions
                        </p>
                      </div>
                      <span className="text-sm font-semibold text-primary">
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
        <section>
          {/* Teaching Focus */}
          <div className="mb-6 md:mb-8">
            <h2 className="font-manrope text-lg font-bold text-on-surface tracking-[-0.01em] mb-4 md:mb-6">
              Teaching Focus
            </h2>
            <div className="bg-surface-container-low rounded-md p-5 md:p-6 lg:p-8 grid gap-4 md:gap-5">
              <div>
                <p className="text-[0.6875rem] font-bold text-on-surface-variant tracking-[0.08em] uppercase m-0">
                  Review Queue
                </p>
                <p className="m-[8px_0_0] font-manrope text-[1.75rem] font-bold text-primary">
                  {activeAssignments}
                </p>
                <p className="text-[0.8125rem] text-on-surface-variant m-[8px_0_0] leading-[1.6]">
                  Assignment{activeAssignments === 1 ? "" : "s"} currently collecting or awaiting submissions.
                </p>
              </div>
              <div className="grid gap-2 md:gap-3 grid-cols-2">
                <Link
                  href="/teacher/question-bank"
                  className="text-xs font-bold text-on-primary no-underline bg-primary rounded-sm p-2.5 md:p-3 px-3 md:px-4 text-center"
                >
                  Create Assignment
                </Link>
                <Link
                  href="/teacher/classes"
                  className="text-xs font-bold text-primary no-underline bg-surface-container-lowest rounded-sm p-2.5 md:p-3 px-3 md:px-4 text-center"
                >
                  Manage Classes
                </Link>
              </div>
            </div>
          </div>

          {/* Recent Activity Timeline */}
          <div>
            <h2 className="font-manrope text-lg font-bold text-on-surface tracking-[-0.01em] mb-3 md:mb-4">
              Recent Activity
            </h2>
            <div className="pl-2 border-l-2 border-surface-container">
              {recentActivity.map((item, idx) => (
                <div
                  key={idx}
                  className={`relative pl-6 ${idx < recentActivity.length - 1 ? "pb-4 md:pb-6" : ""}`}
                >
                  <div
                    className={`absolute w-2 h-2 rounded-full -left-[5px] top-[4px] ${item.isNew ? "bg-primary" : "bg-outline-variant"}`}
                  />
                  <p className="text-xs font-bold text-on-surface m-0">
                    {item.text}
                  </p>
                  <p className="text-[0.625rem] text-on-surface-variant uppercase mt-1">
                    {item.time}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* ═══ NCERT Curriculum Navigator ═══ */}
      <section className="mt-10 md:mt-12 lg:mt-16">
        <h2 className="font-manrope text-lg font-bold text-on-surface tracking-[-0.01em] mb-4 md:mb-6">
          Curriculum Explorer
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
          {curriculumTiles.map((tile, idx) => (
            <div
              key={idx}
              className="aspect-square bg-surface-container-high rounded-sm p-4 flex flex-col justify-between cursor-pointer transition-colors duration-200 ease-out hover:bg-primary-container group"
            >
              <span className="text-[0.625rem] font-bold text-on-surface-variant uppercase tracking-[-0.02em] group-hover:text-primary">
                {tile.grade}
              </span>
              <span className="text-sm font-bold text-on-surface">
                {tile.subject}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
