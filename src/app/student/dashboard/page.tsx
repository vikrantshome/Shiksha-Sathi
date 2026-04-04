"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  getStudentIdentity,
  saveStudentIdentity,
  students,
} from "@/lib/api/students";
import type { StudentDashboardStats, StudentIdentity } from "@/lib/api/types";

/* ─────────────────────────────────────────────────────────
   Student Dashboard
   Design System: "The Digital Atelier" (design-system.md)
   Mirrors teacher dashboard patterns but student-scoped.
   ───────────────────────────────────────────────────────── */

/* ── Inline SVG Icons ── */
const IconAssignment = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
    <rect x="9" y="3" width="6" height="4" rx="1" />
    <path d="M9 12h6" /><path d="M9 16h6" />
  </svg>
);
const IconTrophy = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" /><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
    <path d="M4 22h16" /><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20 7 22" />
    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20 17 22" />
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
  </svg>
);
const IconTrending = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
    <polyline points="16 7 22 7 22 13" />
  </svg>
);
const IconCheck = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const IconArrowRight = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
  </svg>
);
const IconChevronRight = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="m9 18 6-6-6-6" />
  </svg>
);
const IconCode = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
  </svg>
);

/* ── Identity Entry Modal ── */
function IdentityEntry({ onSubmit }: { onSubmit: (identity: StudentIdentity) => void }) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const rollNumber = formData.get("rollNumber") as string;
    if (name && rollNumber) {
      const identity: StudentIdentity = {
        studentId: rollNumber,
        studentName: name,
        storedAt: new Date().toISOString(),
      };
      saveStudentIdentity(identity);
      onSubmit(identity);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[60vh] px-4">
      <div className="relative w-full max-w-md">
        <div className="absolute rounded-lg opacity-50 -inset-1 bg-gradient-to-tr from-primary/5 to-transparent blur-lg" />
        <div className="relative mt-8 bg-surface-container-lowest border border-outline-variant/10 rounded-lg p-6 md:p-8 shadow-[0px_12px_32px_rgba(48,51,47,0.04)]">
          <div className="mb-8 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 mb-4 rounded-full bg-primary-container/30 text-primary">
              <IconAssignment />
            </div>
            <h2 className="mb-2 text-xl font-bold tracking-tight text-on-surface font-headline">
              Welcome to Shiksha Sathi
            </h2>
            <p className="max-w-xs mx-auto text-sm leading-relaxed text-on-surface-variant">
              Enter your name and roll number to view your assignments and progress.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative group">
              <label htmlFor="student-name" className="block text-[0.6875rem] font-bold uppercase tracking-[0.05em] text-on-surface-variant mb-2 group-focus-within:text-primary transition-colors">
                Full Name
              </label>
              <input
                id="student-name"
                name="name"
                required
                placeholder="e.g. Aarav Patel"
                type="text"
                className="w-full px-0 py-3 text-base border-t-0 border-b border-l-0 border-r-0 bg-surface-container-low border-outline-variant/20 text-on-surface placeholder:text-outline-variant focus:ring-0 focus:border-primary focus:border-b-2 font-body"
              />
            </div>
            <div className="relative group">
              <label htmlFor="student-roll" className="block text-[0.6875rem] font-bold uppercase tracking-[0.05em] text-on-surface-variant mb-2 group-focus-within:text-primary transition-colors">
                Roll Number
              </label>
              <input
                id="student-roll"
                name="rollNumber"
                required
                placeholder="Enter your unique ID"
                type="text"
                className="w-full px-0 py-3 text-base border-t-0 border-b border-l-0 border-r-0 bg-surface-container-low border-outline-variant/20 text-on-surface placeholder:text-outline-variant focus:ring-0 focus:border-primary focus:border-b-2 font-body"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-gradient-to-br from-primary to-primary-dim text-on-primary py-3.5 px-6 rounded-lg font-bold tracking-wide shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-200"
            >
              View My Dashboard
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

/* ── Empty State ── */
function EmptyState() {
  const handleEnterCode = () => {
    const code = prompt("Enter your assignment code:");
    if (code) window.location.href = `/student/assignment/${code}`;
  };

  return (
    <div className="bg-surface-container-low rounded-md border-2 border-dashed border-outline/30 p-8 md:p-10 flex flex-col items-center text-center">
      <div className="w-12 h-12 bg-surface-container rounded-full flex items-center justify-center mb-4 text-outline">
        <IconCode />
      </div>
      <h4 className="text-sm font-bold text-on-surface">No Assignments Yet</h4>
      <p className="text-xs text-on-surface-variant mt-2 leading-[1.6] max-w-[20rem]">
        Your teacher will share an assignment code. Enter it below to get started.
      </p>
      <button
        onClick={handleEnterCode}
        className="mt-4 md:mt-6 text-[0.6875rem] font-bold text-primary no-underline flex items-center gap-2 cursor-pointer bg-transparent border-none"
      >
        Enter Assignment Code
        <IconArrowRight />
      </button>
    </div>
  );
}

/* ── Main Dashboard ── */
export default function StudentDashboardPage() {
  const [identity, setIdentity] = useState<StudentIdentity | null>(null);
  const [stats, setStats] = useState<StudentDashboardStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const existing = getStudentIdentity();
    if (existing) {
      setIdentity(existing);
    }
  }, []);

  useEffect(() => {
    if (!identity) return;
    const studentId = identity.studentId;
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await students.getDashboardStats(studentId);
        if (!cancelled) setStats(data);
      } catch {
        if (!cancelled) setError("Could not load your assignments. Please check your roll number.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [identity]);

  if (!identity) {
    return <IdentityEntry onSubmit={(id) => setIdentity(id)} />;
  }

  const currentIdentity = identity;

  /* ── Greeting ── */
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  /* ── Stat Cards ── */
  const statCards = [
    {
      icon: <IconAssignment />,
      value: stats?.totalAssignments ?? 0,
      label: "Total Assignments",
      badge: stats ? `${stats.gradedCount} graded` : "—",
    },
    {
      icon: <IconTrending />,
      value: stats ? `${stats.averageScorePercent}%` : "—",
      label: "Average Score",
      badge: stats && stats.averageScorePercent >= 70 ? "Great job!" : "Keep going",
    },
    {
      icon: <IconTrophy />,
      value: stats ? `${stats.bestScorePercent}%` : "—",
      label: "Best Score",
      badge: stats && stats.bestScorePercent === 100 ? "Perfect!" : "Personal best",
    },
    {
      icon: <IconCheck />,
      value: stats?.gradedCount ?? 0,
      label: "Graded",
      badge: stats ? `${stats.submittedCount - stats.gradedCount} pending` : "—",
    },
  ];

  const handleEnterCode = () => {
    const code = prompt("Enter your assignment code:");
    if (code) window.location.href = `/student/assignment/${code}`;
  };

  return (
    <div className="max-w-full pb-12">
      {/* ═══ Welcome Banner ═══ */}
      <header className="mb-6 md:mb-8 lg:mb-12">
        <span className="block font-sans text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-primary mb-2">
          Student Portal
        </span>
        <h1 className="font-manrope text-[clamp(1.5rem,3vw,1.875rem)] font-extrabold text-on-surface tracking-[-0.02em] leading-[1.2] m-0">
          {greeting}, {currentIdentity.studentName}.
        </h1>
        <p className="text-sm text-on-surface-variant mt-2 max-w-[28rem] leading-[1.6]">
          {loading
            ? "Loading your assignments..."
            : stats && stats.totalAssignments > 0
              ? `You have completed ${stats.totalAssignments} assignment${stats.totalAssignments === 1 ? "" : "s"}.${stats.gradedCount < stats.totalAssignments ? ` ${stats.totalAssignments - stats.gradedCount} still pending grading.` : ""}`
              : "Enter an assignment code from your teacher to get started."}
        </p>
      </header>

      {/* ═══ Error State ═══ */}
      {error && (
        <div className="mb-6 p-4 bg-error/10 text-error text-sm rounded-md">
          {error}
          <button
            onClick={() => {
              setIdentity(null);
              localStorage.removeItem("shiksha-sathi-student-identity");
            }}
            className="ml-2 underline font-semibold"
          >
            Switch student
          </button>
        </div>
      )}

      {/* ═══ Summary Stat Cards ═══ */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-8 md:mb-12">
        {statCards.map((stat, i) => (
          <div
            key={i}
            className="group bg-surface-container-lowest p-4 md:p-6 rounded-md border border-outline/5 shadow-sm transition-shadow duration-200 hover:shadow-[0_12px_32px_rgba(48,51,47,0.06)]"
          >
            <div className="flex flex-col items-start gap-2 mb-3 md:mb-4 sm:flex-row sm:justify-between sm:items-start">
              <div className="p-2 bg-surface-container-low rounded-sm text-primary flex items-center justify-center transition-colors duration-200 group-hover:bg-[#4463710D]">
                {stat.icon}
              </div>
              <span className="text-[0.5625rem] md:text-[0.625rem] font-bold text-primary-dim leading-[1.4]">
                {stat.badge}
              </span>
            </div>
            <h3 className="font-manrope text-[1.375rem] md:text-2xl font-bold text-on-surface m-0">
              {loading ? "—" : stat.value}
            </h3>
            <p className="text-[0.625rem] md:text-[0.6875rem] font-medium text-on-surface-variant uppercase tracking-[0.08em] mt-1 leading-[1.4]">
              {stat.label}
            </p>
          </div>
        ))}
      </section>

      {/* ═══ Quick Action ═══ */}
      <div className="mb-8 md:mb-12">
        <button
          onClick={handleEnterCode}
          className="inline-flex items-center gap-3 rounded-lg bg-gradient-to-br from-primary to-primary-dim px-5 py-3 text-sm font-bold text-on-primary shadow-[0_8px_18px_rgba(48,51,47,0.12)] transition-all duration-150 hover:brightness-95 hover:shadow-[0_10px_22px_rgba(48,51,47,0.16)] active:scale-[0.98] cursor-pointer"
        >
          <IconCode />
          Enter Assignment Code
        </button>
      </div>

      {/* ═══ Recent Assignments ═══ */}
      <section>
        <div className="flex items-center justify-between mb-3 md:mb-4">
          <h2 className="font-manrope text-lg font-bold text-on-surface tracking-[-0.01em]">
            Recent Assignments
          </h2>
          {stats && stats.recentSubmissions.length > 0 && (
            <Link href="/student/assignments" className="text-[0.6875rem] font-bold text-primary no-underline flex items-center gap-1">
              View All
              <IconChevronRight />
            </Link>
          )}
        </div>

        {!stats || loading ? (
          <div className="bg-surface-container-low rounded-md border border-outline/10 p-8 text-center">
            <p className="text-sm text-on-surface-variant">Loading...</p>
          </div>
        ) : stats.recentSubmissions.length === 0 ? (
          <EmptyState />
        ) : (
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
                    {stats.recentSubmissions.map((sub) => {
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
                          </td>
                          <td className="p-3 md:p-4 px-4 md:px-6">
                            {isGraded && scorePct !== null ? (
                              <span className={`font-semibold text-sm ${scorePct >= 70 ? "text-primary" : scorePct >= 50 ? "text-warning" : "text-error"}`}>
                                {sub.score}/{sub.totalMarks} ({scorePct}%)
                              </span>
                            ) : (
                              <span className="text-sm text-on-surface-variant">—</span>
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
                            })}
                          </td>
                          <td className="p-3 md:p-4 px-4 md:px-6 text-right">
                            <Link
                              href={`/student/results/${sub.id}`}
                              className="text-[0.6875rem] font-bold text-primary uppercase tracking-[0.05em] no-underline inline-flex items-center gap-1"
                            >
                              {isGraded ? "View" : "Details"}
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
              {stats.recentSubmissions.map((sub) => {
                const scorePct = sub.totalMarks > 0 ? Math.round((sub.score / sub.totalMarks) * 100) : null;
                const isGraded = sub.status === "GRADED";
                return (
                  <Link
                    key={sub.id}
                    href={`/student/results/${sub.id}`}
                    className="block p-4 px-5 border-b border-outline/5 no-underline"
                  >
                    <div className="flex justify-between items-start">
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
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {/* ═══ Performance Tip ═══ */}
      {stats && stats.totalAssignments > 0 && (
        <section className="mt-10 md:mt-12">
          <div className="bg-surface-container-low rounded-md p-5 md:p-6">
            <h2 className="font-manrope text-base font-bold text-on-surface tracking-[-0.01em] mb-3">
              Study Tip
            </h2>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              {stats.averageScorePercent >= 80
                ? "You're doing great! Review any questions you got wrong to aim for perfection."
                : stats.averageScorePercent >= 50
                  ? "You're making progress. Focus on the questions you missed — they show you where to improve."
                  : "Don't worry — every assignment is a chance to learn. Review the feedback carefully and ask your teacher for help."}
            </p>
          </div>
        </section>
      )}
    </div>
  );
}
