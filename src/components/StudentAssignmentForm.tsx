"use client";

import { useState, useTransition } from "react";
import { Question, GradedAnswer } from "@/lib/questions";
import { api } from "@/lib/api";
import {
  CheckCircleIcon,
  XCircleIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";

interface StudentAssignmentFormProps {
  assignment: {
    id: string;
    title: string;
    totalMarks: number;
    questions: Omit<Question, "correctAnswer">[];
  };
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
  const [result, setResult] = useState<{
    success: boolean;
    score: number;
    totalMarks: number;
    feedback?: GradedAnswer[];
  } | null>(null);
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
  const progressPercent = totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0;

  /* ── Results View ── */
  if (result) {
    return (
      <div className="p-4 sm:p-6 md:p-8 text-center">
        {/* Success icon */}
        <div className="w-16 h-16 rounded-full bg-success-container text-success flex items-center justify-center mx-auto mb-5">
          <CheckIcon className="w-8 h-8" strokeWidth={2} />
        </div>
        <h2 className="text-display-sm mb-2">Assignment Submitted!</h2>
        <p className="text-body-md text-on-surface-variant mb-8">
          Thank you, {identity?.name}. Your responses have been recorded.
        </p>

        {/* Score card */}
        <div className="card-static max-w-sm mx-auto mb-8 text-center">
          <p className="text-label-sm text-on-surface-variant mb-2">
            Your Score
          </p>
          <p className="text-display-lg tracking-tight">
            <span className="text-primary">
              {result.score}
            </span>
            <span className="text-xl text-on-surface-variant ml-2">
              / {result.totalMarks}
            </span>
          </p>
        </div>

        {/* Feedback */}
        {result.feedback && result.feedback.length > 0 && (
          <div className="max-w-xl mx-auto text-left">
            <h3 className="text-headline-md mb-4">Answer Feedback</h3>
            <div className="flex flex-col gap-3">
              {result.feedback.map((f: GradedAnswer, i: number) => (
                <div
                  key={f.questionId}
                  className={`p-4 rounded-md ${
                    f.isCorrect
                      ? "bg-success-container"
                      : "bg-error-container"
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-semibold text-on-surface text-sm">
                      Question {i + 1}
                    </span>
                    {f.isCorrect ? (
                      <span className="flex items-center gap-1 text-success font-semibold text-[0.8125rem]">
                        <CheckCircleIcon className="w-4 h-4" />
                        Correct ({f.marksAwarded} Marks)
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-error font-semibold text-[0.8125rem]">
                        <XCircleIcon className="w-4 h-4" />
                        Incorrect (0 Marks)
                      </span>
                    )}
                  </div>
                  <p className="text-on-surface text-sm mb-3 leading-relaxed">
                    {f.questionText}
                  </p>
                  <div className="text-[0.8125rem] flex flex-col gap-1">
                    <div>
                      <span className="text-on-surface-variant">
                        Your Answer:
                      </span>{" "}
                      <span className="font-medium text-on-surface">
                        {f.studentAnswer}
                      </span>
                    </div>
                    {!f.isCorrect && (
                      <div>
                        <span className="text-on-surface-variant">
                          Correct Answer:
                        </span>{" "}
                        <span className="font-medium text-success">
                          {Array.isArray(f.correctAnswer)
                            ? f.correctAnswer.join(" or ")
                            : f.correctAnswer}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  /* ── Identity Form (Welcome Stage) ── */
  if (!identity) {
    return (
      <div className="p-4 sm:p-6 md:px-8 md:py-6">
        <div className="max-w-sm mx-auto">
          <h2 className="text-headline-md text-center mb-6">
            Enter your details to start
          </h2>
          {error && (
            <div className="mb-5 p-3 bg-error-container text-error rounded-sm text-[0.8125rem] text-center">
              {error}
            </div>
          )}
          <form
            onSubmit={handleIdentitySubmit}
            className="flex flex-col gap-5"
          >
            <div>
              <label className="text-label-md block text-on-surface-variant mb-1.5">
                Full Name
              </label>
              <input
                name="name"
                required
                placeholder="e.g. Aarav Patel"
                className="input-academic"
              />
            </div>
            <div>
              <label className="text-label-md block text-on-surface-variant mb-1.5">
                Student ID / Roll Number
              </label>
              <input
                name="rollNumber"
                required
                placeholder="e.g. 101"
                className="input-academic"
              />
            </div>
            <button
              type="submit"
              className="btn-primary w-full py-3"
            >
              Start Assignment
            </button>
          </form>
        </div>
      </div>
    );
  }

  /* ── Question Form (Progress Stage) ── */
  return (
    <div className="p-4 sm:p-6 md:px-8 md:py-6">
      {/* Student info + progress summary */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-6 pb-4">
        <div>
          <span className="text-label-sm text-on-surface-variant">
            Student
          </span>
          <p className="font-medium text-on-surface text-sm">
            {identity.name} ({identity.rollNumber})
          </p>
        </div>
        <div className="sm:text-right">
          <span className="text-label-sm text-on-surface-variant">
            Progress
          </span>
          <p className="font-medium text-primary text-sm">
            {answeredCount} / {totalQuestions} Answered
          </p>
        </div>
      </div>

      {/* Progress track */}
      <div className="progress-track mb-6">
        <div
          className="progress-indicator"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Questions */}
      <div className="flex flex-col gap-4 sm:gap-6">
        {assignment.questions.map((q, index) => (
          <div
            key={q.id}
            className="bg-surface-container-low rounded-md p-4 sm:p-5"
          >
            <div className="flex justify-between items-start mb-4">
              <span className="text-label-sm text-on-surface-variant">
                Question {index + 1}
              </span>
              <span className="badge">{q.marks} Marks</span>
            </div>
            <p className="text-base font-medium text-on-surface mb-4 leading-relaxed">
              {q.text}
            </p>

            {q.options &&
            (q.type === "MCQ" || q.type === "TRUE_FALSE") ? (
              <div className="flex flex-col gap-2">
                {q.options.map((opt, i) => {
                  const isSelected = answers[q.id] === opt;
                  return (
                    <label
                      key={i}
                      className={`flex items-center p-3 rounded-sm cursor-pointer transition-all duration-100 ${
                        isSelected
                          ? "bg-primary-container border-[1.5px] border-primary"
                          : "bg-surface-container-lowest border border-outline-variant/15"
                      }`}
                    >
                      <input
                        type="radio"
                        name={`question-${q.id}`}
                        value={opt}
                        checked={isSelected}
                        onChange={() => handleAnswerChange(q.id, opt)}
                        className="w-4 h-4 accent-primary"
                      />
                      <span className="ml-3 text-on-surface text-sm">
                        {opt}
                      </span>
                    </label>
                  );
                })}
              </div>
            ) : (
              <div>
                <input
                  type="text"
                  value={answers[q.id] || ""}
                  onChange={(e) =>
                    handleAnswerChange(q.id, e.target.value)
                  }
                  placeholder="Type your answer here..."
                  className="input-academic"
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="mt-6 p-3 bg-error-container text-error rounded-sm text-[0.8125rem] text-center">
          {error}
        </div>
      )}

      {/* Submit Button */}
      <div className="flex justify-end mt-8 pt-5">
        <button
          onClick={handleSubmitAssignment}
          disabled={isPending}
          className="btn-primary px-8 py-3 text-base font-semibold"
        >
          {isPending ? "Submitting…" : "Submit Assignment"}
        </button>
      </div>
    </div>
  );
}
