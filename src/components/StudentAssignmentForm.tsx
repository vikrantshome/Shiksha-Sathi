"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import { api } from "@/lib/api";
import { trackEvent } from "@/lib/analytics";
import type { AssignmentByLinkResponse, SubmitAssignmentResponse, User } from "@/lib/api/types";
import Loader from "@/components/Loader";

/* ─────────────────────────────────────────────────────────
   Student Assignment Form — Authenticated Users Only
   Students must be logged in to access assignments.
   Identity is fetched from the authenticated user profile.
   ───────────────────────────────────────────────────────── */

interface StudentAssignmentFormProps {
  assignment: AssignmentByLinkResponse;
  onProgressChange?: (answered: number) => void;
}

type GradingStep = "submitting" | "grading" | "calculating" | "complete";

export default function StudentAssignmentForm({
  assignment,
  onProgressChange,
}: StudentAssignmentFormProps) {
  const [user, setUser] = useState<User | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<SubmitAssignmentResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [existingSubmission, setExistingSubmission] = useState<SubmitAssignmentResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [gradingStep, setGradingStep] = useState<GradingStep>("submitting");

  // Grading progress animation
  useEffect(() => {
    if (!isPending) {
      setGradingStep("complete");
      return;
    }
    
    const steps: GradingStep[] = ["submitting", "grading", "calculating"];
    let stepIndex = 0;
    
    const interval = setInterval(() => {
      stepIndex = (stepIndex + 1) % steps.length;
      setGradingStep(steps[stepIndex]);
    }, 1500);
    
    return () => clearInterval(interval);
  }, [isPending]);

  // ... rest of the code stays the same

  // Fetch authenticated user profile
  useEffect(() => {
    let cancelled = false;
    async function loadUser() {
      try {
        const userData = await api.auth.getMe();
        if (!cancelled) setUser(userData);
      } catch {
        if (!cancelled) setError("Failed to load your profile. Please log in again.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadUser();
    return () => { cancelled = true; };
  }, []);

  // Check for existing submission
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    async function check() {
      try {
        const submissions = await api.students.getSubmissions(user!.rollNumber || user!.id);
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
        // Silently ignore
      }
    }
    check();
    return () => { cancelled = true; };
  }, [user, assignment.id]);

  // Notify parent of progress changes
  const prevCountRef = useRef(0);
  useEffect(() => {
    const count = Object.keys(answers).length;
    if (onProgressChange && count !== prevCountRef.current) {
      prevCountRef.current = count;
      onProgressChange(count);
    }
  }, [answers, onProgressChange]);

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmitAssignment = () => {
    if (!user) {
      setError("Please log in to submit your assignment.");
      return;
    }

    setError(null);
    startTransition(async () => {
      try {
        const res = await api.assignments.submitAssignment(
          assignment.id,
          user.name,
          user.rollNumber || user.id,
          user.school || "",
          user.studentClass || "",
          user.section || "",
          answers
        );
        trackEvent("assignment_submitted", {
          assignmentId: assignment.id,
          studentId: user.rollNumber || user.id,
          totalQuestions: Object.keys(answers).length,
        });
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

  /* ── Loading State ── */
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader size="lg" label="Loading assignment..." />
      </div>
    );
  }

  /* ════════════════════════════════════════════════════════
     ALREADY SUBMITTED — show results link
     ════════════════════════════════════════════════════════ */
  if (existingSubmission) {
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
     STAGE 3: Results View
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

        {/* Score Display */}
        <div className="grid grid-cols-1 gap-4 mb-10 md:grid-cols-12 md:gap-6 md:mb-14">
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
                ? `Excellent work, ${user?.name}! You've demonstrated a strong grasp of the material.`
                : scorePercent >= 50
                ? `Good effort, ${user?.name}. Review the feedback below to improve.`
                : `Keep studying, ${user?.name}. Review the detailed feedback for guidance.`}
            </p>
          </div>
        </div>

        {/* Detailed Feedback */}
        {result.feedback && result.feedback.length > 0 && (
          <div className="space-y-6 mb-12">
            <h3 className="text-lg font-bold text-on-surface mb-4">Detailed Results</h3>
            {result.feedback.map((f, i) => (
              <div 
                key={f.questionId} 
                className="p-5 md:p-6 rounded-xl border border-outline-variant bg-surface-container-lowest"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex gap-3">
                    <span className="text-sm font-bold text-outline-variant">{String(i + 1).padStart(2, '0')}</span>
                    <p className="text-sm font-medium text-on-surface">{f.questionText}</p>
                  </div>
                  <span className={`text-[0.625rem] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${f.isCorrect ? 'bg-success-container text-on-success-container' : 'bg-error-container text-on-error-container'}`}>
                    {f.marksAwarded} / {assignment.questions.find(q => q.id === f.questionId)?.points || 1}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-8">
                  <div>
                    <span className="text-[0.625rem] font-bold text-on-surface-variant uppercase tracking-widest block mb-1">Your Answer</span>
                    <p className={`text-sm ${f.isCorrect ? 'text-success' : 'text-error'} font-medium`}>{f.studentAnswer || '(Empty)'}</p>
                  </div>
                  {!f.isCorrect && (
                    <div>
                      <span className="text-[0.625rem] font-bold text-on-surface-variant uppercase tracking-widest block mb-1">Correct Answer</span>
                      <p className="text-sm text-on-surface font-medium">{Array.isArray(f.correctAnswer) ? f.correctAnswer.join(', ') : f.correctAnswer}</p>
                    </div>
                  )}
                </div>

                {f.reasoning && (
                  <div className="mt-4 pl-8 pt-4 border-t border-outline-variant/30">
                    <span className="text-[0.625rem] font-bold text-on-surface-variant uppercase tracking-widest block mb-1">Feedback</span>
                    <p className="text-xs text-on-surface-variant leading-relaxed italic">{f.reasoning}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-center">
          <a
            href="/student/dashboard"
            className="inline-flex items-center gap-2 px-8 py-3 bg-primary text-on-primary rounded-lg text-sm font-bold no-underline hover:brightness-110 transition-all"
          >
            Go to Dashboard
          </a>
        </div>
      </div>
    );
  }

  /* ════════════════════════════════════════════════════════
     STAGE 2: Assessment Taking
     ════════════════════════════════════════════════════════ */
  return (
    <section className="space-y-6">
      {assignment.questions.map((q, index) => (
        <article
          key={q.id}
          className={`p-6 md:p-8 rounded-2xl border transition-all duration-300 hover:shadow-md animate-in fade-in slide-in-from-bottom-2 ${
            isPending ? "opacity-50 pointer-events-none grayscale" : "opacity-100"
          }`}
          style={{ 
            background: "var(--color-surface-container-lowest)",
            borderColor: "var(--color-outline-variant)",
          }}
        >
          <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-8">
            <div className="flex gap-5 items-start">
              <span 
                className="w-10 h-10 shrink-0 flex items-center justify-center rounded-full text-sm font-bold shadow-sm"
                style={{ background: "var(--color-primary-container)", color: "var(--color-on-primary-container)" }}
              >
                {index + 1}
              </span>
              <h2 className="text-lg font-medium leading-relaxed pt-1" style={{ color: "var(--color-on-surface)" }}>
                {q.text}
              </h2>
            </div>
            <span 
              className="text-[0.7rem] font-black uppercase tracking-widest px-4 py-1.5 rounded-lg shrink-0" 
              style={{ background: "var(--color-surface-container-high)", color: "var(--color-on-surface-variant)" }}
            >
              {q.points || 1} Points
            </span>
          </div>

          <div className="md:pl-[3.75rem]">
            {q.options && (q.type === "MCQ" || q.type === "TRUE_FALSE") ? (
              <div className="grid grid-cols-1 gap-3 max-w-2xl">
                {q.options.map((opt, i) => {
                  const isSelected = answers[q.id] === opt;
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleAnswerChange(q.id, opt)}
                      className="group flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-200 text-left active:scale-[0.98]"
                      style={{
                        background: isSelected ? "var(--color-primary-container)" : "var(--color-surface)",
                        borderColor: isSelected ? "var(--color-primary)" : "var(--color-outline-variant)",
                      }}
                    >
                      <div className="relative flex items-center justify-center">
                        <div 
                          className="w-6 h-6 rounded-full border-2 transition-all group-hover:border-primary"
                          style={{ borderColor: isSelected ? "var(--color-primary)" : "var(--color-outline)" }}
                        >
                          {isSelected && (
                            <div 
                              className="absolute inset-1 rounded-full animate-in zoom-in-50 duration-200"
                              style={{ background: "var(--color-primary)" }}
                            />
                          )}
                        </div>
                      </div>
                      <span className="text-base flex-1" style={{
                        color: isSelected ? "var(--color-on-primary-container)" : "var(--color-on-surface)",
                        fontWeight: isSelected ? 600 : 400,
                      }}>
                        {opt}
                      </span>
                      <span className="text-[0.65rem] opacity-40 font-bold uppercase tracking-tighter self-center">Option {String.fromCharCode(65 + i)}</span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="max-w-xl group">
                <div 
                  className="relative rounded-t-lg transition-all border-b-2 overflow-hidden"
                  style={{ 
                    background: "var(--color-surface-container-low)",
                    borderColor: "var(--color-outline)" 
                  }}
                >
                  <label className="absolute left-4 top-2 text-[0.65rem] font-bold uppercase tracking-wider opacity-60" style={{ color: "var(--color-primary)" }}>
                    Your Response
                  </label>
                  <input
                    type="text"
                    value={answers[q.id] || ""}
                    onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                    placeholder="Provide your answer..."
                    className="w-full bg-transparent pt-7 pb-3 px-4 text-base focus:ring-0 border-none placeholder:opacity-30 transition-colors"
                    style={{ color: "var(--color-on-surface)" }}
                  />
                  <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-primary transition-all duration-300 group-focus-within:w-full" style={{ background: "var(--color-primary)" }} />
                </div>
                <p className="mt-2 text-xs flex items-center gap-1.5 opacity-70" style={{ color: "var(--color-on-surface-variant)" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                  Short answer preferred.
                </p>
              </div>
            )}
          </div>
        </article>
      ))}

      {/* Submit */}
      <div className="mt-12 pt-8 flex flex-col items-center" style={{ borderTop: "1px solid var(--color-outline-variant)" }}>
        {error && (
          <div className="mb-4 px-4 py-2 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {error}
          </div>
        )}
        <p className="text-xs mb-6 flex items-center gap-2" style={{ color: "var(--color-on-surface-variant)" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--color-primary)" }}>
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
            background: "var(--color-primary-container)",
            color: "var(--color-on-primary-container)",
          }}
        >
          {isPending ? (
            <Loader size="sm" color="currentColor" label="Grading Submission…" />
          ) : (
            <>
              Submit Assignment
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </>
          )}
        </button>
      </div>

      {/* ═══ Grading Overlay ═══ */}
      {isPending && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div 
            className="absolute inset-0 animate-fade-in"
            style={{ 
              backgroundColor: "rgba(18, 66, 63, 0.85)",
              backdropFilter: "blur(8px)",
            }} 
          />
          <div className="relative z-10 animate-scale-in bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4 text-center">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="w-20 h-20 border-4 border-gray-200 rounded-full" />
                <div 
                  className="absolute top-0 left-0 w-20 h-20 border-4 border-[#12423f] rounded-full border-t-transparent animate-spin" 
                  style={{ animationDuration: "1s" }}
                />
              </div>
            </div>
            <h3 className="text-xl font-bold text-[#12423f] mb-2">
              {gradingStep === "submitting" && "Submitting your answers..."}
              {gradingStep === "grading" && "Grading your responses..."}
              {gradingStep === "calculating" && "Calculating results..."}
              {gradingStep === "complete" && "Almost done!"}
            </h3>
            <p className="text-sm text-gray-500">
              {gradingStep === "submitting" && "Please wait while we process your submission"}
              {gradingStep === "grading" && "Our AI is evaluating your answers"}
              {gradingStep === "calculating" && "Computing your score and feedback"}
              {gradingStep === "complete" && "Preparing your results"}
            </p>
            <div className="mt-6 flex justify-center gap-1.5">
              <span className={`w-2 h-2 rounded-full bg-[#12423f] ${gradingStep === "submitting" ? "opacity-100" : "opacity-30"}`} style={{ animation: "pulse 1.5s infinite" }} />
              <span className={`w-2 h-2 rounded-full bg-[#12423f] ${gradingStep === "grading" ? "opacity-100" : "opacity-30"}`} style={{ animation: "pulse 1.5s infinite 0.2s" }} />
              <span className={`w-2 h-2 rounded-full bg-[#12423f] ${gradingStep === "calculating" ? "opacity-100" : "opacity-30"}`} style={{ animation: "pulse 1.5s infinite 0.4s" }} />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
