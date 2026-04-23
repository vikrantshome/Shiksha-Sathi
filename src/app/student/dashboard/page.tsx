"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  getStudentIdentity,
  saveStudentIdentity,
  students,
} from "@/lib/api/students";
import type { StudentDashboardStats, StudentIdentity } from "@/lib/api/types";
import SearchableSchoolDropdown from "@/components/SearchableSchoolDropdown";
import Loader from "@/components/Loader";
import CodeEntryModal from "@/components/CodeEntryModal";

/* ─────────────────────────────────────────────────────────
   Student Dashboard
   Design System: Material 3 (M3) Color System
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
  const [studentSchool, setStudentSchool] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const rollNumber = formData.get("rollNumber") as string;
    const school = formData.get("school") as string || studentSchool;
    const studentClass = formData.get("studentClass") as string;
    const section = formData.get("section") as string;
    if (name && rollNumber && school && studentClass && section) {
      const identity: StudentIdentity = {
        studentId: rollNumber,
        studentName: name,
        school,
        class: studentClass,
        section,
        storedAt: new Date().toISOString(),
      };
      saveStudentIdentity(identity);
      onSubmit(identity);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[60vh] px-4">
      <div className="relative w-full max-w-md">
        <div className="relative mt-8 rounded-2xl p-6 md:p-8" style={{ background: "var(--color-surface-container-lowest)" }}>
          <div className="mb-6 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 mb-4 rounded-full" style={{ background: "var(--color-primary-container)", color: "var(--color-on-primary-container)" }}>
              <IconAssignment />
            </div>
            <h2 className="mb-2 text-xl font-semibold tracking-tight" style={{ color: "var(--color-on-surface)" }}>
              Welcome to Shiksha Sathi
            </h2>
            <p className="max-w-xs mx-auto text-sm leading-relaxed" style={{ color: "var(--color-on-surface-variant)" }}>
              Enter your details to view your assignments and progress.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* School/Institute — Searchable Dropdown */}
            <SearchableSchoolDropdown value={studentSchool} onChange={setStudentSchool} />
            <input type="hidden" name="school" value={studentSchool} />

            {/* Class and Section Row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="relative group">
                <label htmlFor="dashboard-class" className="block text-[0.75rem] font-medium uppercase tracking-[0.05em] mb-2 transition-colors" style={{ color: "var(--color-on-surface-variant)" }}>
                  Class / Grade
                </label>
                <select
                  id="dashboard-class"
                  name="studentClass"
                  required
                  className="w-full px-0 py-3 text-base transition-all border-t-0 border-b border-l-0 border-r-0 bg-transparent focus:ring-0 font-body appearance-none cursor-pointer"
                  style={{ borderColor: "var(--color-outline-variant)", color: "var(--color-on-surface)" }}
                  onFocus={(e) => e.target.style.borderColor = "var(--color-primary)"}
                  onBlur={(e) => e.target.style.borderColor = "var(--color-outline-variant)"}
                >
                  <option value="">Select</option>
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={String(i + 1)}>
                      {i + 1}
                    </option>
                  ))}
                </select>
              </div>

              <div className="relative group">
                <label htmlFor="dashboard-section" className="block text-[0.75rem] font-medium uppercase tracking-[0.05em] mb-2 transition-colors" style={{ color: "var(--color-on-surface-variant)" }}>
                  Section
                </label>
                <input
                  id="dashboard-section"
                  name="section"
                  required
                  placeholder="e.g. A"
                  type="text"
                  className="w-full px-0 py-3 text-base transition-all border-t-0 border-b border-l-0 border-r-0 bg-transparent focus:ring-0 font-body"
                  style={{ borderColor: "var(--color-outline-variant)", color: "var(--color-on-surface)" }}
                  onFocus={(e) => e.target.style.borderColor = "var(--color-primary)"}
                  onBlur={(e) => e.target.style.borderColor = "var(--color-outline-variant)"}
                />
              </div>
            </div>

            {/* Name */}
            <div className="relative group">
              <label htmlFor="student-name" className="block text-[0.75rem] font-medium uppercase tracking-[0.05em] mb-2 transition-colors" style={{ color: "var(--color-on-surface-variant)" }}>
                Full Name
              </label>
              <input
                id="student-name"
                name="name"
                required
                placeholder="e.g. Aarav Patel"
                type="text"
                className="w-full px-0 py-3 text-base transition-all border-t-0 border-b border-l-0 border-r-0 bg-transparent focus:ring-0 font-body"
                style={{ borderColor: "var(--color-outline-variant)", color: "var(--color-on-surface)" }}
                onFocus={(e) => e.target.style.borderColor = "var(--color-primary)"}
                onBlur={(e) => e.target.style.borderColor = "var(--color-outline-variant)"}
              />
            </div>
            {/* Roll Number */}
            <div className="relative group">
              <label htmlFor="student-roll" className="block text-[0.75rem] font-medium uppercase tracking-[0.05em] mb-2 transition-colors" style={{ color: "var(--color-on-surface-variant)" }}>
                Roll Number
              </label>
              <input
                id="student-roll"
                name="rollNumber"
                required
                placeholder="Enter your unique ID"
                type="text"
                className="w-full px-0 py-3 text-base transition-all border-t-0 border-b border-l-0 border-r-0 bg-transparent focus:ring-0 font-body"
                style={{ borderColor: "var(--color-outline-variant)", color: "var(--color-on-surface)" }}
                onFocus={(e) => e.target.style.borderColor = "var(--color-primary)"}
                onBlur={(e) => e.target.style.borderColor = "var(--color-outline-variant)"}
              />
            </div>
            <button
              type="submit"
              className="w-full py-4 px-6 rounded-full font-semibold transition-all duration-200"
              style={{ background: "var(--color-primary-container)", color: "var(--color-on-primary-container)" }}
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
function EmptyState({ onEnterCode }: { onEnterCode: () => void }) {
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
        onClick={onEnterCode}
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
  const router = useRouter();
  const [identity, setIdentity] = useState<StudentIdentity | null>(null);
  const [stats, setStats] = useState<StudentDashboardStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);

  useEffect(() => {
    const existing = getStudentIdentity();
    if (existing) {
      setIdentity(existing);
    } else {
      router.replace("/student/login");
    }
  }, [router]);

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
    return () => { cancelled = true };
  }, [identity]);

  if (!identity) return null;

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
    setIsAssignmentModalOpen(true);
  };

  return (
    <div className="max-w-full pb-12">
      <CodeEntryModal
        isOpen={isAssignmentModalOpen}
        onClose={() => setIsAssignmentModalOpen(false)}
        onSubmit={(code) => window.location.href = `/student/assignment/${code}`}
        title="Enter Assignment Code"
      />
      {/* ═══ Welcome Banner (Refined Premium) ═══ */}
      <header className="mb-6 md:mb-8 lg:mb-10 p-5 md:p-6 rounded-lg" style={{ 
        background: "var(--color-primary-container)",
        border: "1px solid var(--color-outline-variant)",
        borderLeft: "4px solid var(--color-primary)",
        position: "relative",
        overflow: "hidden"
      }}>
        <div className="relative z-10">
          <span className="block font-sans text-[0.8125rem] font-medium uppercase tracking-[0.06em] mb-2" style={{ color: "var(--color-on-primary-container)" }}>
            Student Portal
          </span>
          <h1 className="text-[clamp(1.375rem,3vw,1.75rem)] font-semibold tracking-tight leading-[1.2] m-0" style={{ color: "var(--color-on-primary-container)" }}>
            {greeting}, {currentIdentity.studentName}.
          </h1>
          <p className="text-sm mt-2 max-w-[28rem] leading-[1.6]" style={{ color: "var(--color-on-primary-container)", opacity: 0.85 }}>
            {loading
              ? "Loading your assignments..."
              : stats && stats.totalAssignments > 0
                ? `You have completed ${stats.totalAssignments} assignment${stats.totalAssignments === 1 ? "" : "s"}.${stats.gradedCount < stats.totalAssignments ? ` ${stats.totalAssignments - stats.gradedCount} still pending grading.` : ""}`
                : "Enter an assignment code from your teacher to get started."}
          </p>
        </div>
      </header>

      {/* ═══ Error State ═══ */}
      {error && (
        <div className="mb-6 p-4 text-sm rounded-xl" style={{ background: "var(--color-error-container)", color: "var(--color-error)" }}>
          {error}
          <button
            onClick={() => {
              setIdentity(null);
              localStorage.removeItem("shiksha-sathi-student-identity");
            }}
            className="ml-2 underline font-semibold cursor-pointer bg-transparent border-none"
            style={{ color: "var(--color-error)" }}
          >
            Logout
          </button>
        </div>
      )}

      {/* ═══ Summary Stat Cards (Refined Premium) ═══ */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-10">
        {statCards.map((stat, i) => (
          <div
            key={i}
            className="group p-4 md:p-5 rounded-md transition-all duration-200 hover:shadow-md cursor-default"
            style={{ 
              background: "var(--color-surface-container-lowest)", 
              border: "1px solid var(--color-outline-variant)",
              boxShadow: "var(--shadow-sm)"
            }}
          >
            <div className="flex flex-col items-start gap-2 mb-3 md:mb-4 sm:flex-row sm:justify-between sm:items-start">
              <div className="p-2 rounded-sm flex items-center justify-center transition-colors duration-200" style={{ background: "var(--color-secondary-container)", color: "var(--color-on-secondary-container)" }}>
                {stat.icon}
              </div>
              <span className="text-[0.5625rem] md:text-[0.625rem] font-bold leading-[1.4] px-2 py-0.5 rounded-full" style={{ background: "var(--color-primary-container)", color: "var(--color-on-primary-container)" }}>
                {stat.badge}
              </span>
            </div>
            <h3 className="text-[1.375rem] md:text-2xl font-semibold m-0" style={{ color: "var(--color-on-surface)" }}>
              {loading ? "—" : stat.value}
            </h3>
            <p className="text-[0.625rem] md:text-[0.6875rem] font-medium uppercase tracking-[0.08em] mt-1 leading-[1.4]" style={{ color: "var(--color-on-surface-variant)" }}>
              {stat.label}
            </p>
          </div>
        ))}
      </section>

      {/* ═══ Quick Action (Premium Flat Button) ═══ */}
      <div className="mb-6 md:mb-10">
        <button
          onClick={handleEnterCode}
          className="inline-flex items-center gap-2.5 px-5 py-2.5 text-sm font-medium cursor-pointer transition-all duration-200 rounded-sm"
          style={{ 
            background: "var(--color-primary)", 
            color: "var(--color-on-primary)",
            boxShadow: "var(--shadow-sm)"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = "var(--shadow-md)";
            e.currentTarget.style.transform = "translateY(-1px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = "var(--shadow-sm)";
            e.currentTarget.style.transform = "translateY(0)";
          }}
          onMouseDown={(e) => {
            e.currentTarget.style.transform = "translateY(0) scale(0.98)";
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.transform = "translateY(-1px)";
          }}
        >
          <IconCode />
          Enter Assignment Code
        </button>
      </div>

      {/* ═══ Recent Assignments (Refined Premium) ═══ */}
      <section>
        <div className="flex items-center justify-between mb-3 md:mb-4">
          <h2 className="text-base font-semibold tracking-tight" style={{ color: "var(--color-on-surface)" }}>
            Recent Assignments
          </h2>
          {stats && stats.recentSubmissions.length > 0 && (
            <Link href="/student/assignments" className="text-[0.6875rem] font-medium no-underline flex items-center gap-1 px-2.5 py-1 rounded-xs transition-colors" style={{ color: "var(--color-primary)", background: "var(--color-primary-container)" }}>
              View All
              <IconChevronRight />
            </Link>
          )}
        </div>

        {!stats || loading ? (
          <div className="rounded-md p-8 flex justify-center text-center" style={{ background: "var(--color-surface-container-lowest)", border: "1px solid var(--color-outline-variant)", boxShadow: "var(--shadow-sm)" }}>
            <Loader size="md" label="Loading..." />
          </div>
        ) : stats.recentSubmissions.length === 0 ? (
          <EmptyState onEnterCode={handleEnterCode} />
        ) : (
          <div className="rounded-md overflow-hidden" style={{ background: "var(--color-surface-container-lowest)", border: "1px solid var(--color-outline-variant)", boxShadow: "var(--shadow-sm)" }}>
            {/* Desktop Table */}
            <div className="hidden md:block">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-sm">
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--color-outline-variant)" }}>
                      {["Assignment", "Score", "Status", "Submitted", ""].map((h, idx) => (
                        <th
                          key={h}
                          className={`p-3 md:p-3.5 px-4 md:px-6 text-[0.625rem] font-bold uppercase tracking-[0.08em] ${idx === 4 ? "text-right" : "text-left"}`}
                          style={{ color: "var(--color-on-surface-variant)" }}
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
                          className="transition-colors duration-200 ease-out cursor-pointer"
                          style={{ 
                            borderBottom: "1px solid var(--color-outline-variant)",
                            background: "transparent"
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = "var(--color-surface-container)"}
                          onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                          onClick={() => window.location.href = `/student/results/${sub.id}`}
                        >
<td className="p-3 md:p-3.5 px-4 md:px-6">
                             <Link
                               href={`/student/results/${sub.id}`}
                               className="font-medium m-0 text-sm no-underline hover:underline"
                               style={{ color: "var(--color-on-surface)" }}
                             >
                               {sub.assignmentTitle}
                             </Link>
                           </td>
                          <td className="p-3 md:p-3.5 px-4 md:px-6">
                            {isGraded && scorePct !== null ? (
                              <span className="font-semibold text-sm" style={{ color: scorePct >= 70 ? "var(--color-success)" : scorePct >= 50 ? "var(--color-warning)" : "var(--color-error)" }}>
                                {sub.score}/{sub.totalMarks} ({scorePct}%)
                              </span>
                            ) : (
                              <span className="text-sm" style={{ color: "var(--color-on-surface-variant)" }}>—</span>
                            )}
                          </td>
                          <td className="p-3 md:p-3.5 px-4 md:px-6">
                            <span className="inline-flex items-center px-2.5 py-1 text-[0.625rem] font-bold tracking-wider rounded-xs uppercase" style={{
                              background: isGraded ? "var(--color-success-container)" : "var(--color-surface-container)",
                              color: isGraded ? "var(--color-on-success-container)" : "var(--color-on-surface-variant)",
                            }}>
                              {isGraded ? "Graded" : "Pending"}
                            </span>
                          </td>
                          <td className="p-3 md:p-3.5 px-4 md:px-6 text-sm" style={{ color: "var(--color-on-surface-variant)" }}>
                            {new Date(sub.submittedAt).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                            })}
                          </td>
                          <td className="p-3 md:p-3.5 px-4 md:px-6 text-right">
                            <Link
                              href={`/student/results/${sub.id}`}
                              className="text-[0.6875rem] font-medium uppercase tracking-[0.04em] no-underline inline-flex items-center gap-1"
                              style={{ color: "var(--color-primary)" }}
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
        <section className="mt-6 md:mt-8">
          <div className="rounded-md p-4 md:p-5" style={{ background: "var(--color-surface-container-low)", border: "1px solid var(--color-outline-variant)" }}>
            <h2 className="font-manrope text-sm font-semibold tracking-tight mb-2" style={{ color: "var(--color-on-surface)" }}>
              Study Tip
            </h2>
            <p className="text-sm leading-relaxed" style={{ color: "var(--color-on-surface-variant)" }}>
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
