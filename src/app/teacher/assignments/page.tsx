import { api } from "@/lib/api";
import { AssignmentWithStats } from "@/lib/api/types";
import Link from "next/link";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

/* ── Icons ── */
const IconChevronRight = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="m9 18 6-6-6-6" />
  </svg>
);
const IconPlus = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><path d="M8 12h8" /><path d="M12 8v8" />
  </svg>
);
const IconBack = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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

      {/* ═══ Assignments Table / Empty State ═══ */}
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
            Create New Assignment <IconChevronRight />
          </Link>
        </div>
      ) : (
        <>
          {/* ── Desktop Table ── */}
          <div className="hidden md:block bg-[#f0ede9] rounded-2xl border border-[#c0c8c6]/30 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-[#c0c8c6]/30">
                    {["Assignment", "Class", "Submissions", "Avg. Score", "Action"].map(
                      (h, i) => (
                        <th
                          key={h}
                          className={`px-6 py-4 text-[0.6rem] font-black uppercase tracking-[0.1em] text-[#404847] ${i === 4 ? "text-right" : "text-left"}`}
                        >
                          {h}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#c0c8c6]/10">
                  {assignments.map((a) => {
                    const pct = Math.min(Math.round((a.submissionCount / 45) * 100), 100);
                    return (
                      <tr
                        key={a.id}
                        className="transition-colors hover:bg-[#e5e2de]"
                      >
                        <td className="px-6 py-4">
                          <p className="font-semibold text-[#1c1c1a] m-0 text-sm leading-snug">
                            {a.title}
                          </p>
                          <p className="text-[0.625rem] text-[#707977] m-0 mt-0.5">
                            ID: {a.linkId}
                          </p>
                        </td>
                        <td className="px-6 py-4 text-[#404847] text-sm">
                          {a.className || "Unassigned"}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-[#1c1c1a] text-sm">
                              {a.submissionCount}
                            </span>
                            <div className="w-16 h-1 bg-[#c0c8c6]/30 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full bg-[#12423f] transition-all duration-300"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-semibold text-[#12423f] text-sm">
                          {a.averageScore}
                          <span className="font-normal text-[#707977]"> / {a.totalMarks}</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link
                            href={`/teacher/assignments/${a.id}`}
                            className="text-[0.6875rem] font-bold text-[#12423f] uppercase tracking-[0.05em] no-underline inline-flex items-center gap-1"
                          >
                            View Report <IconChevronRight />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── Mobile Card List ── */}
          <div className="block md:hidden bg-[#f0ede9] rounded-2xl border border-[#c0c8c6]/30 overflow-hidden divide-y divide-[#c0c8c6]/10">
            {assignments.map((a) => (
              <Link
                key={a.id}
                href={`/teacher/assignments/${a.id}`}
                className="block px-5 py-4 no-underline hover:bg-[#e5e2de] transition-colors"
              >
                <div className="flex justify-between items-start gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-[#1c1c1a] text-sm m-0 truncate">
                      {a.title}
                    </p>
                    <p className="text-[0.6875rem] text-[#707977] m-0 mt-0.5">
                      {a.className || "Unassigned"} • {a.submissionCount} submissions
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <span className="text-sm font-bold text-[#12423f]">
                      {a.averageScore}
                    </span>
                    <span className="text-xs text-[#707977]">/{a.totalMarks}</span>
                    <div className="mt-1 flex justify-end">
                      <IconChevronRight />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
