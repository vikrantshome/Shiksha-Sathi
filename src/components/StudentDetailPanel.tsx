"use client";

import { useState, useCallback, useEffect } from "react";
import { AssignmentSubmission, QuestionFeedback, Assignment } from "@/lib/api/types";
import { ArrowPathIcon, XMarkIcon, CheckIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";

interface GradeChange {
  questionId: string;
  score: number;
  originalScore: number;
}

interface Props {
  student: AssignmentSubmission;
  assignment: Assignment;
  onClose: () => void;
  onSaveChanges: (studentId: string, changes: GradeChange[]) => Promise<void>;
  onRegrade: (submissionId: string) => Promise<void>;
  regrading?: boolean;
}

/* ── Confirmation Dialog ── */
const ConfirmDialog = ({
  open,
  title,
  message,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
      <div
        className="relative rounded-xl p-6 max-w-sm w-full shadow-lg"
        style={{ background: "var(--color-surface-container-lowest)" }}
      >
        <div className="flex items-center gap-3 mb-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
            style={{ background: "var(--color-error-container)", color: "var(--color-error)" }}
          >
            <ExclamationTriangleIcon className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-[var(--color-on-surface)] m-0">{title}</h3>
        </div>
        <p className="text-sm text-[var(--color-on-surface-variant)] leading-relaxed mb-6">
          {message}
        </p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg text-sm font-bold transition-colors"
            style={{ color: "var(--color-on-surface-variant)" }}
          >
            Keep Editing
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg text-sm font-bold transition-colors"
            style={{ background: "var(--color-error)", color: "var(--color-on-error)" }}
          >
            Discard Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default function StudentDetailPanel({
  student,
  assignment,
  onClose,
  onSaveChanges,
  onRegrade,
  regrading = false,
}: Props) {
  /* ── Local draft state ── */
  const [draftScores, setDraftScores] = useState<Record<string, { current: number; original: number; maxMarks: number }>>(() => {
    const initial: Record<string, { current: number; original: number; maxMarks: number }> = {};
    student.feedback?.forEach((f) => {
      initial[f.questionId] = {
        current: f.marksAwarded ?? 0,
        original: f.marksAwarded ?? 0,
        maxMarks: f.maxMarks || 1,
      };
    });
    return initial;
  });

  const [isSaving, setIsSaving] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);

  /* ── Sync when student changes ── */
  useEffect(() => {
    const initial: Record<string, { current: number; original: number; maxMarks: number }> = {};
    student.feedback?.forEach((f) => {
      initial[f.questionId] = {
        current: f.marksAwarded ?? 0,
        original: f.marksAwarded ?? 0,
        maxMarks: f.maxMarks || 1,
      };
    });
    setDraftScores(initial);
  }, [student.id]);

  /* ── Derived state ── */
  const dirtyChanges: GradeChange[] = Object.entries(draftScores)
    .filter(([, v]) => v.current !== v.original)
    .map(([questionId, v]) => ({
      questionId,
      score: v.current,
      originalScore: v.original,
    }));

  const hasChanges = dirtyChanges.length > 0;

  /* ── Computed total score from drafts ── */
  const computedTotal = Object.values(draftScores).reduce((sum, v) => sum + v.current, 0);
  const originalTotal = student.score ?? 0;
  const totalChanged = computedTotal !== originalTotal;

  /* ── Handlers ── */
  const handleScoreChange = useCallback((questionId: string, value: string) => {
    const num = parseInt(value, 10);
    if (Number.isNaN(num)) return;
    setDraftScores((prev) => {
      const entry = prev[questionId];
      if (!entry) return prev;
      const clamped = Math.max(0, Math.min(num, entry.maxMarks));
      return { ...prev, [questionId]: { ...entry, current: clamped } };
    });
  }, []);

  const handleSave = async () => {
    if (!hasChanges) return;
    setIsSaving(true);
    try {
      await onSaveChanges(student.studentId, dirtyChanges);
      // Mark all as clean (sync original to current)
      setDraftScores((prev) => {
        const next = { ...prev };
        dirtyChanges.forEach((c) => {
          next[c.questionId] = { ...next[c.questionId], original: c.score };
        });
        return next;
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (!hasChanges) return;
    setShowCancelConfirm(true);
  };

  const confirmCancel = () => {
    setDraftScores((prev) => {
      const next = { ...prev };
      dirtyChanges.forEach((c) => {
        next[c.questionId] = { ...next[c.questionId], current: c.originalScore };
      });
      return next;
    });
    setShowCancelConfirm(false);
  };

  const handleClose = () => {
    if (hasChanges) {
      setShowCloseConfirm(true);
      return;
    }
    onClose();
  };

  const confirmClose = () => {
    setShowCloseConfirm(false);
    onClose();
  };

  return (
    <div className="rounded-md bg-[var(--color-surface-container-lowest)] overflow-hidden flex flex-col max-h-[calc(100vh-12rem)]">
      {/* ═══ Header ═══ */}
      <div className="px-5 py-3 bg-[var(--color-surface-container-low)] flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-sm font-semibold tracking-tight text-[var(--color-on-surface)] m-0">
            {student.studentName}
          </h2>
          <p className="text-xs text-[var(--color-on-surface-variant)] mt-0.5">
            Roll: {student.studentRollNumber} | Score:{" "}
            <span className={totalChanged ? "text-[var(--color-primary)] font-bold" : ""}>
              {computedTotal}
            </span>
            {totalChanged && (
              <span className="text-[var(--color-on-surface-variant)] ml-1">
                (was {originalTotal})
              </span>
            )}
            {" / "}{assignment.totalMarks}
          </p>
        </div>
        <button
          onClick={handleClose}
          className="p-1.5 rounded-sm text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)] hover:bg-[var(--color-surface-container)] transition-colors"
          aria-label="Close panel"
        >
          <XMarkIcon className="w-4 h-4" />
        </button>
      </div>

      {/* ═══ Questions ═══ */}
      <div className="p-5 space-y-4 flex-1 overflow-y-auto">
        {student.feedback?.map((f: QuestionFeedback, i: number) => {
          const draft = draftScores[f.questionId];
          const isDirty = draft && draft.current !== draft.original;

          return (
            <div
              key={f.questionId}
              className="p-4 rounded-sm bg-[var(--color-surface)] hover:bg-[var(--color-surface-container-high)] transition-colors duration-150"
            >
              {/* Question header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-semibold text-[var(--color-on-surface-variant)]">
                    Q{i + 1}
                  </span>
                  {f.aiGradingFailed && (
                    <span className="px-2 py-0.5 text-[0.6875rem] font-medium uppercase tracking-wider rounded-sm bg-[var(--color-error-container)] text-[var(--color-error)]">
                      AI Failed
                    </span>
                  )}
                  {isDirty && (
                    <span
                      className="px-2 py-0.5 text-[0.6875rem] font-bold uppercase tracking-wider rounded-sm"
                      style={{
                        background: "var(--color-primary-container)",
                        color: "var(--color-on-primary-container)",
                      }}
                    >
                      Modified
                    </span>
                  )}
                </div>

                {/* Score input */}
                <div className="flex flex-col items-end gap-1">
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      min={0}
                      max={f.maxMarks || 1}
                      value={draft?.current ?? f.marksAwarded ?? 0}
                      className={`w-14 px-2 py-1 text-sm font-semibold text-center bg-transparent border-0 border-b-2 focus:outline-none focus:ring-0 transition-colors text-[var(--color-on-surface)] ${
                        isDirty
                          ? "border-[var(--color-primary)]"
                          : "border-[var(--color-outline-variant)] focus:border-[var(--color-primary)]"
                      }`}
                      onChange={(e) => handleScoreChange(f.questionId, e.target.value)}
                      aria-label={`Score for question ${i + 1}`}
                    />
                    <span className="text-xs text-[var(--color-on-surface-variant)]">
                      / {f.maxMarks || 1}
                    </span>
                  </div>
                  {isDirty && (
                    <span className="text-[0.65rem] text-[var(--color-on-surface-variant)]">
                      Originally: {draft.original}
                    </span>
                  )}
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
                  <ArrowPathIcon className={`w-4 h-4 ${regrading ? "animate-spin" : ""}`} />
                  {regrading ? "Re-grading..." : "Retry AI Grading"}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* ═══ Save/Cancel Bar ═══ */}
      <div
        className="shrink-0 px-5 py-3 flex items-center justify-between border-t"
        style={{
          background: "var(--color-surface-container-low)",
          borderColor: "var(--color-outline-variant)",
        }}
      >
        <div className="flex items-center gap-2">
          {hasChanges ? (
            <>
              <span
                className="w-2 h-2 rounded-full"
                style={{ background: "var(--color-primary)" }}
              />
              <span className="text-xs font-bold" style={{ color: "var(--color-primary)" }}>
                {dirtyChanges.length} change{dirtyChanges.length !== 1 ? "s" : ""} pending
              </span>
            </>
          ) : (
            <span className="text-xs text-[var(--color-on-surface-variant)]">
              All changes saved
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {hasChanges && (
            <button
              onClick={handleCancel}
              disabled={isSaving}
              className="px-4 py-2 rounded-lg text-sm font-bold transition-colors disabled:opacity-50"
              style={{ color: "var(--color-on-surface-variant)" }}
            >
              Cancel
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={!hasChanges || isSaving}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200 disabled:opacity-40 active:scale-[0.96]"
            style={{
              background: hasChanges
                ? "var(--color-primary)"
                : "var(--color-surface-container-high)",
              color: hasChanges
                ? "var(--color-on-primary)"
                : "var(--color-on-surface-variant)",
            }}
          >
            {isSaving ? (
              <>
                <ArrowPathIcon className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <CheckIcon className="w-4 h-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>

      {/* ═══ Confirmation Dialogs ═══ */}
      <ConfirmDialog
        open={showCancelConfirm}
        title="Discard Changes?"
        message={`You have ${dirtyChanges.length} unsaved grade change${dirtyChanges.length !== 1 ? "s" : ""}. Cancelling will revert all scores to their original values.`}
        onConfirm={confirmCancel}
        onCancel={() => setShowCancelConfirm(false)}
      />
      <ConfirmDialog
        open={showCloseConfirm}
        title="Unsaved Changes"
        message={`You have ${dirtyChanges.length} unsaved grade change${dirtyChanges.length !== 1 ? "s" : ""}. If you close this panel, your changes will be lost.`}
        onConfirm={confirmClose}
        onCancel={() => setShowCloseConfirm(false)}
      />
    </div>
  );
}
