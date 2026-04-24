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
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="m9 18 6-6-6-6" />
  </svg>
);

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
  
  const activeAssignmentsList = assignments.filter(
    (a: AssignmentWithStats) => (a.submissionCount || 0) > 0
  );
  const activeAssignmentsCount = activeAssignmentsList.length;

  /* ── Build Real Activity Feed from Assignments ── */
  const recentActivity = assignments
    .filter((a: AssignmentWithStats) => a.title)
    .slice(0, 5)
    .map((a: AssignmentWithStats & { updatedAt?: string }) => {
      const hasSubmissions = (a.submissionCount || 0) > 0;
      return {
        text: hasSubmissions
          ? `${a.submissionCount} submission${a.submissionCount! > 1 ? "s" : ""} in ${a.className || "your class"}`
          : `Assignment "${a.title}" created`,
        time: a.updatedAt ? timeAgo(new Date(a.updatedAt)) : "Recently",
        isNew: hasSubmissions,
      };
    });

  if (recentActivity.length === 0) {
    recentActivity.push({
      text: "No activity yet — create your first assignment to get started",
      time: "",
      isNew: false,
    });
  }

  function timeAgo(date: Date): string {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return "Just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    const days = Math.floor(hours / 24);
    if (days === 1) return "Yesterday";
    return `${days} days ago`;
  }

  /* ── Stat Cards Configuration ── */
  const stats = [
    {
      icon: <IconAssignment />,
      value: assignments.length,
      label: "Total Assignments",
      badge: assignments.length === 0 ? "None yet" : `Across ${new Set(assignments.map((a: AssignmentWithStats) => a.className).filter(Boolean)).size || 1} class${new Set(assignments.map((a: AssignmentWithStats) => a.className).filter(Boolean)).size !== 1 ? "es" : ""}`,
    },
    {
      icon: <IconGroups />,
      value: totalSubmissions,
      label: "Total Submissions",
      badge: assignments.length > 0 ? `~${Math.round(totalSubmissions / assignments.length)} per assignment` : "No submissions yet",
    },
    {
      icon: <IconTrending />,
      value: activeAssignmentsCount > 0
        ? `${Math.round(
            (activeAssignmentsList.reduce((acc, a) => acc + (a.averageScore / (a.totalMarks || 1)), 0) / activeAssignmentsCount) * 100
          )}%`
        : "—",
      label: "Average Score",
      badge: activeAssignmentsCount > 0 ? `${activeAssignmentsCount} active` : "No data yet",
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
            <span className="block font-sans text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-[#12423f] mb-2">
              Teacher Dashboard
            </span>
            <h1 className="font-manrope text-[clamp(1.5rem,3vw,1.875rem)] font-extrabold text-[#12423f] tracking-[-0.02em] leading-[1.2] m-0">
              {greeting}, {user.name || "Teacher"}.
            </h1>
            <p className="text-sm text-[#404847] mt-2 max-w-[28rem] leading-[1.6]">
              Your teaching studio is aligned for the day. You have{" "}
              {activeAssignmentsCount}{" "}
              active assignment{activeAssignmentsCount === 1 ? "" : "s"}{" "}
              ready for review or follow-up.
            </p>
          </div>
        </div>
      </header>

      {/* ═══ Summary Stat Cards ═══ */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 md:mb-12">
        {stats.map((stat, i) => (
          <div
            key={i}
            className={`bg-white p-6 rounded-xl shadow-sm border-l-4 ${i === 0 ? 'border-[#12423f]' : i === 1 ? 'border-[#536255]' : i === 2 ? 'border-[#734837]' : 'border-[#707977]'}`}
          >
            <div className="flex items-center gap-1 mb-2">
              <span className={`material-symbols-outlined text-sm ${i === 0 ? 'text-[#12423f]' : i === 1 ? 'text-[#536255]' : i === 2 ? 'text-[#734837]' : 'text-[#707977]'}`}>
                {i === 0 ? 'trending_up' : i === 1 ? 'check_circle' : i === 2 ? 'horizontal_rule' : 'group'}
              </span>
              <span className={`text-[0.5625rem] font-bold ${i === 0 ? 'text-[#12423f]' : i === 1 ? 'text-[#536255]' : i === 2 ? 'text-[#734837]' : 'text-[#404847]'}`}>
                {stat.badge}
              </span>
            </div>
            <h3 className="font-manrope text-3xl font-black text-[#1c1c1a] m-0">
              {stat.value}
            </h3>
            <p className="text-[0.625rem] font-medium text-[#404847] uppercase tracking-[0.08em] mt-1 leading-[1.4]">
              {stat.label}
            </p>
          </div>
        ))}
      </section>

      {/* ═══ Bento Grid: Main Content + Quick Actions Sidebar ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-[2.5fr_1fr] gap-6 md:gap-8">
        {/* ── Left: Recent Assignments ── */}
        <section className="flex flex-col gap-8">
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <h2 className="font-manrope text-2xl font-bold text-[#12423f] tracking-tight">
              Recent Assignments
            </h2>
            <Link href="/teacher/assignments" className="text-[#12423f] font-bold text-sm flex items-center gap-2 hover:underline">
              View All <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          </div>

          {assignments.length === 0 ? (
            /* ── Empty State ── */
            <div className="bg-[#f0ede9] rounded-2xl border-2 border-dashed border-[#c0c8c6] p-8 md:p-10 flex flex-col items-center text-center">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-[#e5e2de] rounded-full flex items-center justify-center mb-3 md:mb-4 text-[#707977]">
                <IconPlus />
              </div>
              <h4 className="text-sm font-bold text-[#1c1c1a] m-0">
                No Assignments Yet
              </h4>
              <p className="text-xs text-[#404847] mt-2 leading-[1.6] max-w-[20rem]">
                Browse the Question Bank to build your first assignment and
                start your classroom workflow.
              </p>
              <Link
                href="/teacher/question-bank"
                className="mt-4 md:mt-6 text-[0.6875rem] font-bold text-[#12423f] no-underline flex items-center gap-2"
              >
                Create New Assignment
                <IconArrow />
              </Link>
            </div>
          ) : (
            /* ── Assignments Table ── */
            <div className="bg-[#f0ede9] rounded-2xl p-8 border border-[#c0c8c6]/30 overflow-hidden">
              {/* Desktop Table */}
              <div className="hidden md:block">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left text-sm">
                    <thead>
                      <tr className="border-b border-[#c0c8c6]/30">
                        {["Assignment Title", "Class", "Submissions", "Avg. Score", "Action"].map(
                          (h, idx) => (
                            <th
                              key={h}
                              className={`pb-4 text-[0.625rem] font-black uppercase tracking-[0.1em] text-[#404847] ${idx === 4 ? "text-right" : "text-left"}`}
                            >
                              {h}
                            </th>
                          )
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#c0c8c6]/10">
                      {assignments.map((assignment) => {
                        const submissionPct = assignment.totalMarks > 0 
                          ? Math.round((assignment.submissionCount / 45) * 100)
                          : 0;
                        return (
                          <tr
                            key={assignment.id}
                            className="border-b border-[#c0c8c6]/5 transition-colors duration-200 ease-out hover:bg-[#e5e2de]"
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
                                {" "}/ {assignment.totalMarks}
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
                        {assignment.averageScore}/{assignment.totalMarks}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* ── Right: Quick Actions + Activity Sidebar ── */}
        <aside className="max-w-[320px] flex flex-col gap-6">
          {/* Quick Actions */}
          <div className="bg-[#f0ede9] rounded-2xl p-6 shadow-sm border border-[#c0c8c6]/30">
            <h4 className="text-sm font-black uppercase tracking-widest text-[#12423f] mb-4">Quick Actions</h4>
            <div className="flex flex-col gap-3">
              <Link href="/teacher/question-bank" className="flex items-center gap-3 p-4 bg-white hover:bg-[#f7f3ee] rounded-xl transition-all text-left shadow-sm group border border-[#e5e2de]">
                <span className="material-symbols-outlined text-white bg-[#12423f] p-2 rounded-lg shadow-sm">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 12h6"/><path d="M9 16h6"/></svg>
                </span>
                <div>
                  <p className="text-sm font-bold text-[#1c1c1a]">Create Assignment</p>
                  <p className="text-[10px] text-[#707977]">Push to all active classes</p>
                </div>
              </Link>
              <Link href="/teacher/quizzes/create" className="flex items-center gap-3 p-4 bg-white hover:bg-[#f7f3ee] rounded-xl transition-all text-left shadow-sm group border border-[#e5e2de]">
                <span className="material-symbols-outlined text-white bg-[#536255] p-2 rounded-lg shadow-sm">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/></svg>
                </span>
                <div>
                  <p className="text-sm font-bold text-[#1c1c1a]">Create Quiz</p>
                  <p className="text-[10px] text-[#707977]">Interactive live assessments</p>
                </div>
              </Link>
              <Link href="/teacher/classes" className="flex items-center gap-3 p-4 bg-white hover:bg-[#f7f3ee] rounded-xl transition-all text-left shadow-sm group border border-[#e5e2de]">
                <span className="material-symbols-outlined text-white bg-[#583222] p-2 rounded-lg shadow-sm">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                </span>
                <div>
                  <p className="text-sm font-bold text-[#1c1c1a]">Manage Classes</p>
                  <p className="text-[10px] text-[#707977]">Add students & sections</p>
                </div>
              </Link>
              <Link href="/teacher/assignments" className="flex items-center gap-3 p-4 bg-white hover:bg-[#f7f3ee] rounded-xl transition-all text-left shadow-sm group border border-[#e5e2de]">
                <span className="material-symbols-outlined text-white bg-[#396662] p-2 rounded-lg shadow-sm">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
                </span>
                <div>
                  <p className="text-sm font-bold text-[#1c1c1a]">View Reports</p>
                  <p className="text-[10px] text-[#707977]">Track class performance</p>
                </div>
              </Link>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-[#f0ede9] rounded-2xl p-6 border border-[#c0c8c6]/30">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-sm font-black uppercase tracking-widest text-[#12423f]">Activity</h4>
              <span className="material-symbols-outlined text-sm opacity-40">history</span>
            </div>
            <div className="flex flex-col gap-4">
              {recentActivity.map((item, idx) => (
                <div key={idx} className="flex gap-3 relative">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 ${idx === 0 ? 'bg-[#bcece6]' : idx === 1 ? 'bg-[#d6e7d6]' : 'bg-[#ffdbce]'}`}>
                    <span className={`material-symbols-outlined text-sm ${idx === 0 ? 'text-[#12423f]' : idx === 1 ? 'text-[#536255]' : 'text-[#583222]'}`}>
                      {idx === 0 ? 'upload_file' : idx === 1 ? 'chat' : 'check_circle'}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#1c1c1a]">{item.text}</p>
                    <p className="text-[10px] text-[#707977] mt-0.5">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
