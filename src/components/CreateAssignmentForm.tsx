"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useAssignment } from "@/components/AssignmentContext";
import { api } from "@/lib/api";

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

export default function CreateAssignmentForm({
  classes,
}: {
  classes: ClassType[];
}) {
  const { selectedQuestions, removeQuestion, clearSelection } = useAssignment();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [publishResult, setPublishResult] = useState<PublishResult | null>(null);

  const totalMarks = selectedQuestions.reduce((acc, question) => acc + question.points, 0);

  const handlePublish = (formData: FormData) => {
    startTransition(async () => {
      setError(null);

      try {
        const title = formData.get("title") as string;
        const classId = formData.get("classId") as string;
        const dueDate = formData.get("dueDate") as string;

        const result = await api.assignments.create({
          title,
          classId,
          dueDate,
          description: `Assignment for class ${classId}`,
          questionIds: selectedQuestions.map((question) => question.id),
          maxScore: totalMarks,
          status: "PUBLISHED",
        });

        const targetClass = classes.find((item) => item.id === classId);

        setPublishResult({
          assignmentId: result.id,
          classLabel: targetClass
            ? `${targetClass.name} • Section ${targetClass.section}`
            : "Assigned class",
          dueDate,
          linkId: result.linkId || result.id,
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
          <p className="text-on-surface-variant text-[0.9375rem] leading-[1.7] max-w-[34rem] mx-auto mt-4 mb-0">
            {publishResult.title} is now live for students. Share the unique link below to begin collecting submissions.
          </p>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(18rem,22rem)] lg:items-start gap-6">
          <section className="bg-surface-container-lowest rounded-lg p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-11 h-11 rounded-lg flex items-center justify-center text-primary bg-[#44637114]">
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
                  className="btn-primary"
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
          <Link href="/teacher/question-bank" className="btn-primary">
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
            className="bg-surface-container-lowest rounded-lg p-6 shadow-sm grid gap-4"
          >
            <div className="flex justify-between items-start gap-4 flex-wrap">
              <div className="flex gap-3 items-center flex-wrap">
                <span className="bg-primary-container text-on-primary-container rounded-sm px-2 py-[2px] text-[0.6875rem] font-bold tracking-[0.08em] uppercase">
                  Q{index + 1}
                </span>
                <span className="text-label-sm text-on-surface-variant m-0">
                  {typeLabels[question.type] || question.type.replace(/_/g, " ")}
                </span>
              </div>

              <div className="flex gap-3 items-center flex-wrap">
                <span className="text-on-surface-variant text-[0.8125rem] font-semibold">
                  {question.points} {question.points === 1 ? "Mark" : "Marks"}
                </span>
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
                    className="bg-surface-container-low rounded-md p-4 flex gap-3 items-start"
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
              <div className="bg-surface-container-low rounded-md p-4 text-on-surface-variant text-sm leading-[1.7]">
                {question.explanation}
              </div>
            ) : null}
          </article>
        ))}
      </section>

      <aside className="grid gap-6 content-start">
        <section className="bg-primary text-on-primary rounded-2xl p-6 shadow-md sticky top-6">
          <h3 className="m-0 text-lg font-bold">Assignment Summary</h3>

          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="bg-white/12 rounded-lg p-4">
              <p className="text-label-sm text-[rgba(242,250,255,0.72)] m-0">
                Total Marks
              </p>
              <p className="mt-2 mb-0 text-2xl font-extrabold">{totalMarks}</p>
            </div>
            <div className="bg-white/12 rounded-lg p-4">
              <p className="text-label-sm text-[rgba(242,250,255,0.72)] m-0">
                Question Count
              </p>
              <p className="mt-2 mb-0 text-2xl font-extrabold">{selectedQuestions.length}</p>
            </div>
          </div>

          <div className="grid gap-5 mt-6">
            <div>
              <label htmlFor="assignment-title" className="text-label-sm text-[rgba(242,250,255,0.72)] block mb-2">
                Assignment Title
              </label>
              <input
                id="assignment-title"
                name="title"
                required
                placeholder="e.g. Algebra & Linear Equations"
                className="w-full bg-white/12 border border-white/12 rounded-md px-4 py-3 text-on-primary outline-none focus:ring-2 focus:ring-on-primary/50 transition-all placeholder-on-primary/50"
              />
            </div>

            <div>
              <label htmlFor="assignment-class" className="text-label-sm text-[rgba(242,250,255,0.72)] block mb-2">
                Target Class
              </label>
              <select
                id="assignment-class"
                name="classId"
                required
                defaultValue=""
                className="w-full bg-white/12 border border-white/12 rounded-md px-4 py-3 text-on-primary outline-none focus:ring-2 focus:ring-on-primary/50 transition-all [&>option]:text-on-surface"
              >
                <option value="" disabled>
                  Select a class
                </option>
                {classes.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} • Section {item.section}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="assignment-due-date" className="text-label-sm text-[rgba(242,250,255,0.72)] block mb-2">
                Due Date
              </label>
              <input
                id="assignment-due-date"
                type="date"
                name="dueDate"
                required
                className="w-full bg-white/12 border border-white/12 rounded-md px-4 py-3 text-on-primary outline-none focus:ring-2 focus:ring-on-primary/50 transition-all"
                style={{ colorScheme: 'dark' }}
              />
            </div>
          </div>

          {error && (
            <div className="mt-5 bg-[rgba(168,56,54,0.18)] text-on-primary rounded-md py-3 px-4 text-[0.8125rem] leading-[1.6]">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="w-full mt-6 bg-on-primary text-primary border-none rounded-lg px-5 py-4 font-extrabold tracking-[0.04em] uppercase disabled:opacity-75 disabled:cursor-wait cursor-pointer"
          >
            {isPending ? "Publishing…" : "Finalize & Publish"}
          </button>

          <p className="mt-4 mb-0 text-[0.8125rem] leading-[1.7] text-[rgba(242,250,255,0.72)]">
            Publishing keeps the student flow link-based and Shiksha Sathi-native. No external classroom integrations are added in this implementation wave.
          </p>
        </section>
      </aside>
    </form>
  );
}
