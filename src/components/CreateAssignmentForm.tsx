"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useAssignment } from "@/components/AssignmentContext";
import { api } from "@/lib/api";
import { trackEvent } from "@/lib/analytics";
import Loader from "@/components/Loader";

interface ClassType {
  id: string;
  name: string;
  section: string;
}

interface PublishResult {
  assignmentId: string;
  classLabel: string;
  dueDate: string;
  linkId: string;
  code: string;
  title: string;
}

const typeLabels: Record<string, string> = {
  MCQ: "MCQ",
  TRUE_FALSE: "True / False",
  FILL_IN_BLANKS: "Fill in the Blank",
  MULTIPLE_CHOICE: "Multiple Choice",
  SHORT_ANSWER: "Short Answer",
  ESSAY: "Essay",
};

function formatDueDate(value: string) {
  if (!value) return "Not scheduled";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function toAssignmentDueDateInstant(value: string) {
  if (!value) {
    return value;
  }

  // The backend currently expects an Instant, while the date picker yields YYYY-MM-DD.
  // Send a stable UTC timestamp so the selected calendar date can be parsed reliably.
  return `${value}T00:00:00.000Z`;
}

export default function CreateAssignmentForm({
  classes: initialClasses,
}: {
  classes: ClassType[];
}) {
  const { selectedQuestions, removeQuestion, clearSelection, updateQuestionPoints } = useAssignment();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [publishResult, setPublishResult] = useState<PublishResult | null>(null);
  const [showCreateClassModal, setShowCreateClassModal] = useState(false);
  const [classes, setClasses] = useState<ClassType[]>(initialClasses);
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [isCreatingClass, setIsCreatingClass] = useState(false);
  const [createClassError, setCreateClassError] = useState<string | null>(null);
  const [newClassName, setNewClassName] = useState("");
  const [newClassGrade, setNewClassGrade] = useState("");
  const [newClassSection, setNewClassSection] = useState("");
  const [copiedCode, setCopiedCode] = useState(false);

  const totalMarks = selectedQuestions.reduce((acc, question) => acc + question.points, 0);

  const handleCreateClass = async () => {
    if (!newClassName || !newClassGrade || !newClassSection) {
      setCreateClassError("Please fill in all fields.");
      return;
    }

    setIsCreatingClass(true);
    setCreateClassError(null);

    try {
      const newClass = await api.classes.createClass({ name: newClassName, grade: newClassGrade, section: newClassSection });

      setClasses((prev) => [...prev, newClass]);
      setSelectedClassId(newClass.id);
      setShowCreateClassModal(false);
      setNewClassName("");
      setNewClassGrade("");
      setNewClassSection("");
    } catch (err: unknown) {
      setCreateClassError(
        err instanceof Error ? err.message : "Failed to create class. Please try again."
      );
    } finally {
      setIsCreatingClass(false);
    }
  };

  const handleCloseModal = () => {
    setShowCreateClassModal(false);
    setNewClassName("");
    setNewClassGrade("");
    setNewClassSection("");
    setCreateClassError(null);
  };

  const handlePublish = (formData: FormData) => {
    startTransition(async () => {
      setError(null);

      try {
        const title = formData.get("title") as string;
        const classId = selectedClassId;
        const dueDate = formData.get("dueDate") as string;

        if (!classId) {
          setError("Please select or create a class before publishing.");
          return;
        }

        const dueDateInstant = toAssignmentDueDateInstant(dueDate);

        const createdAssignment = await api.assignments.create({
          title,
          classId,
          dueDate: dueDateInstant,
          description: `Assignment for class ${classId}`,
          questionIds: selectedQuestions.map((question) => question.id),
          questionPointsMap: selectedQuestions.reduce((acc, question) => {
            acc[question.id] = question.points;
            return acc;
          }, {} as Record<string, number>),
          maxScore: totalMarks,
          status: "DRAFT",
        });
        const publishedAssignment = await api.assignments.publish(createdAssignment.id);

        trackEvent("assignment_published", {
          assignmentId: publishedAssignment.id,
          classId,
          totalQuestions: selectedQuestions.length,
          totalMarks,
        });

        const targetClass = classes.find((item) => item.id === classId);

        setPublishResult({
          assignmentId: publishedAssignment.id,
          classLabel: targetClass
            ? `${targetClass.name} • Section ${targetClass.section}`
            : "Assigned class",
          dueDate,
          linkId: publishedAssignment.linkId || publishedAssignment.id,
          code: publishedAssignment.code || "—",
          title,
        });
        clearSelection();
      } catch (submissionError: unknown) {
        setError(
          submissionError instanceof Error
            ? submissionError.message
            : "We could not publish the assignment right now."
        );
      }
    });
  };

  if (publishResult) {
    const shareLink = `${window.location.origin}/student/assignment/${publishResult.linkId}`;

    return (
      <div className="grid gap-8">
        <section className="bg-surface-container-lowest rounded-lg p-10 shadow-sm text-center">
          <div className="w-20 h-20 rounded-full bg-primary-container text-primary flex items-center justify-center mx-auto mb-6">
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-label-sm text-primary m-0">
            Publish Complete
          </p>
          <h2 className="font-manrope text-[clamp(2rem,4vw,3rem)] font-extrabold tracking-[-0.04em] text-on-surface mt-3 mb-0">
            Assignment Published
          </h2>
          <p className="text-on-surface-variant text-[0.9375rem] leading-[1.7] max-w-[34rem] mx-auto mt-4 mb-6">
            {publishResult.title} is now live for students. Share the code or link below to begin collecting submissions.
          </p>

          {/* Short Code Display */}
          <div className="inline-flex flex-col items-center gap-3 bg-primary-container/30 rounded-xl px-8 py-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-on-primary-container m-0">
              Assignment Code
            </p>
            <div className="flex items-center gap-3">
              <code className="text-3xl font-extrabold tracking-[0.15em] text-primary font-mono">
                {publishResult.code}
              </code>
              <button
                type="button"
                onClick={async () => {
                  await navigator.clipboard.writeText(publishResult.code);
                  setCopiedCode(true);
                  setTimeout(() => setCopiedCode(false), 2000);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary text-on-primary text-xs font-bold rounded-full hover:opacity-90 active:scale-95 transition-all"
              >
                {copiedCode ? (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                    Copied
                  </>
                ) : (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                    Copy
                  </>
                )}
              </button>
            </div>
            <p className="text-xs text-on-primary-container/70 m-0">
              Students can enter this code at <span className="font-semibold">Student Portal → Enter Code</span>
            </p>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(18rem,22rem)] lg:items-start gap-6">
          <section className="bg-surface-container-lowest rounded-lg p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-11 h-11 rounded-lg flex items-center justify-center text-primary bg-[var(--color-primary-container)]">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                </svg>
              </div>
              <div>
                <p className="text-label-sm text-on-surface-variant m-0">
                  Student Assignment Link
                </p>
                <h3 className="mt-1 mb-0 text-lg font-bold text-on-surface">
                  Ready to share
                </h3>
              </div>
            </div>

            <div className="bg-surface-container-low rounded-lg p-5 grid gap-4">
              <div>
                <p className="text-label-sm text-on-surface-variant m-0">
                  Unique Access URL
                </p>
                <code className="block mt-2 text-primary text-sm leading-[1.7] break-words">
                  {shareLink}
                </code>
              </div>

              <div className="flex gap-3 flex-wrap">
                <button
                  type="button"
                  onClick={() => navigator.clipboard.writeText(shareLink)}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium leading-[1.3] tracking-[0.02em] rounded-sm transition-all duration-150 ease-out hover:opacity-90 hover:shadow-sm active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ background: "linear-gradient(145deg, var(--color-primary), var(--color-primary-dim))", color: "var(--color-on-primary)" }}
                >
                  Copy Link
                </button>
                <Link href={`/teacher/assignments/${publishResult.assignmentId}`} className="btn-ghost">
                  View Assignment Report
                </Link>
              </div>
            </div>
          </section>

          <aside className="grid gap-6">
            <section className="bg-primary text-on-primary rounded-lg p-6 shadow-md">
              <h3 className="m-0 text-lg font-bold">Assignment Snapshot</h3>
              <div className="grid gap-4 mt-6">
                <div>
                  <p className="text-label-sm text-[rgba(242,250,255,0.72)] m-0">
                    Due Date
                  </p>
                  <p className="mt-2 mb-0 text-base font-bold">
                    {formatDueDate(publishResult.dueDate)}
                  </p>
                </div>
                <div>
                  <p className="text-label-sm text-[rgba(242,250,255,0.72)] m-0">
                    Target Class
                  </p>
                  <p className="mt-2 mb-0 text-base font-bold">
                    {publishResult.classLabel}
                  </p>
                </div>
              </div>
            </section>

            <section className="bg-surface-container-low rounded-lg p-6">
              <p className="text-label-sm text-primary m-0">
                Quick Tip
              </p>
              <p className="mt-3 mb-0 text-on-surface-variant leading-[1.7] text-sm">
                Students can open the shared link directly. Track progress and scores from the assignment report once submissions start arriving.
              </p>
            </section>

            <Link href="/teacher/dashboard" className="btn-ghost justify-center">
              Return to Dashboard
            </Link>
          </aside>
        </div>
      </div>
    );
  }

  if (selectedQuestions.length === 0) {
    return (
      <section className="bg-surface-container-lowest rounded-lg py-12 px-8 border border-dashed border-outline/25 text-center">
        <div className="w-16 h-16 rounded-full bg-surface-container-low text-primary flex items-center justify-center mx-auto mb-5">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14" />
            <path d="M5 12h14" />
          </svg>
        </div>
        <h2 className="m-0 text-2xl font-bold text-on-surface">
          No questions in the review tray yet
        </h2>
        <p className="mt-4 mx-auto mb-0 text-on-surface-variant max-w-[30rem] leading-[1.7]">
          Browse the curated question bank, add the questions you want, and return here to organize and publish the final assignment.
        </p>
        <div className="mt-6">
          <Link href="/teacher/question-bank" className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-on-primary text-sm font-medium leading-[1.3] tracking-[0.02em] rounded-sm transition-all duration-150 ease-out hover:opacity-90 hover:shadow-sm active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed" style={{ background: "linear-gradient(145deg, var(--color-primary), var(--color-primary-dim))" }}>
            Browse Question Bank
          </Link>
        </div>
      </section>
    );
  }

  return (
    <form action={handlePublish} className="grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(20rem,24rem)] lg:items-start gap-8">
      <section className="grid gap-5">
        <div className="flex justify-between items-center gap-4 flex-wrap">
          <div>
            <h2 className="font-manrope text-2xl font-bold text-primary tracking-[-0.03em] m-0">
              Selected Questions ({selectedQuestions.length})
            </h2>
            <p className="mt-2 text-on-surface-variant text-sm m-0">
              Review the sequence, remove anything unnecessary, and publish once the set feels right.
            </p>
          </div>
          <Link href="/teacher/question-bank" className="btn-ghost">
            Add More Questions
          </Link>
        </div>

        {selectedQuestions.map((question, index) => (
          <article
            key={question.id}
            className="relative overflow-hidden rounded-lg border border-outline-variant/12 bg-surface-container-lowest p-6 shadow-[0_4px_14px_rgba(48,51,47,0.05)] grid gap-4"
          >
            <div className="absolute inset-x-0 top-0 h-1 bg-surface-container-high" />
            <div className="flex justify-between items-start gap-4 flex-wrap">
              <div className="flex gap-3 items-center flex-wrap">
                <span className="rounded-full bg-primary-container px-2.5 py-1 text-[0.6875rem] font-bold tracking-[0.08em] uppercase text-on-primary-container">
                  Q{index + 1}
                </span>
                <span className="rounded-full bg-surface-container-low px-2.5 py-1 text-[0.6875rem] font-semibold uppercase tracking-[0.06em] text-on-surface-variant">
                  {typeLabels[question.type] || question.type.replace(/_/g, " ")}
                </span>
              </div>

              <div className="flex gap-3 items-center flex-wrap">
                <div className="flex items-center gap-1.5 bg-surface-container-lowest border border-outline-variant/60 rounded-md px-2 py-1">
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={question.points}
                    onChange={(e) => {
                      const newPoints = parseInt(e.target.value, 10);
                      if (!isNaN(newPoints) && newPoints > 0) {
                        updateQuestionPoints(question.id, newPoints);
                      }
                    }}
                    className="w-10 text-center text-on-surface text-[0.8125rem] font-semibold bg-transparent border-none outline-none focus:ring-1 focus:ring-primary rounded-sm"
                  />
                  <span className="text-on-surface-variant text-[0.75rem] font-medium pr-1 select-none">
                    {question.points === 1 ? "Mark" : "Marks"}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => removeQuestion(question.id)}
                  className="btn-ghost px-3 text-error"
                >
                  Remove
                </button>
              </div>
            </div>

            <p className="m-0 text-on-surface text-[0.9375rem] leading-[1.7]">
              {question.text}
            </p>

            {question.options?.length ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {question.options.map((option, optionIndex) => (
                  <div
                    key={`${question.id}-${optionIndex}`}
                    className="rounded-md border border-outline-variant/10 bg-surface-container-lowest p-4 flex gap-3 items-start"
                  >
                    <span className="w-6 h-6 rounded-full bg-surface-container flex items-center justify-center text-xs font-bold text-on-surface-variant shrink-0">
                      {String.fromCharCode(65 + optionIndex)}
                    </span>
                    <span className="text-on-surface-variant text-sm leading-[1.6]">
                      {option}
                    </span>
                  </div>
                ))}
              </div>
            ) : question.explanation ? (
              <div className="rounded-md border border-outline-variant/10 bg-surface-container-low p-4 text-on-surface-variant text-sm leading-[1.7]">
                {question.explanation}
              </div>
            ) : null}
          </article>
        ))}
      </section>

      <aside className="grid gap-6 content-start">
        <section className="sticky top-6 rounded-lg border border-outline-variant/12 bg-surface-container-lowest p-6 shadow-[0_8px_24px_rgba(27,28,26,0.05)]">
          <div className="border-b border-outline-variant/10 pb-4">
            <p className="m-0 text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-on-surface-variant">
              Publish Panel
            </p>
            <h3 className="mt-1 mb-0 text-lg font-bold text-on-surface">Assignment Summary</h3>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="rounded-lg border border-outline-variant/10 bg-[var(--color-surface-container)] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]">
              <p className="m-0 text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-on-surface-variant">
                Total Marks
              </p>
              <p className="mt-2 mb-0 text-2xl font-extrabold leading-none text-on-surface">{totalMarks}</p>
            </div>
            <div className="rounded-lg border border-outline-variant/10 bg-[var(--color-surface-container)] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]">
              <p className="m-0 text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-on-surface-variant">
                Question Count
              </p>
              <p className="mt-2 mb-0 text-2xl font-extrabold leading-none text-on-surface">{selectedQuestions.length}</p>
            </div>
          </div>

          <div className="grid gap-5 mt-6">
            <div>
              <label htmlFor="assignment-title" className="text-label-sm text-on-surface-variant block mb-2">
                Assignment Title
              </label>
              <input
                id="assignment-title"
                name="title"
                required
                placeholder="e.g. Algebra & Linear Equations"
                className="w-full rounded-md border border-outline-variant/15 bg-surface-container-low px-4 py-3 text-on-surface outline-none transition-all placeholder:text-on-surface-variant/70 focus:border-primary focus:ring-2 focus:ring-primary/10"
              />
            </div>

            <div>
              <label htmlFor="assignment-class" className="text-label-sm text-on-surface-variant block mb-2">
                Target Class
              </label>
              <select
                id="assignment-class"
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="w-full rounded-md border border-outline-variant/15 bg-surface-container-low px-4 py-3 text-on-surface outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10 [&>option]:text-on-surface"
              >
                <option value="" disabled>
                  {classes.length === 0 ? "No classes yet — create one below" : "Select a class"}
                </option>
                {classes.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} • Section {item.section}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setShowCreateClassModal(true)}
                className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary-dim transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" /><path d="M12 8v8" /><path d="M8 12h8" />
                </svg>
                Create New Class
              </button>
            </div>

            <div>
              <label htmlFor="assignment-due-date" className="text-label-sm text-on-surface-variant block mb-2">
                Due Date
              </label>
              <input
                id="assignment-due-date"
                type="date"
                name="dueDate"
                required
                className="w-full rounded-md border border-outline-variant/15 bg-surface-container-low px-4 py-3 text-on-surface outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10"
              />
            </div>
          </div>

          {error && (
            <div className="mt-5 rounded-md border border-error/20 bg-error-container/50 py-3 px-4 text-[0.8125rem] leading-[1.6] text-on-surface">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="mt-6 w-full rounded-xl border-none px-5 py-4 font-extrabold tracking-[0.04em] uppercase text-on-primary shadow-[0_8px_18px_rgba(48,51,47,0.10)] disabled:cursor-wait disabled:opacity-75 cursor-pointer"
            style={{ background: "linear-gradient(145deg, var(--color-primary), var(--color-primary-dim))", color: "var(--color-on-primary)" }}
          >
            {isPending ? (
              <Loader size="sm" color="currentColor" label="Publishing…" />
            ) : (
              "Finalize & Publish"
            )}
          </button>

          <p className="mt-4 mb-0 text-[0.8125rem] leading-[1.7] text-on-surface-variant">
            Publishing keeps the student flow link-based and Shiksha Sathi-native. No external classroom integrations are added in this implementation wave.
          </p>
        </section>
      </aside>

      {/* ═══ Create New Class Modal ═══ */}
      {showCreateClassModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          onClick={() => !isCreatingClass && handleCloseModal()}
          style={{ background: "rgba(26, 27, 30, 0.5)", backdropFilter: "blur(8px)" }}
        >
          <div
            className="w-full max-w-md rounded-2xl shadow-2xl overflow-hidden"
            style={{ background: "var(--color-surface-container-lowest)" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b" style={{ borderColor: "var(--color-outline-variant)" }}>
              <div>
                <h3 className="text-lg font-bold text-on-surface m-0">Create New Class</h3>
                <p className="text-xs text-on-surface-variant mt-1 mb-0">Add a class to assign this to</p>
              </div>
              <button
                type="button"
                onClick={handleCloseModal}
                className="p-2 rounded-full hover:bg-surface-container transition-colors cursor-pointer"
                style={{ color: "var(--color-on-surface-variant)" }}
                disabled={isCreatingClass}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6L6 18" /><path d="M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-5 space-y-5">
              {createClassError && (
                <div className="rounded-md border border-error/20 bg-error-container/30 py-3 px-4 text-sm text-error">
                  {createClassError}
                </div>
              )}

              <div>
                <label htmlFor="modal-class-name" className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--color-on-surface-variant)" }}>
                  Class Name <span className="text-error">*</span>
                </label>
                <input
                  id="modal-class-name"
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  required
                  placeholder="e.g. Grade 10 Mathematics"
                  disabled={isCreatingClass}
                  className="w-full rounded-md border px-4 py-3 text-on-surface outline-none transition-all focus:ring-2"
                  style={{
                    borderColor: "var(--color-outline-variant)",
                    background: "var(--color-surface-container-low)",
                  }}
                  onFocus={(e) => { e.target.style.borderColor = "var(--color-primary)"; e.target.style.boxShadow = "0 0 0 2px rgba(44, 95, 110, 0.1)"; }}
                  onBlur={(e) => { e.target.style.borderColor = "var(--color-outline-variant)"; e.target.style.boxShadow = "none"; }}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="modal-class-grade" className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--color-on-surface-variant)" }}>
                    Grade <span className="text-error">*</span>
                  </label>
                  <select
                    id="modal-class-grade"
                    value={newClassGrade}
                    onChange={(e) => setNewClassGrade(e.target.value)}
                    required
                    disabled={isCreatingClass}
                    className="w-full rounded-md border px-4 py-3 text-on-surface outline-none transition-all focus:ring-2 cursor-pointer"
                    style={{
                      borderColor: "var(--color-outline-variant)",
                      background: "var(--color-surface-container-low)",
                    }}
                    onFocus={(e) => { e.target.style.borderColor = "var(--color-primary)"; e.target.style.boxShadow = "0 0 0 2px rgba(44, 95, 110, 0.1)"; }}
                    onBlur={(e) => { e.target.style.borderColor = "var(--color-outline-variant)"; e.target.style.boxShadow = "none"; }}
                  >
                    <option value="">Select</option>
                    {Array.from({ length: 12 }, (_, i) => (
                      <option key={i + 1} value={String(i + 1)}>
                        Class {i + 1}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="modal-class-section" className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--color-on-surface-variant)" }}>
                    Section <span className="text-error">*</span>
                  </label>
                  <input
                    id="modal-class-section"
                    value={newClassSection}
                    onChange={(e) => setNewClassSection(e.target.value)}
                    required
                    placeholder="e.g. A"
                    maxLength={4}
                    disabled={isCreatingClass}
                    className="w-full rounded-md border px-4 py-3 text-on-surface outline-none transition-all focus:ring-2"
                    style={{
                      borderColor: "var(--color-outline-variant)",
                      background: "var(--color-surface-container-low)",
                    }}
                    onFocus={(e) => { e.target.style.borderColor = "var(--color-primary)"; e.target.style.boxShadow = "0 0 0 2px rgba(44, 95, 110, 0.1)"; }}
                    onBlur={(e) => { e.target.style.borderColor = "var(--color-outline-variant)"; e.target.style.boxShadow = "none"; }}
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={isCreatingClass}
                  className="flex-1 py-3 px-4 rounded-lg text-sm font-semibold transition-all cursor-pointer"
                  style={{
                    background: "var(--color-surface-container)",
                    color: "var(--color-on-surface)",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCreateClass}
                  disabled={isCreatingClass}
                  className="flex-1 py-3 px-4 rounded-lg text-sm font-bold transition-all cursor-pointer disabled:opacity-75 disabled:cursor-wait"
                  style={{ background: "linear-gradient(145deg, var(--color-primary), var(--color-primary-dim))", color: "var(--color-on-primary)" }}
                >
                  {isCreatingClass ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Creating…
                    </span>
                  ) : (
                    "Create & Select"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
