"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import { api } from "@/lib/api";
import { saveStudentIdentity, getStudentIdentity } from "@/lib/api/students";
import type { AssignmentByLinkResponse, SubmitAssignmentResponse, StudentIdentity } from "@/lib/api/types";
import SearchableSchoolDropdown from "@/components/SearchableSchoolDropdown";

/* ─────────────────────────────────────────────────────────
   Student Assignment Form — Stitch-Directed Redesign
   Design Source:
     - identity_entry/code.html  → Identity stage
     - assignment_taking/code.html → Assessment stage
     - results/code.html → Results stage
   All three views implement Digital Atelier tokens.

   Phase: "answer_questions" design alignment.
   ───────────────────────────────────────────────────────── */

interface StudentAssignmentFormProps {
  assignment: AssignmentByLinkResponse;
  onProgressChange?: (answered: number) => void;
}

export default function StudentAssignmentForm({
  assignment,
  onProgressChange,
}: StudentAssignmentFormProps) {
  // Check localStorage for existing identity on mount
  const existingIdentity = getStudentIdentity();
  const existingStudentId = existingIdentity?.studentId || null;
  const [identity, setIdentity] = useState<{
    name: string;
    rollNumber: string;
    school?: string;
    studentClass?: string;
    section?: string;
  } | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<SubmitAssignmentResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [existingSubmission, setExistingSubmission] = useState<SubmitAssignmentResponse | null>(null);
  const [mounted, setMounted] = useState(false);

  // Sync identity from localStorage after mount (prevents hydration mismatch)
  useEffect(() => {
    setMounted(true);
    if (existingStudentId && existingIdentity) {
      setIdentity({ name: existingIdentity.studentName, rollNumber: existingStudentId });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existingStudentId]);

  // Check for existing submission on mount
  const [hasCheckedSubmission, setHasCheckedSubmission] = useState(false);

  useEffect(() => {
    if (!existingStudentId) return;
    const sid = existingStudentId;
    let cancelled = false;
    async function check() {
      try {
        const submissions = await api.students.getSubmissions(sid);
        const existing = submissions.find((s) => s.assignmentId === assignment.id);
        if (existing && !cancelled) {
          setExistingSubmission({
            success: true,
            score: existing.score,
            totalMarks: existing.totalMarks,
            feedback: [],
          });
        }
      } catch {
        // Silently ignore — no existing submission
      } finally {
        if (!cancelled) setHasCheckedSubmission(true);
      }
    }
    check();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existingStudentId, assignment.id]);

  // Notify parent of progress changes
  const prevCountRef = useRef(0);
  useEffect(() => {
    const count = Object.keys(answers).length;
    if (onProgressChange && count !== prevCountRef.current) {
      prevCountRef.current = count;
      onProgressChange(count);
    }
  }, [answers, onProgressChange]);

  const handleIdentitySubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const rollNumber = formData.get("rollNumber") as string;
    const school = formData.get("school") as string;
    const studentClass = formData.get("studentClass") as string;
    const section = formData.get("section") as string;
    const identityData = { name, rollNumber, school, studentClass, section };
    setIdentity(identityData);

    // Persist identity for dashboard access
    const studentIdentity: StudentIdentity = {
      studentId: rollNumber,
      studentName: name,
      school,
      class: studentClass,
      section,
      storedAt: new Date().toISOString(),
    };
    saveStudentIdentity(studentIdentity);

    setError(null);
  };

  // Controlled state for school dropdown
  const [studentSchool, setStudentSchool] = useState("");

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmitAssignment = () => {
    if (!identity) return;

    // Check if all questions are answered
    if (Object.keys(answers).length < assignment.questions.length) {
      setError("Please answer all questions before submitting.");
      return;
    }

    setError(null);
    startTransition(async () => {
      try {
        const res = await api.assignments.submitAssignment(
          assignment.id,
          identity.name,
          identity.rollNumber,
          identity.school || "",
          identity.studentClass || "",
          identity.section || "",
          answers
        );
        setResult(res);
      } catch (err: unknown) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to submit assignment"
        );
      }
    });
  };

  const totalQuestions = assignment.questions.length;

  /* ════════════════════════════════════════════════════════
     ALREADY SUBMITTED — show results link
     ════════════════════════════════════════════════════════ */
  if (mounted && hasCheckedSubmission && existingSubmission) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
        <div className="w-16 h-16 rounded-full bg-primary-container/30 flex items-center justify-center mb-6 text-primary">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h2 className="text-xl font-bold tracking-tight text-on-surface font-headline mb-2">
          Already Submitted
        </h2>
        <p className="text-sm text-on-surface-variant max-w-sm leading-relaxed mb-6">
          You have already submitted this assignment. Check your student dashboard for results.
        </p>
        <a
          href="/student/dashboard"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-on-primary rounded-lg text-sm font-bold no-underline hover:brightness-110 transition-all"
        >
          Go to Dashboard
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
          </svg>
        </a>
      </div>
    );
  }

  /* ════════════════════════════════════════════════════════
     STAGE 3: Results View — Stitch "results" direction
     Digital Atelier design tokens via Tailwind CSS
     ════════════════════════════════════════════════════════ */
  if (result) {
    const scorePercent = result.totalMarks > 0
      ? Math.round((result.score / result.totalMarks) * 100)
      : 0;

    return (
      <div className="w-full max-w-4xl px-4 py-8 mx-auto md:py-12 lg:py-16">
        {/* Success Confirmation */}
        <div className="flex flex-col items-center justify-center mb-10 text-center md:mb-14">
          <div className="flex items-center justify-center mb-4 rounded-full w-14 h-14 md:w-16 bg-primary-container md:mb-6">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h2 className="font-headline text-on-surface-variant text-sm tracking-[0.05em] font-semibold mb-2 uppercase">
            Submission Confirmed
          </h2>
          <h1 className="text-2xl font-extrabold tracking-tight font-headline md:text-3xl text-on-surface">
            Assignment Submitted Successfully
          </h1>
        </div>

        {/* Score Display — Bento Grid */}
        <div className="grid grid-cols-1 gap-4 mb-10 md:grid-cols-12 md:gap-6 md:mb-14">
          {/* Main Score Card */}
          <div className="relative flex flex-col items-center justify-center p-6 overflow-hidden rounded-lg md:col-span-8 bg-surface-container-lowest md:p-10">
            <div className="absolute top-0 left-0 w-full h-1 bg-primary" />
            <span className="mb-4 text-xs font-bold tracking-widest uppercase font-label text-on-surface-variant">
              Total Performance
            </span>
            <div className="flex items-baseline gap-3">
              <span className="font-extrabold leading-none tracking-tighter text-8xl font-headline text-primary">
                {result.score}
              </span>
              <span className="text-4xl font-bold font-headline text-outline-variant">
                / {result.totalMarks}
              </span>
            </div>
            <p className="max-w-xs mt-6 text-sm font-medium text-center text-on-surface-variant">
              {scorePercent >= 80
                ? `Excellent work, ${identity?.name}! You've demonstrated a strong grasp of the material.`
                : scorePercent >= 50
                ? `Good effort, ${identity?.name}. Review the feedback below to improve.`
                : `Keep studying, ${identity?.name}. Review the detailed feedback for guidance.`}
            </p>
          </div>

          {/* Stats Sidebar */}
          <div className="flex flex-col gap-4 md:col-span-4 md:gap-6">
            <div className="flex-1 p-5 rounded-lg bg-surface-container-low md:p-6">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-3 text-primary">
                <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
              </svg>
              <div className="text-2xl font-bold font-headline text-on-surface">
                {totalQuestions}
              </div>
              <div className="text-xs tracking-wider uppercase font-label text-on-surface-variant">
                Total Questions
              </div>
            </div>
            <div className="flex-1 p-5 rounded-lg bg-tertiary-container md:p-6">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-3">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" />
              </svg>
              <div className="text-2xl font-bold font-headline">
                {scorePercent}%
              </div>
              <div className="text-xs tracking-wider uppercase font-label opacity-80">
                Score Rate
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Feedback */}
        {result.feedback && result.feedback.length > 0 && (
          <section className="space-y-8 md:space-y-12">
            <div className="flex items-center justify-between pb-3 border-b border-surface-container md:pb-4">
              <h3 className="text-lg font-bold tracking-tight font-headline md:text-xl text-on-surface">
                Detailed Feedback
              </h3>
              <div className="flex gap-2 md:gap-4">
                <div className="flex items-center gap-1 text-xs font-medium md:gap-2 text-on-surface-variant">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" /> Correct
                </div>
                <div className="flex items-center gap-1 text-xs font-medium md:gap-2 text-on-surface-variant">
                  <div className="w-2 h-2 rounded-full bg-error" /> Incorrect
                </div>
              </div>
            </div>

            <div className="space-y-8 md:space-y-10">
              {result.feedback.map((f, i: number) => (
                <div key={f.questionId} className="group">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:gap-6">
                    {/* Question Number */}
                    <div className="flex items-center justify-center flex-shrink-0 text-sm font-bold rounded-sm w-7 h-7 md:w-8 md:h-8 bg-surface-container font-headline text-primary">
                      {String(i + 1).padStart(2, "0")}
                    </div>
                    <div className="flex-1 space-y-3 md:space-y-4">
                      <div className="flex items-start justify-between gap-3 md:gap-4">
                        <h4 className="text-base font-medium leading-relaxed font-body text-on-surface">
                          {f.questionText}
                        </h4>
                        <span
                          className={`inline-flex items-center px-2 py-1 text-[0.6875rem] font-bold tracking-wider rounded-sm uppercase whitespace-nowrap ${
                            f.isCorrect
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-red-50 text-error"
                          }`}
                        >
                          {f.isCorrect ? `Correct (+${f.marksAwarded})` : "Incorrect"}
                        </span>
                      </div>

                      {f.isCorrect ? (
                        <div className="p-4 border-l-2 rounded-sm bg-surface-container-low border-emerald-500">
                          <div className="text-[0.6875rem] text-on-surface-variant font-bold tracking-widest mb-1 uppercase">
                            Your Answer
                          </div>
                          <div className="font-medium text-emerald-700">
                            {f.studentAnswer}
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                          <div className="p-4 border-l-2 rounded-sm bg-surface-container-low border-error">
                            <div className="text-[0.6875rem] text-on-surface-variant font-bold tracking-widest mb-1 uppercase">
                              Your Answer
                            </div>
                            <div className="font-medium line-through text-error">
                              {f.studentAnswer}
                            </div>
                          </div>
                          <div className="p-4 border-l-2 rounded-sm bg-emerald-50 border-emerald-500">
                            <div className="text-[0.6875rem] text-emerald-700 font-bold tracking-widest mb-1 uppercase">
                              Correct Answer
                            </div>
                            <div className="font-medium text-emerald-700">
                              {Array.isArray(f.correctAnswer)
                                ? f.correctAnswer.join(" or ")
                                : f.correctAnswer}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Action Footer */}
        <div className="flex flex-col items-center justify-between gap-4 pt-6 mt-10 border-t md:mt-12 lg:mt-16 md:pt-8 border-surface-container md:flex-row md:gap-6">
          <div>
            <div className="text-sm font-bold text-on-surface">{identity?.name}</div>
            <div className="text-xs text-on-surface-variant">Roll No: {identity?.rollNumber}</div>
          </div>
          <div className="flex gap-3 md:gap-4">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-5 md:px-6 py-2.5 text-primary font-bold text-sm bg-primary-container/20 rounded-sm hover:bg-primary-container/40 transition-all duration-200"
            >
              Retake
            </button>
            <button
              type="button"
              onClick={() => (window.location.href = "/student/dashboard")}
              className="px-6 md:px-8 py-2.5 bg-primary text-on-primary font-bold text-sm rounded-sm shadow-sm hover:brightness-110 active:scale-[0.98] transition-all duration-200"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

    /* ════════════════════════════════════════════════════════
     STAGE 1: Identity Entry — Stitch "identity_entry" direction
     ════════════════════════════════════════════════════════ */
  if (!identity) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] md:min-h-[60vh] px-4">
        <div className="relative w-full max-w-lg">
          <div className="relative rounded-2xl p-6 md:p-8 lg:p-12" style={{ background: "var(--color-m3-surface-container-lowest)" }}>
            <div className="mb-8 text-center md:mb-10">
              <div className="inline-flex items-center justify-center w-12 h-12 mb-4 rounded-full md:mb-6" style={{ background: "var(--color-m3-primary-container)", color: "var(--color-m3-on-primary-container)" }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <h2 className="mb-2 text-xl font-semibold tracking-tight md:text-2xl" style={{ color: "var(--color-m3-on-surface)" }}>
                Enter your details to start
              </h2>
              <p className="max-w-xs mx-auto text-sm leading-relaxed" style={{ color: "var(--color-m3-on-surface-variant)" }}>
                Please provide your institutional identity to begin the assessment module.
              </p>
            </div>

            {error && (
              <div className="mb-4 md:mb-5 p-3 text-[0.8125rem] text-center rounded-xl" style={{ background: "var(--color-m3-error-container)", color: "var(--color-m3-error)" }}>
                {error}
              </div>
            )}

            <form onSubmit={handleIdentitySubmit} className="space-y-5 md:space-y-6">
              {/* School/Institute — Searchable Dropdown */}
              <SearchableSchoolDropdown value={studentSchool} onChange={(v) => { setStudentSchool(v); }} />
              {/* Hidden input to carry school value in FormData */}
              <input type="hidden" name="school" value={studentSchool} />

              {/* Class and Section Row */}
              <div className="grid grid-cols-2 gap-4 md:gap-6">
                <div className="relative group">
                  <label
                    htmlFor="student-class"
                    className="block text-[0.75rem] font-medium uppercase tracking-[0.05em] mb-2 transition-colors"
                    style={{ color: "var(--color-m3-on-surface-variant)" }}
                  >
                    Class / Grade
                  </label>
                  <select
                    id="student-class"
                    name="studentClass"
                    required
                    className="w-full px-0 py-3 text-base transition-all border-t-0 border-b border-l-0 border-r-0 bg-transparent focus:ring-0 font-body appearance-none cursor-pointer"
                    style={{ borderColor: "var(--color-m3-outline-variant)", color: "var(--color-m3-on-surface)" }}
                    onFocus={(e) => e.target.style.borderColor = "var(--color-m3-primary)"}
                    onBlur={(e) => e.target.style.borderColor = "var(--color-m3-outline-variant)"}
                  >
                    <option value="">Select</option>
                    {Array.from({ length: 12 }, (_, i) => (
                      <option key={i + 1} value={String(i + 1)}>
                        Class {i + 1}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="relative group">
                  <label
                    htmlFor="student-section"
                    className="block text-[0.75rem] font-medium uppercase tracking-[0.05em] mb-2 transition-colors"
                    style={{ color: "var(--color-m3-on-surface-variant)" }}
                  >
                    Section
                  </label>
                  <input
                    id="student-section"
                    name="section"
                    required
                    placeholder="e.g. A"
                    type="text"
                    className="w-full px-0 py-3 text-base transition-all border-t-0 border-b border-l-0 border-r-0 bg-transparent focus:ring-0 font-body"
                    style={{ borderColor: "var(--color-m3-outline-variant)", color: "var(--color-m3-on-surface)" }}
                    onFocus={(e) => e.target.style.borderColor = "var(--color-m3-primary)"}
                    onBlur={(e) => e.target.style.borderColor = "var(--color-m3-outline-variant)"}
                  />
                </div>
              </div>

              {/* Name */}
              <div className="relative group">
                <label
                  htmlFor="student-name"
                  className="block text-[0.75rem] font-medium uppercase tracking-[0.05em] mb-2 transition-colors"
                  style={{ color: "var(--color-m3-on-surface-variant)" }}
                >
                  Full Name
                </label>
                <input
                  id="student-name"
                  name="name"
                  required
                  placeholder="e.g. Aarav Patel"
                  type="text"
                  className="w-full px-0 py-3 text-base transition-all border-t-0 border-b border-l-0 border-r-0 bg-transparent focus:ring-0 font-body"
                  style={{ borderColor: "var(--color-m3-outline-variant)", color: "var(--color-m3-on-surface)" }}
                  onFocus={(e) => e.target.style.borderColor = "var(--color-m3-primary)"}
                  onBlur={(e) => e.target.style.borderColor = "var(--color-m3-outline-variant)"}
                />
              </div>

              {/* Roll Number */}
              <div className="relative group">
                <label
                  htmlFor="student-roll"
                  className="block text-[0.75rem] font-medium uppercase tracking-[0.05em] mb-2 transition-colors"
                  style={{ color: "var(--color-m3-on-surface-variant)" }}
                >
                  Roll Number
                </label>
                <input
                  id="student-roll"
                  name="rollNumber"
                  required
                  placeholder="Enter your unique ID"
                  type="text"
                  className="w-full px-0 py-3 text-base transition-all border-t-0 border-b border-l-0 border-r-0 bg-transparent focus:ring-0 font-body"
                  style={{ borderColor: "var(--color-m3-outline-variant)", color: "var(--color-m3-on-surface)" }}
                  onFocus={(e) => e.target.style.borderColor = "var(--color-m3-primary)"}
                  onBlur={(e) => e.target.style.borderColor = "var(--color-m3-outline-variant)"}
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-4 px-6 rounded-full font-semibold tracking-wide transition-all duration-200 flex items-center justify-center gap-2"
                  style={{
                    background: "var(--color-m3-primary-container)",
                    color: "var(--color-m3-on-primary-container)",
                  }}
                >
                  <span>Start Assignment</span>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                  </svg>
                </button>

                <div className="flex items-center justify-center mt-4 space-x-3 md:mt-6 md:space-x-4 opacity-60">
                  <div className="flex items-center space-x-1">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                    <span className="text-[0.6875rem] font-medium uppercase tracking-wider" style={{ color: "var(--color-m3-on-surface-variant)" }}>
                      Assessment
                    </span>
                  </div>
                  <div className="w-1 h-1 rounded-full" style={{ background: "var(--color-m3-outline-variant)" }} />
                  <div className="flex items-center space-x-1">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18" /></svg>
                    <span className="text-[0.6875rem] font-medium uppercase tracking-wider" style={{ color: "var(--color-m3-on-surface-variant)" }}>
                      {totalQuestions} Questions
                    </span>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  /* ════════════════════════════════════════════════════════
     STAGE 2: Assessment Taking — M3 Design
     ════════════════════════════════════════════════════════ */
  return (
    <section className="space-y-6">
      {assignment.questions.map((q, index) => (
        <article
          key={q.id}
          className="p-5 md:p-6 rounded-xl transition-colors duration-200"
          style={{ background: "var(--color-m3-surface-container-lowest)" }}
        >
          <div className="flex justify-between items-start mb-5">
            <div className="flex gap-4 items-start">
              <span className="text-sm font-semibold shrink-0" style={{ color: "var(--color-m3-primary)" }}>
                {String(index + 1).padStart(2, "0")}.
              </span>
              <h2 className="text-base font-medium leading-relaxed" style={{ color: "var(--color-m3-on-surface)" }}>
                {q.text}
              </h2>
            </div>
            <span className="text-[0.75rem] font-bold tracking-wider px-3 py-1 rounded-full shrink-0 ml-4" style={{ background: "var(--color-m3-surface-container)", color: "var(--color-m3-on-surface-variant)" }}>
              {q.points || 1} MARKS
            </span>
          </div>

          {q.options && (q.type === "MCQ" || q.type === "TRUE_FALSE") ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-10">
              {q.options.map((opt, i) => {
                const isSelected = answers[q.id] === opt;
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleAnswerChange(q.id, opt)}
                    className="flex items-center gap-3 p-4 rounded-xl transition-all text-left text-sm group"
                    style={{
                      background: isSelected ? "var(--color-m3-primary-container)" : "var(--color-m3-surface-container-low)",
                      border: isSelected ? "1px solid var(--color-m3-primary)" : "1px solid transparent",
                    }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" className="shrink-0" style={{
                      fill: isSelected ? "var(--color-m3-primary)" : "none",
                      stroke: isSelected ? "var(--color-m3-primary)" : "var(--color-m3-outline)",
                      strokeWidth: 2,
                    }}>
                      <circle cx="12" cy="12" r="8" />
                      {isSelected && <circle cx="12" cy="12" r="4" fill="var(--color-m3-on-primary-container)" />}
                    </svg>
                    <span className="text-sm" style={{
                      color: isSelected ? "var(--color-m3-on-primary-container)" : "var(--color-m3-on-surface)",
                      fontWeight: isSelected ? 600 : 400,
                    }}>
                      {String.fromCharCode(65 + i)}) {opt}
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="pl-10">
              <div className="relative max-w-md">
                <input
                  type="text"
                  value={answers[q.id] || ""}
                  onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                  placeholder="Type your answer here..."
                  className="w-full border-0 border-b-2 focus:ring-0 px-0 py-3 text-sm transition-all font-body bg-transparent"
                  style={{
                    borderColor: "var(--color-m3-outline-variant)",
                    color: "var(--color-m3-on-surface)",
                  }}
                  onFocus={(e) => e.target.style.borderColor = "var(--color-m3-primary)"}
                  onBlur={(e) => e.target.style.borderColor = "var(--color-m3-outline-variant)"}
                />
                <p className="mt-2 text-[0.75rem] italic" style={{ color: "var(--color-m3-on-surface-variant)" }}>
                  Enter a single word or a short phrase.
                </p>
              </div>
            </div>
          )}
        </article>
      ))}

      {/* Error */}
      {error && (
        <div className="p-4 text-sm font-medium text-center rounded-xl" style={{ background: "var(--color-m3-error-container)", color: "var(--color-m3-error)" }}>
          {error}
        </div>
      )}

      {/* M3 FAB Submit */}
      <div className="mt-12 pt-8 flex flex-col items-center" style={{ borderTop: "1px solid var(--color-m3-outline-variant)" }}>
        <p className="text-xs mb-6 flex items-center gap-2" style={{ color: "var(--color-m3-on-surface-variant)" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--color-m3-primary)" }}>
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
          Please review all answers before final submission.
        </p>
        <button
          type="button"
          onClick={handleSubmitAssignment}
          disabled={isPending}
          className="px-8 py-4 rounded-full font-semibold text-sm flex items-center gap-3 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: "var(--color-m3-primary-container)",
            color: "var(--color-m3-on-primary-container)",
          }}
        >
          {isPending ? "Submitting…" : "Submit Assignment"}
          {!isPending && (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          )}
        </button>
      </div>
    </section>
  );
}
