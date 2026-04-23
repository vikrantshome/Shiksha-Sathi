"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { getStudentIdentity, students } from "@/lib/api/students";
import type { StudentSubmissionSummary, StudentIdentity } from "@/lib/api/types";
import Loader from "@/components/Loader";
import CodeEntryModal from "@/components/CodeEntryModal";

/* ─────────────────────────────────────────────────────────
   Student Assignments List Page
   Full list of all submitted assignments with filtering.
   Design System: "The Digital Atelier"
   ───────────────────────────────────────────────────────── */

type FilterStatus = "ALL" | "GRADED" | "SUBMITTED";

export default function StudentAssignmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const resolvedSearchParams = use(searchParams);
  const initialFilter = (resolvedSearchParams.filter?.toUpperCase() as FilterStatus) || "ALL";

  const [identity, setIdentity] = useState<StudentIdentity | null>(null);
  const [submissions, setSubmissions] = useState<StudentSubmissionSummary[]>([]);
  const [filter, setFilter] = useState<FilterStatus>(initialFilter);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);

  useEffect(() => {
    const existing = getStudentIdentity();
    if (!existing) {
      window.location.href = "/student/dashboard";
      return;
    }
    setIdentity(existing);

    // Load data once identity is set
    const studentId = existing.studentId;
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await students.getSubmissions(studentId);
        if (!cancelled) setSubmissions(data);
      } catch {
        if (!cancelled) setError("Could not load your assignments.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const filtered = filter === "ALL"
    ? submissions
    : submissions.filter((s) => s.status === filter);

  const counts = {
    ALL: submissions.length,
    GRADED: submissions.filter((s) => s.status === "GRADED").length,
    SUBMITTED: submissions.filter((s) => s.status === "SUBMITTED").length,
  };

  const filters: { key: FilterStatus; label: string }[] = [
    { key: "ALL", label: `All (${counts.ALL})` },
    { key: "GRADED", label: `Graded (${counts.GRADED})` },
    { key: "SUBMITTED", label: `Pending (${counts.SUBMITTED})` },
  ];

  const handleEnterCode = () => {
    setIsAssignmentModalOpen(true);
  };

  if (!identity) return null;

  return (
    <div className="max-w-full pb-12">
      <CodeEntryModal
        isOpen={isAssignmentModalOpen}
        onClose={() => setIsAssignmentModalOpen(false)}
        onSubmit={(code) => window.location.href = `/student/assignment/${code}`}
        title="Enter Assignment Code"
      />
      {/* ═══ Page Header ═══ */}
      <header className="mb-6 md:mb-8">
        <span className="block font-sans text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-primary mb-2">
          My Assignments
        </span>
        <h1 className="font-manrope text-[clamp(1.5rem,3vw,1.875rem)] font-extrabold text-on-surface tracking-[-0.02em] leading-[1.2] m-0">
          Assignment History
        </h1>
        <p className="text-sm text-on-surface-variant mt-2 leading-[1.6]">
          View all your submitted assignments and their results.
        </p>
      </header>

      {/* ═══ Enter Code CTA ═══ */}
      <div className="mb-6">
        <button
          onClick={handleEnterCode}
          className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-bold shadow-[0_4px_12px_rgba(48,51,47,0.08)] transition-all duration-150 hover:brightness-95 active:scale-[0.98] cursor-pointer"
          style={{ background: "linear-gradient(145deg, var(--color-primary), var(--color-primary-dim))", color: "var(--color-on-primary)" }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
          </svg>
          Enter Assignment Code
        </button>
      </div>

      {/* ═══ Filter Tabs ═══ */}
      <div className="flex gap-2 mb-4 md:mb-6">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-3 py-1.5 rounded-sm text-xs font-bold tracking-[0.05em] uppercase transition-all duration-150 cursor-pointer ${
              filter === f.key
                ? "bg-primary text-on-primary shadow-sm"
                : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* ═══ Error State ═══ */}
      {error && (
        <div className="mb-6 p-4 bg-error/10 text-error text-sm rounded-md">{error}</div>
      )}

      {/* ═══ Loading ═══ */}
      {loading && (
        <div className="bg-surface-container-low rounded-md border border-outline/10 p-8 flex justify-center text-center">
          <Loader size="lg" label="Loading assignments..." />
        </div>
      )}

      {/* ═══ Empty State ═══ */}
      {!loading && filtered.length === 0 && (
        <div className="bg-surface-container-low rounded-md border-2 border-dashed border-outline/30 p-8 md:p-10 flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-surface-container rounded-full flex items-center justify-center mb-4 text-outline">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
              <rect x="9" y="3" width="6" height="4" rx="1" />
            </svg>
          </div>
          <h4 className="text-sm font-bold text-on-surface">
            {filter === "ALL" ? "No Assignments Yet" : `No ${filter.toLowerCase()} assignments`}
          </h4>
          <p className="text-xs text-on-surface-variant mt-2 leading-[1.6] max-w-[20rem]">
            {filter === "ALL"
              ? "Enter an assignment code from your teacher to get started."
              : "Try switching to a different filter."}
          </p>
        </div>
      )}

      {/* ═══ Assignments List ═══ */}
      {!loading && filtered.length > 0 && (
        <div className="bg-surface-container-lowest rounded-md border border-outline/10 overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden md:block">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="bg-surface-container-low border-b border-outline/10">
                    {["Assignment", "Score", "Status", "Submitted", ""].map((h, idx) => (
                      <th
                        key={h}
                        className={`p-3 md:p-4 px-4 md:px-6 text-[0.625rem] font-bold uppercase tracking-[0.1em] text-on-surface-variant ${idx === 4 ? "text-right" : "text-left"}`}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((sub) => {
                    const scorePct = sub.totalMarks > 0 ? Math.round((sub.score / sub.totalMarks) * 100) : null;
                    const isGraded = sub.status === "GRADED";
                    return (
                      <tr
                        key={sub.id}
                        className="border-b border-outline/5 transition-colors duration-200 ease-out hover:bg-surface-container-high"
                      >
                        <td className="p-3 md:p-4 px-4 md:px-6">
                          <p className="font-semibold text-on-surface m-0 text-sm">
                            {sub.assignmentTitle}
                          </p>
                          <p className="text-[0.625rem] text-on-surface-variant m-0 mt-0.5">
                            {sub.studentRollNumber}
                          </p>
                        </td>
                        <td className="p-3 md:p-4 px-4 md:px-6">
                          {isGraded && scorePct !== null ? (
                            <span className={`font-semibold text-sm ${
                              scorePct >= 70 ? "text-primary" : scorePct >= 50 ? "text-warning" : "text-error"
                            }`}>
                              {sub.score}/{sub.totalMarks} ({scorePct}%)
                            </span>
                          ) : (
                            <span className="text-sm text-on-surface-variant">Awaiting</span>
                          )}
                        </td>
                        <td className="p-3 md:p-4 px-4 md:px-6">
                          <span className={`inline-flex items-center px-2 py-1 text-[0.625rem] font-bold tracking-wider rounded-sm uppercase ${
                            isGraded
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-surface-container text-on-surface-variant"
                          }`}>
                            {isGraded ? "Graded" : "Pending"}
                          </span>
                        </td>
                        <td className="p-3 md:p-4 px-4 md:px-6 text-on-surface-variant text-sm">
                          {new Date(sub.submittedAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                        <td className="p-3 md:p-4 px-4 md:px-6 text-right">
                          <Link
                            href={`/student/results/${sub.id}`}
                            className="text-[0.6875rem] font-bold text-primary uppercase tracking-[0.05em] no-underline inline-flex items-center gap-1"
                          >
                            {isGraded ? "View Results" : "Details"}
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="m9 18 6-6-6-6" />
                            </svg>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Cards */}
          <div className="block md:hidden">
            {filtered.map((sub) => {
              const scorePct = sub.totalMarks > 0 ? Math.round((sub.score / sub.totalMarks) * 100) : null;
              const isGraded = sub.status === "GRADED";
              return (
                <Link
                  key={sub.id}
                  href={`/student/results/${sub.id}`}
                  className="block p-4 px-5 border-b border-outline/5 no-underline"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold text-on-surface text-sm m-0">
                        {sub.assignmentTitle}
                      </p>
                      <p className="text-[0.6875rem] text-on-surface-variant m-[2px_0_0]">
                        {new Date(sub.submittedAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      {isGraded && scorePct !== null ? (
                        <span className={`text-sm font-semibold ${scorePct >= 70 ? "text-primary" : "text-on-surface-variant"}`}>
                          {scorePct}%
                        </span>
                      ) : (
                        <span className="text-[0.625rem] text-on-surface-variant uppercase">Pending</span>
                      )}
                    </div>
                  </div>
                  <span className={`inline-flex items-center px-2 py-0.5 text-[0.5625rem] font-bold tracking-wider rounded-sm uppercase ${
                    isGraded ? "bg-emerald-50 text-emerald-700" : "bg-surface-container text-on-surface-variant"
                  }`}>
                    {isGraded ? "Graded" : "Pending"}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
