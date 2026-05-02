"use client";

import { AssignmentSubmission, QuestionFeedback, Assignment } from "@/lib/api/types";
import { ArrowPathIcon, XMarkIcon } from "@heroicons/react/24/outline";

interface Props {
  student: AssignmentSubmission;
  assignment: Assignment;
  onClose: () => void;
  onGradeUpdate: (studentId: string, questionId: string, value: unknown) => void;
  onRegrade: (submissionId: string) => Promise<void>;
  regrading?: boolean;
}

export default function StudentDetailPanel({ 
  student, 
  assignment, 
  onClose, 
  onGradeUpdate, 
  onRegrade,
  regrading = false
}: Props) {
  return (
    <div className="rounded-md bg-[var(--color-surface-container-lowest)] overflow-hidden">
      {/* Header */}
      <div className="px-5 py-3 bg-[var(--color-surface-container-low)] flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold tracking-tight text-[var(--color-on-surface)] m-0">
            {student.studentName}
          </h2>
          <p className="text-xs text-[var(--color-on-surface-variant)] mt-0.5">
            Roll: {student.studentRollNumber} | Score: {student.score} / {assignment.totalMarks}
          </p>
        </div>
        <button 
          onClick={onClose}
          className="p-1.5 rounded-sm text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)] hover:bg-[var(--color-surface-container)] transition-colors"
          aria-label="Close panel"
        >
          <XMarkIcon className="w-4 h-4" />
        </button>
      </div>
      
      {/* Questions */}
      <div className="p-5 space-y-4">
        {student.feedback?.map((f: QuestionFeedback, i: number) => (
          <div 
            key={f.questionId} 
            className="p-4 rounded-sm bg-[var(--color-surface)] hover:bg-[var(--color-surface-container-high)] transition-colors duration-150"
          >
            {/* Question header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-[var(--color-on-surface-variant)]">
                  Q{i + 1}
                </span>
                {f.aiGradingFailed && (
                  <span className="px-2 py-0.5 text-[0.6875rem] font-medium uppercase tracking-wider rounded-sm bg-[var(--color-error-container)] text-[var(--color-error)]">
                    AI Failed
                  </span>
                )}
              </div>
              
              {/* Score input */}
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min={0}
                  max={f.maxMarks || 1}
                  defaultValue={f.marksAwarded}
                  className="w-14 px-2 py-1 text-sm font-semibold text-center bg-transparent border-0 border-b border-[var(--color-outline-variant)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-0 transition-colors text-[var(--color-on-surface)]"
                  onBlur={(e) => onGradeUpdate(student.studentId, f.questionId, e.target.value)}
                  aria-label={`Score for question ${i + 1}`}
                />
                <span className="text-xs text-[var(--color-on-surface-variant)]">
                  / {f.maxMarks || 1}
                </span>
              </div>
            </div>
            
            {/* Question text */}
            <p className="text-sm text-[var(--color-on-surface)] mb-3 leading-relaxed">
              {f.questionText}
            </p>
            
            {/* Answers comparison */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-sm bg-[var(--color-error-container)]/30">
                <span className="text-[0.6875rem] font-semibold uppercase tracking-wider text-[var(--color-error)] block mb-1.5">
                  Your Answer
                </span>
                <span className="text-sm text-[var(--color-error)]">
                  {f.studentAnswer || "(No answer)"}
                </span>
              </div>
              <div className="p-3 rounded-sm bg-[var(--color-success-container)]/40">
                <span className="text-[0.6875rem] font-semibold uppercase tracking-wider text-[var(--color-success)] block mb-1.5">
                  Correct Answer
                </span>
                <span className="text-sm text-[var(--color-success)]">
                  {Array.isArray(f.correctAnswer) 
                    ? f.correctAnswer.join(" or ") 
                    : f.correctAnswer}
                </span>
              </div>
            </div>
            
            {/* AI Reasoning */}
            {f.reasoning && (
              <div className="mt-3 p-3 rounded-sm bg-[var(--color-surface-container-low)]">
                <span className="text-[0.6875rem] font-semibold uppercase tracking-wider text-[var(--color-on-surface-variant)] block mb-1.5">
                  AI Reasoning
                </span>
                <span className="text-sm text-[var(--color-on-surface-variant)] leading-relaxed">
                  {f.reasoning}
                </span>
              </div>
            )}
            
            {/* Re-grade button */}
            {f.aiGradingFailed && (
              <button
                onClick={() => onRegrade(student.id)}
                disabled={regrading}
                className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-primary)] hover:text-[var(--color-primary-dim)] disabled:opacity-50 transition-colors"
              >
                <ArrowPathIcon className={`w-4 h-4 ${regrading ? 'animate-spin' : ''}`} />
                {regrading ? 'Re-grading...' : 'Retry AI Grading'}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
