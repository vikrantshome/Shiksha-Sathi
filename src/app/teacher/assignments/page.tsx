import { api } from "@/lib/api";
import { AssignmentWithStats } from "@/lib/api/types";
import Link from "next/link";
import { redirect } from "next/navigation";
import AssignmentDashboard from "@/components/AssignmentDashboard";

export const dynamic = "force-dynamic";

/* ── Icons ── */
const IconPlus = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><path d="M8 12h8" /><path d="M12 8v8" />
  </svg>
);
const IconBack = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5" /><path d="m12 5-7 7 7 7" />
  </svg>
);

export default async function TeacherAssignmentsPage() {
  /* ── Auth ── */
  let user;
  try {
    user = await api.auth.getMe();
  } catch {
    redirect("/login");
  }

  /* ── Data ── */
  let assignments: AssignmentWithStats[] = [];
  try {
    assignments = await api.assignments.getStats(user.id);
  } catch (err) {
    console.error("Failed to load assignments:", err);
  }

  const totalSubmissions = assignments.reduce(
    (acc, a) => acc + (a.submissionCount || 0),
    0
  );

  const avgScoreAll = assignments.length > 0 
    ? (assignments.reduce((acc, a) => (acc + (a.averageScore || 0) / (a.totalMarks || 1) * 100), 0) / assignments.length).toFixed(1)
    : "0";

  return (
    <div className="max-w-full pb-12">
      {/* ═══ Page Header ═══ */}
      <header className="mb-6 md:mb-8">
        <Link
          href="/teacher/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-medium no-underline mb-4"
          style={{ color: "var(--color-on-surface-variant)" }}
        >
          <IconBack /> Dashboard
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <span className="block text-[0.7rem] font-semibold uppercase tracking-[0.1em] mb-1 text-[#12423f]">
              Assignments
            </span>
            <h1 className="text-xl sm:text-2xl md:text-[1.75rem] font-extrabold tracking-tight leading-tight text-[#12423f] m-0">
              All Assignments
            </h1>
            <p className="text-xs sm:text-sm mt-1 text-[#404847]">
              {assignments.length} assignment{assignments.length !== 1 ? "s" : ""} •{" "}
              {totalSubmissions} total submission{totalSubmissions !== 1 ? "s" : ""}
            </p>
          </div>

          <Link
            href="/teacher/question-bank"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold no-underline transition-opacity hover:opacity-90 self-start sm:self-auto"
            style={{ background: "#12423f", color: "#fff" }}
          >
            <IconPlus />
            New Assignment
          </Link>
        </div>
      </header>

      {assignments.length === 0 ? (
        <div
          className="rounded-2xl border-2 border-dashed p-10 flex flex-col items-center text-center"
          style={{ borderColor: "#c0c8c6", background: "#f0ede9" }}
        >
          <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4" style={{ background: "#e5e2de", color: "#707977" }}>
            <IconPlus />
          </div>
          <h4 className="text-sm font-bold text-[#1c1c1a] m-0">No Assignments Yet</h4>
          <p className="text-xs text-[#404847] mt-2 leading-relaxed max-w-xs">
            Browse the Question Bank to build your first assignment and start your classroom workflow.
          </p>
          <Link
            href="/teacher/question-bank"
            className="mt-6 text-xs font-bold text-[#12423f] no-underline flex items-center gap-1.5"
          >
            Create New Assignment
          </Link>
        </div>
      ) : (
        <AssignmentDashboard 
          initialAssignments={assignments}
          totalSubmissions={totalSubmissions}
          avgScoreAll={avgScoreAll}
        />
      )}
    </div>
  );
}
