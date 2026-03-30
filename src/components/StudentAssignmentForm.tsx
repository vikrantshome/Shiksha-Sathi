"use client";

import { useState, useTransition } from "react";
import { api } from "@/lib/api";
import type { AssignmentByLinkResponse, SubmitAssignmentResponse } from "@/lib/api/types";

/* ─────────────────────────────────────────────────────────
   Student Assignment Form — Stitch-Directed Redesign
   Design Source: 
     - identity_entry/code.html  → Identity stage
     - assignment_taking/code.html → Assessment stage  
     - results/code.html → Results stage
   All three views implement Digital Atelier tokens.
   ───────────────────────────────────────────────────────── */

interface StudentAssignmentFormProps {
  assignment: AssignmentByLinkResponse;
}

export default function StudentAssignmentForm({
  assignment,
}: StudentAssignmentFormProps) {
  const [identity, setIdentity] = useState<{
    name: string;
    rollNumber: string;
  } | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<SubmitAssignmentResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleIdentitySubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setIdentity({
      name: formData.get("name") as string,
      rollNumber: formData.get("rollNumber") as string,
    });
    setError(null);
  };

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

  const answeredCount = Object.keys(answers).length;
  const totalQuestions = assignment.questions.length;
  const progressPercent =
    totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0;

  /* ════════════════════════════════════════════════════════
     STAGE 3: Results View — Stitch "results" direction
     Digital Atelier design tokens via Tailwind CSS
     ════════════════════════════════════════════════════════ */
  if (result) {
    const scorePercent = result.totalMarks > 0
      ? Math.round((result.score / result.totalMarks) * 100)
      : 0;

    return (
      <div className="w-full max-w-4xl mx-auto px-4 md:px-0 py-12 md:py-16">
        {/* Success Confirmation */}
        <div className="flex flex-col items-center justify-center mb-14 text-center">
          <div className="w-16 h-16 bg-primary-container rounded-full flex items-center justify-center mb-6">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h2 className="font-headline text-on-surface-variant text-sm tracking-[0.05em] font-semibold mb-2 uppercase">
            Submission Confirmed
          </h2>
          <h1 className="font-headline text-3xl font-extrabold text-on-surface tracking-tight">
            Assignment Submitted Successfully
          </h1>
        </div>

        {/* Score Display — Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-14">
          {/* Main Score Card */}
          <div className="md:col-span-8 bg-surface-container-lowest p-10 rounded-xl flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-primary" />
            <span className="font-label text-xs font-bold text-on-surface-variant tracking-widest mb-4 uppercase">
              Total Performance
            </span>
            <div className="flex items-baseline gap-3">
              <span className="text-8xl font-headline font-extrabold text-primary tracking-tighter leading-none">
                {result.score}
              </span>
              <span className="text-4xl font-headline font-bold text-outline-variant">
                / {result.totalMarks}
              </span>
            </div>
            <p className="mt-6 text-on-surface-variant font-medium text-center max-w-xs text-sm">
              {scorePercent >= 80
                ? `Excellent work, ${identity?.name}! You've demonstrated a strong grasp of the material.`
                : scorePercent >= 50
                ? `Good effort, ${identity?.name}. Review the feedback below to improve.`
                : `Keep studying, ${identity?.name}. Review the detailed feedback for guidance.`}
            </p>
          </div>

          {/* Stats Sidebar */}
          <div className="md:col-span-4 flex flex-col gap-6">
            <div className="bg-surface-container-low p-6 rounded-xl flex-1">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary mb-3">
                <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
              </svg>
              <div className="text-2xl font-headline font-bold text-on-surface">
                {totalQuestions}
              </div>
              <div className="text-xs font-label text-on-surface-variant uppercase tracking-wider">
                Total Questions
              </div>
            </div>
            <div className="bg-primary text-on-primary p-6 rounded-xl flex-1">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-3">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" />
              </svg>
              <div className="text-2xl font-headline font-bold">
                {scorePercent}%
              </div>
              <div className="text-xs font-label opacity-80 uppercase tracking-wider">
                Score Rate
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Feedback */}
        {result.feedback && result.feedback.length > 0 && (
          <section className="space-y-12">
            <div className="flex items-center justify-between border-b border-surface-container pb-4">
              <h3 className="font-headline text-xl font-bold text-on-surface tracking-tight">
                Detailed Feedback
              </h3>
              <div className="flex gap-4">
                <div className="flex items-center gap-2 text-xs font-medium text-on-surface-variant">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" /> Correct
                </div>
                <div className="flex items-center gap-2 text-xs font-medium text-on-surface-variant">
                  <div className="w-2 h-2 rounded-full bg-error" /> Incorrect
                </div>
              </div>
            </div>

            <div className="space-y-10">
              {result.feedback.map((f, i: number) => (
                <div key={f.questionId} className="group">
                  <div className="flex flex-col md:flex-row md:items-start gap-6">
                    {/* Question Number */}
                    <div className="flex-shrink-0 w-8 h-8 rounded-sm bg-surface-container flex items-center justify-center font-headline font-bold text-primary text-sm">
                      {String(i + 1).padStart(2, "0")}
                    </div>
                    <div className="flex-1 space-y-4">
                      <div className="flex items-start justify-between gap-4">
                        <h4 className="font-body text-base font-medium text-on-surface leading-relaxed">
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
                        <div className="bg-surface-container-low p-4 rounded-sm border-l-2 border-emerald-500">
                          <div className="text-[0.6875rem] text-on-surface-variant font-bold tracking-widest mb-1 uppercase">
                            Your Answer
                          </div>
                          <div className="text-emerald-700 font-medium">
                            {f.studentAnswer}
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-surface-container-low p-4 rounded-sm border-l-2 border-error">
                            <div className="text-[0.6875rem] text-on-surface-variant font-bold tracking-widest mb-1 uppercase">
                              Your Answer
                            </div>
                            <div className="text-error font-medium line-through">
                              {f.studentAnswer}
                            </div>
                          </div>
                          <div className="bg-emerald-50 p-4 rounded-sm border-l-2 border-emerald-500">
                            <div className="text-[0.6875rem] text-emerald-700 font-bold tracking-widest mb-1 uppercase">
                              Correct Answer
                            </div>
                            <div className="text-emerald-700 font-medium">
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
        <div className="mt-16 pt-8 border-t border-surface-container flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <div className="text-sm font-bold text-on-surface">{identity?.name}</div>
            <div className="text-xs text-on-surface-variant">Roll No: {identity?.rollNumber}</div>
          </div>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-6 py-2.5 text-primary font-bold text-sm bg-primary-container/20 rounded-sm hover:bg-primary-container/40 transition-all duration-200"
            >
              Retake
            </button>
            <button
              type="button"
              onClick={() => (window.location.href = "/")}
              className="px-8 py-2.5 bg-primary text-on-primary font-bold text-sm rounded-sm shadow-sm hover:brightness-110 active:scale-[0.98] transition-all duration-200"
            >
              Return to Dashboard
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
      <div className="flex items-center justify-center min-h-[60vh] px-4">
        {/* Identity Entry Card */}
        <div className="relative w-full max-w-lg">
          {/* Subtle Card Backdrop */}
          <div className="absolute -inset-1 bg-gradient-to-tr from-primary/5 to-transparent rounded-xl blur-lg opacity-50"></div>
          
          <div className="relative bg-surface-container-lowest border border-outline-variant/10 rounded-xl p-8 md:p-12 shadow-[0px_12px_32px_rgba(48,51,47,0.04)]">
            {/* Editorial Header */}
            <div className="mb-10 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-container/30 rounded-full mb-6 text-primary">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-on-surface font-headline tracking-tight mb-2">
                Enter your details to start
              </h2>
              <p className="text-on-surface-variant text-sm leading-relaxed max-w-xs mx-auto">
                Please provide your institutional identity to begin the assessment module.
              </p>
            </div>

            {error && (
              <div className="mb-5 p-3 bg-error/10 text-error text-[0.8125rem] text-center rounded-md">
                {error}
              </div>
            )}

            <form onSubmit={handleIdentitySubmit} className="space-y-8">
              {/* Full Name */}
              <div className="group relative">
                <label
                  htmlFor="student-name"
                  className="block text-[0.6875rem] font-bold uppercase tracking-[0.05em] text-on-surface-variant mb-2 group-focus-within:text-primary transition-colors"
                >
                  Full Name
                </label>
                <input
                  id="student-name"
                  name="name"
                  required
                  placeholder="e.g. Aarav Patel"
                  type="text"
                  className="w-full bg-surface-container-low border-b border-outline-variant/20 border-t-0 border-l-0 border-r-0 px-0 py-3 text-on-surface placeholder:text-outline-variant focus:ring-0 focus:border-primary focus:border-b-2 transition-all duration-300 font-body text-base"
                />
              </div>

              {/* Roll Number */}
              <div className="group relative">
                <label
                  htmlFor="student-roll"
                  className="block text-[0.6875rem] font-bold uppercase tracking-[0.05em] text-on-surface-variant mb-2 group-focus-within:text-primary transition-colors"
                >
                  Roll Number
                </label>
                <input
                  id="student-roll"
                  name="rollNumber"
                  required
                  placeholder="Enter your unique ID"
                  type="text"
                  className="w-full bg-surface-container-low border-b border-outline-variant/20 border-t-0 border-l-0 border-r-0 px-0 py-3 text-on-surface placeholder:text-outline-variant focus:ring-0 focus:border-primary focus:border-b-2 transition-all duration-300 font-body text-base"
                />
              </div>

              {/* Submit */}
              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full bg-gradient-to-br from-primary to-primary-dim text-on-primary py-4 px-6 rounded-lg font-bold tracking-wide shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  <span>Start Assignment</span>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                  </svg>
                </button>

                <div className="mt-6 flex items-center justify-center space-x-4 opacity-60">
                  <div className="flex items-center space-x-1">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                    <span className="text-[0.6875rem] font-medium uppercase tracking-wider">
                      Assessment
                    </span>
                  </div>
                  <div className="w-1 h-1 rounded-full bg-outline-variant" />
                  <div className="flex items-center space-x-1">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18" /></svg>
                    <span className="text-[0.6875rem] font-medium uppercase tracking-wider">
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
     STAGE 2: Assessment Taking — Stitch "assignment_taking" direction
     ════════════════════════════════════════════════════════ */
  return (
    <div className="flex flex-col items-center px-4 md:px-0 py-8 md:py-12 w-full max-w-3xl mx-auto">
      {/* Header & Progress */}
      <div className="w-full mb-10 md:mb-12 text-center">
        <span className="text-xs font-bold tracking-widest text-primary uppercase mb-3 block">
          Ongoing Assessment
        </span>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tighter text-on-surface mb-4 opacity-90 font-headline">
          {assignment.title}
        </h1>
        {assignment.description && (
          <p className="text-on-surface-variant text-sm md:text-base mb-6 max-w-2xl mx-auto leading-relaxed">
            {assignment.description}
          </p>
        )}
        
        <div className="flex items-center justify-center gap-2 text-on-surface-variant text-sm bg-surface-container-low border border-outline-variant/20 py-2 px-4 rounded-full w-fit mx-auto mb-8">
          <span>Student: <span className="font-bold text-on-surface">{identity.name}</span></span>
        </div>

        {/* Progress Bar */}
        <div className="space-y-3">
          <div className="flex justify-between items-end mb-1">
            <span className="font-label text-xs md:text-sm text-on-secondary-container tracking-widest uppercase font-bold">Progress</span>
            <span className="font-label text-xs md:text-sm text-primary font-bold">{answeredCount} of {totalQuestions} answered</span>
          </div>
          <div className="h-2 w-full bg-secondary-container rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary rounded-full transition-all duration-500 ease-out" 
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>
      </div>

      <section className="w-full space-y-8">
        {assignment.questions.map((q, index) => (
          <article 
            key={q.id} 
            className="w-full bg-surface-container-lowest rounded-xl shadow-[0_8px_32px_rgba(28,28,25,0.06)] overflow-hidden border border-outline-variant/15"
          >
            {/* Card Header Strip */}
            <div className="bg-surface-container-high px-6 md:px-8 py-4 flex justify-between items-center">
              <span className="text-xs font-bold uppercase tracking-widest text-on-secondary-container">
                Question {String(index + 1).padStart(2, "0")}
              </span>
              <span className="text-xs font-bold uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full">
                {q.points} Marks
              </span>
            </div>
            
            <div className="p-6 md:p-8 lg:p-10">
              <h2 className="text-xl md:text-2xl font-bold leading-tight text-on-surface mb-8 font-headline">
                {q.text}
              </h2>

              {q.options && (q.type === "MCQ" || q.type === "TRUE_FALSE") ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {q.options.map((opt, i) => {
                    const isSelected = answers[q.id] === opt;
                    return (
                      <label 
                        key={i} 
                        className={`group relative flex items-center p-4 md:p-5 rounded-lg border transition-all cursor-pointer ${
                          isSelected 
                            ? 'border-primary bg-primary/5' 
                            : 'border-outline-variant/20 bg-surface hover:bg-surface-container-low'
                        }`}
                      >
                        <input
                          type="radio"
                          name={`question-${q.id}`}
                          value={opt}
                          checked={isSelected}
                          onChange={() => handleAnswerChange(q.id, opt)}
                          className="sr-only peer"
                        />
                        <div className={`w-5 h-5 md:w-6 md:h-6 rounded-full border-2 flex items-center justify-center mr-4 transition-colors shrink-0 ${
                          isSelected 
                            ? 'border-primary bg-primary' 
                            : 'border-outline-variant'
                        }`}>
                          <div className={`w-2 h-2 bg-white rounded-full transition-opacity ${
                            isSelected ? 'opacity-100' : 'opacity-0'
                          }`}></div>
                        </div>
                        <span className={`text-base md:text-lg transition-colors ${
                          isSelected 
                            ? 'font-bold text-primary' 
                            : 'font-medium text-on-surface-variant group-hover:text-on-surface'
                        }`}>
                          {String.fromCharCode(65 + i)}) {opt}
                        </span>
                      </label>
                    );
                  })}
                </div>
              ) : (
                <div className="w-full md:max-w-xl">
                  <input
                    type="text"
                    value={answers[q.id] || ""}
                    onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                    placeholder="Type your answer here..."
                    className="w-full bg-surface-container-low border-b-2 border-outline-variant/30 border-t-0 border-l-0 border-r-0 px-4 py-3 text-on-surface placeholder:text-outline-variant focus:ring-0 focus:border-primary transition-all duration-300 font-body text-base"
                  />
                  <p className="mt-3 text-[0.6875rem] text-on-surface-variant italic">
                    Enter a single word or a short phrase.
                  </p>
                </div>
              )}
            </div>
          </article>
        ))}
      </section>

      {error && (
        <div className="mt-8 p-4 bg-error/10 text-error text-sm text-center rounded-md font-medium w-full">
          {error}
        </div>
      )}

      {/* Submit Section */}
      <div className="mt-12 pt-8 w-full border-t border-outline-variant/15 flex flex-col items-center">
        <p className="text-on-surface-variant text-xs md:text-sm mb-6 flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary/70">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
          <span className="font-medium">Please review all answers before final submission.</span>
        </p>
        <button
          type="button"
          onClick={handleSubmitAssignment}
          disabled={isPending}
          className="bg-gradient-to-tr from-primary to-primary-dim text-on-primary px-10 md:px-14 py-4 rounded-lg font-bold tracking-[0.05em] text-sm md:text-base flex items-center gap-3 shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-wait"
        >
          {isPending ? "Submitting…" : "Submit Assignment"}
          {!isPending && (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
