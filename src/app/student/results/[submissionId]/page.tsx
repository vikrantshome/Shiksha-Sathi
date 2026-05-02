"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { fetchApi } from "@/lib/api/client";
import { api } from "@/lib/api";
import type { SubmissionDTO, QuestionFeedbackDTO } from "@/lib/api/types";
import Loader from "@/components/Loader";

/* ─────────────────────────────────────────────────────────
   Student Results Page — Handles both Assignments and Quizzes
   ───────────────────────────────────────────────────────── */

interface ResultData {
  type: "assignment" | "quiz";
  title: string;
  feedback: QuestionFeedbackDTO[];
  score: number;
  totalMarks: number;
  scorePercent: number;
  studentName: string;
  studentRoll: string;
  submittedAt: string;
  status: string;
}

export default function StudentResultsPage({
  params,
}: {
  params: Promise<{ submissionId: string }>;
}) {
  const router = useRouter();
  const [result, setResult] = useState<ResultData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRegrading, setIsRegrading] = useState(false);

  // Load result data from backend (handles both assignments and quizzes)
  useEffect(() => {
    let cancelled = false;

    async function load() {
      const resolvedParams = await params;

      setLoading(true);
      setError(null);

      try {
        // First try assignment submission endpoint
        let data: SubmissionDTO | Record<string, unknown> | null = null;
        let type: "assignment" | "quiz" = "assignment";
        
        try {
          data = await fetchApi<SubmissionDTO>(
            `/submissions/${resolvedParams.submissionId}`,
            { method: "GET" }
          );
        } catch (e: unknown) {
          const err = e as { status?: number };
          if (err.status === 404) {
            // Try quiz attempt endpoint
            data = await fetchApi<Record<string, unknown>>(
              `/quiz-attempts/${resolvedParams.submissionId}`,
              { method: "GET" }
            );
            type = "quiz";
          } else {
            throw e;
          }
        }

        if (cancelled) return;

        if (!data) {
          setError("Results not found.");
          setLoading(false);
          return;
        }

        let feedback: QuestionFeedbackDTO[] = [];
        let title = "Assignment";
        let studentName = (data as Record<string, unknown>).studentName as string || "Student";
        let studentRoll = (data as Record<string, unknown>).studentRollNumber as string || "N/A";
        let submittedAt = (data as Record<string, unknown>).submittedAt as string || "";
        let status = (data as Record<string, unknown>).status as string || "SUBMITTED";
        
        if (type === "quiz") {
          const quizData = data as Record<string, unknown>;
          feedback = (quizData.feedback as QuestionFeedbackDTO[]) || [];
          title = (quizData.quizTitle as string) || "Quiz";
          // For quiz, we may not have student info in the same format
          studentName = (quizData.studentName as string) || "Student";
          studentRoll = (quizData.studentId as string) || "N/A";
          submittedAt = (quizData.submittedAt as string) || "";
          status = quizData.submittedAt ? "COMPLETED" : "PENDING";
        } else {
          const submissionData = data as SubmissionDTO;
          feedback = submissionData.feedback || [];
          title = submissionData.assignmentTitle || "Assignment";
        }

        const totalMarks = (data as Record<string, unknown>).totalMarks as number ?? 0;
        const score = (data as Record<string, unknown>).score as number ?? 0;
        const scorePercent = totalMarks > 0 ? Math.round((score / totalMarks) * 100) : 0;

        setResult({
          type,
          title,
          feedback,
          score,
          totalMarks,
          scorePercent,
          studentName,
          studentRoll,
          submittedAt,
          status,
        });
      } catch (err: unknown) {
        if (cancelled) return;
        const apiError = err as { status?: number };
        if (apiError.status === 403 || apiError.status === 401) {
          router.replace("/student/login");
          return;
        }
        setError("Could not load your results. Please try again.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [params, router]);

  // Render loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader size="lg" label="Loading your results..." />
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <p className="text-sm text-error">{error}</p>
        <Link
          href="/student/dashboard"
          className="text-sm font-bold text-primary no-underline"
        >
          ← Back to Dashboard
        </Link>
      </div>
    );
  }

  // Render not found
  if (!result) return null;

  const isGraded = result.status === "GRADED" || result.status === "COMPLETED";
  const hasPendingAI = result?.feedback?.some(f => f.aiGradingFailed) ?? false;

  return (
    <div className="max-w-4xl mx-auto pb-12">
      {/* ═══ Header ══ */}
      <header className="mb-6 md:mb-8">
        <Link href="/student/dashboard" className="text-[0.6875rem] font-bold text-primary no-underline flex items-center gap-1 mb-4">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="rotate-180">
            <path d="m9 18 6-6-6-6" />
          </svg>
          Back to Dashboard
        </Link>
        <span className="block font-sans text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-primary mb-2">
          {result.type === "quiz" ? "Quiz Results" : isGraded ? "Results" : "Submission Details"}
        </span>
        <h1 className="font-manrope text-[clamp(1.25rem,3vw,1.75rem)] font-extrabold text-on-surface tracking-[-0.02em] leading-[1.2] m-0">
          {result.title}
        </h1>
        <p className="text-sm text-on-surface-variant mt-2">
          {result.submittedAt ? `Submitted on ${new Date(result.submittedAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}` : "Not submitted yet"}
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
                ? `Excellent work, ${result.studentName}! You've demonstrated a strong grasp of the material.`
                : result.scorePercent >= 50
                  ? `Good effort, ${result.studentName}. Review the feedback below to improve.`
                  : `Keep studying, ${result.studentName}. Review the detailed feedback for guidance.`}
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

      {/* Pending AI Review Warning */}
      {hasPendingAI && (
        <div className="mb-6 p-4 rounded-md bg-[var(--color-warning-container)]/30 border-l-4 border-[var(--color-warning)] flex items-start gap-3">
          <div className="mt-0.5 text-[var(--color-warning)]">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
              <path d="M12 9v4"/>
              <path d="M12 17h.01"/>
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-[var(--color-warning)] mb-2">
              Some answers are pending AI review
            </p>
            <p className="text-xs text-[var(--color-on-surface-variant)] mb-3">
              AI grading was temporarily unavailable. You can retry grading below for each affected question.
            </p>
            <button
              onClick={async () => {
                const resolvedParams = await params;
                setIsRegrading(true);
                try {
                  await api.assignments.regradeSubmission(resolvedParams.submissionId);
                  const data = await fetchApi<SubmissionDTO>(`/submissions/${resolvedParams.submissionId}`);
                  setResult({
                    type: "assignment",
                    title: data.assignmentTitle || "Assignment",
                    feedback: data.feedback || [],
                    score: data.score || 0,
                    totalMarks: data.totalMarks || 0,
                    scorePercent: data.totalMarks ? ((data.score || 0) / data.totalMarks) * 100 : 0,
                    studentName: data.studentName || "",
                    studentRoll: data.studentRollNumber || "",
                    submittedAt: data.submittedAt || "",
                    status: data.status || "",
                  });
                } catch (err) {
                  console.error("Failed to re-grade:", err);
                } finally {
                  setIsRegrading(false);
                }
              }}
              disabled={isRegrading}
              className="px-4 py-2 bg-[var(--color-primary-dim)] text-[var(--color-on-primary)] text-sm font-semibold rounded-sm hover:brightness-110 disabled:opacity-50 transition-all"
            >
              {isRegrading ? "Re-grading..." : "Retry AI Grading"}
            </button>
          </div>
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
                        {f.reasoning && (
                          <div className="mt-3 pt-3 border-t border-emerald-200">
                            <div className="text-[0.6875rem] text-on-surface-variant font-bold tracking-widest mb-1 uppercase">
                              AI Reasoning
                            </div>
                            <div className="text-sm text-emerald-700 italic">
                              {f.reasoning}
                            </div>
                          </div>
                        )}
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
                    {f.reasoning && !f.isCorrect && (
                      <div className="mt-2 p-3 rounded-sm bg-surface-container-low">
                        <div className="text-[0.6875rem] text-on-surface-variant font-bold tracking-widest mb-1 uppercase">
                          AI Reasoning
                        </div>
                        <div className="text-sm text-on-surface-variant italic">
                          {f.reasoning}
                        </div>
                      </div>
                    )}

                    {f.explanation && (
                      <div className="mt-3 p-4 rounded-sm bg-secondary-container/30 border-l-2 border-secondary">
                        <div className="text-[0.6875rem] text-secondary font-bold tracking-widest mb-1 uppercase">
                          Explanation
                        </div>
                        <div className="text-sm text-on-secondary-container leading-relaxed">
                          {f.explanation}
                        </div>
                      </div>
                    )}

                    {/* Per-question retry button for AI failures */}
                    {f.aiGradingFailed && (
                      <div className="mt-3 p-3 rounded-sm bg-[var(--color-warning-container)]/20 border border-[var(--color-warning)]/20">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-[var(--color-warning)] font-medium">
                            AI grading failed for this question
                          </span>
                          <button
                            onClick={async () => {
                              const resolvedParams = await params;
                              setIsRegrading(true);
                              try {
                                await api.assignments.regradeSubmission(resolvedParams.submissionId);
                                const data = await fetchApi<SubmissionDTO>(`/submissions/${resolvedParams.submissionId}`);
                                setResult({
                                  type: "assignment",
                                  title: data.assignmentTitle || "Assignment",
                                  feedback: data.feedback || [],
                                  score: data.score || 0,
                                  totalMarks: data.totalMarks || 0,
                                  scorePercent: data.totalMarks ? ((data.score || 0) / data.totalMarks) * 100 : 0,
                                  studentName: data.studentName || "",
                                  studentRoll: data.studentRollNumber || "",
                                  submittedAt: data.submittedAt || "",
                                  status: data.status || "",
                                });
                              } catch (err) {
                                console.error("Failed to re-grade:", err);
                              } finally {
                                setIsRegrading(false);
                              }
                            }}
                            disabled={isRegrading}
                            className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-primary)] hover:text-[var(--color-primary-dim)] disabled:opacity-50 transition-colors"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={isRegrading ? 'animate-spin' : ''}>
                              <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/>
                              <path d="M21 3v5h-5"/>
                            </svg>
                            {isRegrading ? 'Retrying...' : 'Retry AI Grading'}
                          </button>
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
          <div className="text-sm font-bold text-on-surface">{result.studentName}</div>
          <div className="text-xs text-on-surface-variant">Roll No: {result.studentRoll}</div>
        </div>
        <div className="flex gap-3 md:gap-4">
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
