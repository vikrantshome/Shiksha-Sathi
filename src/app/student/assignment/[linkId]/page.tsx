import { notFound } from "next/navigation";
import AssignmentProgress from "@/components/AssignmentProgress";
import { api } from "@/lib/api";

export const dynamic = "force-dynamic";

/* ─────────────────────────────────────────────────────────
   Student Assignment Page — Stitch "answer_questions" Design
   Design Source: doc/stitch_shiksha_sathi_ui_refresh/answer_questions
   NOTE: Inherits student layout nav (top + mobile bottom tabs).
   Only renders the assignment header + question sequence here.
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
    <div className="min-h-screen" style={{ background: "var(--color-surface)" }}>
      {/* ═══ Main Content Area (no left margin — student has no sidebar) ═══ */}
      <main className="pt-2 pb-24 px-4 md:px-8 lg:px-16">
        <div className="max-w-3xl mx-auto relative">
          {/* Question Sequence with Live Header */}
          <AssignmentProgress assignment={assignment} />
        </div>
      </main>

      {/* ═══ M3 Assistance Card (Floating Right — Desktop xl) ═══ */}
      <aside className="fixed right-4 xl:right-12 top-40 xl:top-48 hidden xl:block w-72 z-10">
        <div className="rounded-xl p-6 space-y-5" style={{ background: "var(--color-surface-container-low)" }}>
          <h3 className="text-[0.75rem] font-bold tracking-widest uppercase" style={{ color: "var(--color-primary)" }}>
            Assistance
          </h3>
          <div className="space-y-4">
            <div className="flex gap-3 items-start">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5" style={{ color: "var(--color-primary)" }}>
                <circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><path d="M12 17h.01" />
              </svg>
              <div>
                <p className="text-sm font-semibold" style={{ color: "var(--color-on-surface)" }}>Need Help?</p>
                <p className="text-xs mt-1 leading-relaxed" style={{ color: "var(--color-on-surface-variant)" }}>
                  Review the chapter content in your NCERT textbook before submitting.
                </p>
              </div>
            </div>
            <div className="h-px" style={{ background: "var(--color-outline-variant)" }} />
            <div className="flex gap-3 items-start">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5" style={{ color: "var(--color-primary)" }}>
                <path d="M12 2a10 10 0 1 0 10 10H12V2z" /><path d="M20.66 9A10 10 0 0 0 14 2.05V9h6.66z" />
              </svg>
              <div>
                <p className="text-sm font-semibold" style={{ color: "var(--color-on-surface)" }}>Study Resource</p>
                <p className="text-xs mt-1 leading-relaxed" style={{ color: "var(--color-on-surface-variant)" }}>
                  Refer to your class notes and NCERT examples for guidance.
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
