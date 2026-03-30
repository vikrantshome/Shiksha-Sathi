import { notFound } from "next/navigation";
import StudentAssignmentForm from "@/components/StudentAssignmentForm";
import { api } from "@/lib/api";

export const dynamic = "force-dynamic";

/* ─────────────────────────────────────────────────────────
   Student Assignment Page — Stitch-Directed Redesign
   Design Source: doc/stitch_shiksha_sathi_ui_refresh/identity_entry + assignment_taking + results
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

  let assignment;
  try {
    assignment = await api.assignments.getByLinkId(resolvedParams.linkId);
  } catch {
    notFound();
  }

  if (!assignment) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* ═══ Top App Bar — Stitch "Identity Entry" pattern ═══ */}
      <header className="fixed top-0 w-full z-50 bg-[rgba(250,249,245,0.85)] backdrop-blur-md flex justify-between items-center px-8 py-4">
        <div>
          <h1 className="font-manrope text-xl font-bold text-primary tracking-[-0.03em] m-0">
            Shiksha Sathi
          </h1>
          <span className="text-[0.6875rem] uppercase tracking-[0.05em] text-on-surface-variant font-medium">
            Student Assessment
          </span>
        </div>

        {/* Assignment Context Cluster */}
        <div className="hidden sm:flex items-center gap-6">
          <div className="text-right">
            <span className="text-xs color-on-surface-variant uppercase tracking-[0.05em] font-semibold text-on-surface-variant">
              {assignment.title}
            </span>
            <div className="flex items-center justify-end gap-2 mt-1">
              <span className="text-sm font-semibold text-primary">
                {assignment.totalMarks} Marks
              </span>
              <span className="w-[3px] h-[3px] rounded-full bg-outline-variant inline-block" />
              <span className="text-sm text-on-surface-variant">
                Due {new Date(assignment.dueDate).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Top divider */}
      <div className="fixed top-[72px] w-full h-px bg-surface-container z-40" />

      {/* ═══ Main Content Canvas ═══ */}
      <main className="flex-grow flex flex-col items-center pt-[5.5rem] pb-16 px-6 relative">
        {/* Decorative background blurs — Stitch pattern */}
        <div className="fixed -top-[10%] -left-[5%] w-[40%] h-[60%] bg-[rgba(198,232,248,0.08)] rounded-full blur-[120px] pointer-events-none -z-10" />
        <div className="fixed top-[60%] -right-[10%] w-[35%] h-[50%] bg-[rgba(215,227,250,0.15)] rounded-full blur-[100px] pointer-events-none -z-10" />

        <div className="w-full max-w-[48rem]">
          <StudentAssignmentForm assignment={assignment} />
        </div>
      </main>

      {/* ═══ Footer ═══ */}
      <footer className="p-8 flex flex-col items-center gap-4">
        <div className="w-12 h-[2px] bg-[rgba(68,99,113,0.2)]" />
        <p className="text-[0.6875rem] text-on-surface-variant font-medium tracking-[0.15em] uppercase">
          Shiksha Sathi © 2025
        </p>
      </footer>
    </div>
  );
}
