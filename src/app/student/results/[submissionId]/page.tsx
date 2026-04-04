"use client";

import { useEffect, useState } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getStudentIdentity, students } from "@/lib/api/students";
import { fetchApi } from "@/lib/api/client";
import type { StudentIdentity, SubmissionDTO, Assignment } from "@/lib/api/types";

/* ─────────────────────────────────────────────────────────
   Student Results Page
   Shows detailed feedback for a single submission.
   Reuses the "Digital Atelier" results pattern from
   StudentAssignmentForm but as a standalone page.
   ───────────────────────────────────────────────────────── */

interface QuestionFeedback {
  questionId: string;
  questionText: string;
  studentAnswer: string;
  correctAnswer: string | string[];
  isCorrect: boolean;
  marksAwarded: number;
  totalMarks: number;
}

interface ResultData {
  submission: SubmissionDTO;
  assignment: Assignment | null;
  feedback: QuestionFeedback[];
  score: number;
  totalMarks: number;
  scorePercent: number;
}

export default function StudentResultsPage({
  params,
}: {
  params: Promise<{ submissionId: string }>;
}) {
  const [identity, setIdentity] = useState<StudentIdentity | null>(null);
  const [result, setResult] = useState<ResultData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const existing = getStudentIdentity();
    if (existing) setIdentity(existing);
  }, []);

  useEffect(() => {
    async function load() {
      const resolvedParams = await params;
      if (!identity) return;

      setLoading(true);
      setError(null);
      try {
        // Fetch submission
        const submissions = await students.getSubmissions(identity.studentId);
        const submission = submissions.find((s) => s.id === resolvedParams.submissionId);
        if (!submission) {
          // Try fetching from backend directly
          const allSubs = await fetchApi<SubmissionDTO[]>(`/submissions/student/${identity.studentId}`, { method: "GET" });
          const rawSub = allSubs.find((s) => s.id === resolvedParams.submissionId);
          if (!rawSub) {
            notFound();
            return;
          }

          // Fetch assignment details
          let assignment: Assignment | null = null;
          try {
            assignment = await fetchApi<Assignment>(`/assignments/${rawSub.assignmentId}`, { method: "GET" });
          } catch { /* ignore */ }

          // Compute feedback
          const feedback = computeFeedback(rawSub, assignment);
          const totalMarks = assignment?.maxScore ?? 0;
          const scorePercent = totalMarks > 0 ? Math.round((rawSub.score / totalMarks) * 100) : 0;

          setResult({
            submission: rawSub,
            assignment,
            feedback,
            score: rawSub.score,
            totalMarks,
            scorePercent,
          });
          return;
        }

        // We have enriched submission — fetch assignment for details
        let assignment: Assignment | null = null;
        try {
          assignment = await fetchApi<Assignment>(`/assignments/${submission.assignmentId}`, { method: "GET" });
        } catch { /* ignore */ }

        // Fetch raw submission for answers
        const rawSubs = await fetchApi<SubmissionDTO[]>(`/submissions/student/${identity.studentId}`, { method: "GET" });
        const rawSub = rawSubs.find((s) => s.id === submission.id) ?? null;

        const feedback = rawSub ? computeFeedback(rawSub, assignment) : [];
        const totalMarks = assignment?.maxScore ?? submission.totalMarks;
        const scorePercent = totalMarks > 0 ? Math.round((submission.score / totalMarks) * 100) : 0;

        setResult({
          submission: rawSub ?? {
            id: submission.id,
            assignmentId: submission.assignmentId,
            studentId: identity.studentId,
            studentName: submission.studentName,
            studentRollNumber: submission.studentRollNumber,
            answers: {},
            score: submission.score,
            submittedAt: submission.submittedAt,
            status: submission.status,
          },
          assignment,
          feedback,
          score: submission.score,
          totalMarks,
          scorePercent,
        });
      } catch {
        setError("Could not load your results.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [identity, params]);

  if (!identity) {
    window.location.href = "/student/dashboard";
    return null;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-sm text-on-surface-variant">Loading your results...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <p className="text-sm text-error">{error}</p>
        <Link
          href="/student/assignments"
          className="text-sm font-bold text-primary no-underline"
        >
          ← Back to Assignments
        </Link>
      </div>
    );
  }

  if (!result) return null;

  const isGraded = result.submission.status === "GRADED";

  return (
    <div className="max-w-4xl mx-auto pb-12">
      {/* ═══ Header ═══ */}
      <header className="mb-6 md:mb-8">
        <Link href="/student/assignments" className="text-[0.6875rem] font-bold text-primary no-underline flex items-center gap-1 mb-4">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="rotate-180">
            <path d="m9 18 6-6-6-6" />
          </svg>
          Back to Assignments
        </Link>
        <span className="block font-sans text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-primary mb-2">
          {isGraded ? "Results" : "Submission Details"}
        </span>
        <h1 className="font-manrope text-[clamp(1.25rem,3vw,1.75rem)] font-extrabold text-on-surface tracking-[-0.02em] leading-[1.2] m-0">
          {result.assignment?.title ?? "Assignment"}
        </h1>
        <p className="text-sm text-on-surface-variant mt-2">
          Submitted on {new Date(result.submission.submittedAt).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
      </header>

      {/* ═══ Score Card ═══ */}
      {isGraded ? (
        <div className="grid grid-cols-1 gap-4 mb-10 md:grid-cols-12 md:gap-6 md:mb-14">
          {/* Main Score Card */}
          <div className="relative flex flex-col items-center justify-center p-6 overflow-hidden rounded-lg md:col-span-8 bg-surface-container-lowest md:p-10">
            <div className="absolute top-0 left-0 w-full h-1 bg-primary" />
            <span className="mb-4 text-xs font-bold tracking-widest uppercase text-on-surface-variant">
              Total Performance
            </span>
            <div className="flex items-baseline gap-3">
              <span className="font-extrabold leading-none tracking-tighter text-8xl text-primary">
                {result.score}
              </span>
              <span className="text-4xl font-bold text-outline-variant">
                / {result.totalMarks}
              </span>
            </div>
            <p className="max-w-xs mt-6 text-sm font-medium text-center text-on-surface-variant">
              {result.scorePercent >= 80
                ? `Excellent work, ${identity.studentName}! You've demonstrated a strong grasp of the material.`
                : result.scorePercent >= 50
                  ? `Good effort, ${identity.studentName}. Review the feedback below to improve.`
                  : `Keep studying, ${identity.studentName}. Review the detailed feedback for guidance.`}
            </p>
          </div>

          {/* Stats Sidebar */}
          <div className="flex flex-col gap-4 md:col-span-4 md:gap-6">
            <div className="flex-1 p-5 rounded-lg bg-surface-container-low md:p-6">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-3 text-primary">
                <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
              </svg>
              <div className="text-2xl font-bold text-on-surface">
                {result.feedback.length}
              </div>
              <div className="text-xs tracking-wider uppercase text-on-surface-variant">
                Total Questions
              </div>
            </div>
            <div className="flex-1 p-5 rounded-lg bg-tertiary-container md:p-6">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-3">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" />
              </svg>
              <div className="text-2xl font-bold">
                {result.scorePercent}%
              </div>
              <div className="text-xs tracking-wider uppercase opacity-80">
                Score Rate
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-surface-container-lowest rounded-lg border border-outline-variant/15 p-6 mb-8 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 mb-4 rounded-full bg-surface-container text-on-surface-variant">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <h2 className="text-base font-bold text-on-surface mb-2">Awaiting Grading</h2>
          <p className="text-sm text-on-surface-variant">
            Your teacher hasn&apos;t graded this assignment yet. Check back later for your results.
          </p>
        </div>
      )}

      {/* ═══ Detailed Feedback ═══ */}
      {isGraded && result.feedback.length > 0 && (
        <section className="space-y-8 md:space-y-12">
          <div className="flex items-center justify-between pb-3 border-b border-surface-container md:pb-4">
            <h3 className="text-lg font-bold tracking-tight md:text-xl text-on-surface">
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
            {result.feedback.map((f, i) => (
              <div key={f.questionId} className="group">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:gap-6">
                  {/* Question Number */}
                  <div className="flex items-center justify-center flex-shrink-0 text-sm font-bold rounded-sm w-7 h-7 md:w-8 md:h-8 bg-surface-container text-primary">
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <div className="flex-1 space-y-3 md:space-y-4">
                    <div className="flex items-start justify-between gap-3 md:gap-4">
                      <h4 className="text-base font-medium leading-relaxed text-on-surface">
                        {f.questionText || `Question ${i + 1}`}
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
                            {f.studentAnswer || "(No answer)"}
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

      {/* ═══ Action Footer ═══ */}
      <div className="flex flex-col items-center justify-between gap-4 pt-6 mt-10 border-t md:mt-12 md:pt-8 border-surface-container md:flex-row md:gap-6">
        <div>
          <div className="text-sm font-bold text-on-surface">{identity.studentName}</div>
          <div className="text-xs text-on-surface-variant">Roll No: {identity.studentId}</div>
        </div>
        <div className="flex gap-3 md:gap-4">
          <Link
            href="/student/assignments"
            className="px-5 md:px-6 py-2.5 text-primary font-bold text-sm bg-primary-container/20 rounded-sm hover:bg-primary-container/40 transition-all duration-200 no-underline"
          >
            All Assignments
          </Link>
          <Link
            href="/student/dashboard"
            className="px-6 md:px-8 py-2.5 bg-primary text-on-primary font-bold text-sm rounded-sm shadow-sm hover:brightness-110 active:scale-[0.98] transition-all duration-200 no-underline"
          >
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ── Helpers ── */

function computeFeedback(submission: SubmissionDTO, assignment: Assignment | null): QuestionFeedback[] {
  if (!assignment) return [];

  return assignment.questionIds.map((qId) => {
    // We don't have full question details here — use submission answers
    const studentAnswer = stringifyAnswer(submission.answers?.[qId]);
    return {
      questionId: qId,
      questionText: `Question`,
      studentAnswer,
      correctAnswer: "",
      isCorrect: false,
      marksAwarded: 0,
      totalMarks: 0,
    };
  });
}

function stringifyAnswer(answer: unknown): string {
  if (answer == null) return "";
  if (Array.isArray(answer)) return answer.join(", ");
  return String(answer);
}
