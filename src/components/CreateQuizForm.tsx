"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useQuiz } from "@/components/QuizContext";
import { api } from "@/lib/api";
import Loader from "@/components/Loader";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// shadcn UI Components
import { Input } from "@/components/ui/input";
import { Select, SelectItem } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import QuizQuestionReview from "@/components/QuizQuestionReview";
import QuizSuccessCelebration from "@/components/QuizSuccessCelebration";

interface ClassType {
  id: string;
  name: string;
  section: string;
}

const SUPPORTED_TYPES = new Set(["MCQ", "TRUE_FALSE"]);

// Zod schema for validation
const quizFormSchema = z.object({
  title: z.string().min(3, "Quiz title must be at least 3 characters"),
  classId: z.string().optional(),
  timePerQuestionSec: z.number().min(5, "Minimum 5 seconds").max(300, "Maximum 300 seconds"),
  publishSelfPaced: z.boolean(),
});

type QuizFormData = z.infer<typeof quizFormSchema>;

export default function CreateQuizForm({ classes }: { classes: ClassType[] }) {
  const { selectedQuestions, clearSelection, removeQuestion, reorderQuestions } = useQuiz();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    quizId: string;
    title: string;
    sessionId?: string;
    sessionCode?: string;
    selfPacedCode?: string;
  } | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<QuizFormData>({
    resolver: zodResolver(quizFormSchema),
    defaultValues: {
      title: "",
      classId: "",
      timePerQuestionSec: 30,
      publishSelfPaced: true,
    },
  });

  const selectedClassId = watch("classId") === "general" ? "" : (watch("classId") || "");
  const timePerQuestionSec = watch("timePerQuestionSec");

  // Filter quiz-compatible questions (must have options for MCQ/TRUE_FALSE)
  const supportedQuestions = selectedQuestions.filter((q) => 
    SUPPORTED_TYPES.has(q.type) && q.options && q.options.length > 0
  );
  const questionsWithoutOptions = selectedQuestions.filter((q) => 
    SUPPORTED_TYPES.has(q.type) && (!q.options || q.options.length === 0)
  );
  const totalMarks = supportedQuestions.reduce((acc, q) => acc + (q.points ?? 1), 0);

  const onSubmit = (data: QuizFormData) => {
    setError(null);
    
    if (supportedQuestions.length === 0) {
      setError("No valid questions selected. MCQ and True/False questions must have options.");
      return;
    }
    
    startTransition(async () => {
      try {
        const payload: any = {
          title: data.title.trim(),
          description: data.classId ? `Quiz for class ${data.classId}` : "General knowledge quiz",
          questionIds: supportedQuestions.map((q) => q.id),
          questionPointsMap: supportedQuestions.reduce((acc, q) => {
            acc[q.id] = q.points ?? 1;
            return acc;
          }, {} as Record<string, number>),
          timePerQuestionSec: data.timePerQuestionSec,
        };
        if (data.classId && data.classId !== "general") payload.classId = data.classId;

        const created = await api.quizzes.create(payload);

        let publishedCode: string | undefined;
        if (data.publishSelfPaced) {
          const published = await api.quizzes.publishSelfPaced(created.id);
          publishedCode = published.selfPacedCode;
        }

        clearSelection();

        setResult({
          quizId: created.id,
          title: data.title.trim(),
          selfPacedCode: publishedCode,
        });
      } catch (err: any) {
        console.error("Failed to create quiz:", err);
        setError(err.message || "Failed to create quiz. Please try again.");
      }
    });
  };

  // Success State
  if (result) {
    return (
      <div className="grid gap-6">
        <QuizSuccessCelebration
          quizTitle={result.title}
          selfPacedCode={result.selfPacedCode}
          quizId={result.quizId}
        />

        {/* Live Session Section */}
        <section className="rounded-2xl border border-outline-variant/20 bg-surface-container-low/50 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#bcece6' }}>
              <svg className="w-4 h-4" style={{ color: '#00201e' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-[16px] font-bold text-on-surface m-0">Live Session</h3>
              <p className="text-[12px] text-on-surface-variant/60 m-0">Host the quiz in real-time for your class</p>
            </div>
          </div>

          <div className="mt-4 flex gap-3 flex-wrap items-center">
            {result.sessionId ? (
              <>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] font-semibold" style={{ backgroundColor: '#bcece699', color: '#00201e' }}>
                  Join code: <span className="font-mono tracking-wide">{result.sessionCode}</span>
                </span>
                <Link href={`/teacher/quizzes/session/${result.sessionId}`} className="px-4 py-2 rounded-xl text-[13px] font-semibold text-white inline-flex items-center gap-2 transition-colors hover:opacity-90" style={{ backgroundColor: '#0d5a54' }}>
                  Open Host Console
                </Link>
              </>
            ) : (
              <Link href={`/teacher/quizzes/${result.quizId}`} className="px-4 py-2 rounded-xl text-[13px] font-semibold text-[var(--color-primary)] hover:bg-[var(--color-primary-container)]/30 transition-colors inline-flex items-center gap-2">
                View Quiz Details
              </Link>
            )}
          </div>
        </section>
      </div>
    );
  }

  // Empty State - No Questions
  if (supportedQuestions.length === 0) {
    return (
      <section className="rounded-2xl border-2 border-dashed border-[var(--color-primary)]/15 bg-[var(--color-primary-container)]/20 py-16 px-8 text-center">
        <div className="w-20 h-20 rounded-2xl bg-[var(--color-primary-container)]/50 flex items-center justify-center mx-auto mb-5">
          <svg className="w-10 h-10 text-[var(--color-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <h2 className="text-[20px] font-bold mb-2" style={{ color: '#00201e' }}>No Questions Selected</h2>
        <p className="text-[14px] max-w-[28rem] mx-auto mb-6 leading-relaxed" style={{ color: '#00201eb3' }}>
          Select MCQ or True-False questions from the Question Bank to build your quiz.
        </p>
        <Link href="/teacher/question-bank?context=quiz" className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-[14px] font-bold text-white transition-colors shadow-md hover:opacity-90" style={{ backgroundColor: '#0d5a54', boxShadow: '0 4px 6px -1px rgba(13, 90, 84, 0.1)' }}>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14m0-14l7 7m-7-7l-7 7" />
          </svg>
          Browse Question Bank
        </Link>
      </section>
    );
  }

  // Main Form - Questions Selected
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] xl:grid-cols-[minmax(0,2fr)_minmax(22rem,26rem)] lg:items-start gap-6 lg:gap-8">
      {/* Left Column - Question Review */}
      <aside className="lg:col-span-1 grid gap-6 order-1">
        <section className="rounded-2xl border border-[var(--color-primary)]/15 bg-white shadow-sm overflow-hidden">
          <div className="px-4 md:px-6 py-4 flex items-center gap-3 border-b border-[var(--color-primary)]/15" style={{ background: 'linear-gradient(to right, #bcece64d, #bcece680)' }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-sm" style={{ backgroundColor: '#0d5a54', boxShadow: '0 1px 3px rgba(13, 90, 84, 0.1)' }}>
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <h2 className="text-[16px] font-bold m-0" style={{ color: '#00201e' }}>Selected Questions</h2>
              <p className="text-[11px] m-0" style={{ color: '#00201eb3' }}>Drag to reorder • Click details to expand</p>
            </div>
          </div>
          <div className="p-4 md:p-6">
            <QuizQuestionReview
              questions={supportedQuestions}
              onReorder={reorderQuestions}
              onRemove={removeQuestion}
              totalMarks={totalMarks}
            />
          </div>
        </section>
      </aside>

      {/* Right Column - Quiz Settings */}
      <section className="lg:sticky lg:top-24 order-2">
        <form onSubmit={handleSubmit(onSubmit)} className="rounded-2xl border border-[var(--color-secondary)]/15 bg-white shadow-sm overflow-hidden">
          {/* Card Header */}
          <div className="px-4 md:px-6 py-4 flex items-center gap-3 border-b border-[var(--color-secondary)]/15" style={{ background: 'linear-gradient(to right, #d6e7d64d, #d6e7d680)' }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-sm" style={{ backgroundColor: '#3d6b4f', boxShadow: '0 1px 3px rgba(61, 107, 79, 0.1)' }}>
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-[16px] font-bold m-0" style={{ color: '#0a2e12' }}>Quiz Settings</h2>
              <p className="text-[11px] m-0" style={{ color: '#0a2e12b3' }}>Configure parameters for your quiz</p>
            </div>
          </div>

          <div className="p-4 md:p-6 space-y-5">
            {/* Quiz Summary */}
            <div className="rounded-xl bg-gradient-to-br from-[var(--color-surface-container-low)] to-white p-4 space-y-3 border border-[var(--color-outline-variant)]/60">
              <h4 className="text-[11px] font-bold text-[var(--color-on-surface-variant)] uppercase tracking-wider m-0">Quiz Summary</h4>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-2.5 p-2.5 rounded-xl border border-[var(--color-primary)]/15" style={{ backgroundColor: '#bcece64d' }}>
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center shadow-sm" style={{ backgroundColor: '#0d5a54', boxShadow: '0 1px 3px rgba(13, 90, 84, 0.1)' }}>
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <div>
                    <span className="text-[16px] font-bold" style={{ color: '#0d5a54' }}>{supportedQuestions.length}</span>
                    <p className="text-[11px] font-medium m-0" style={{ color: '#00201eb3' }}>Questions</p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 p-2.5 rounded-xl border border-[var(--color-secondary)]/15" style={{ backgroundColor: '#d6e7d64d' }}>
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center shadow-sm" style={{ backgroundColor: '#3d6b4f', boxShadow: '0 1px 3px rgba(61, 107, 79, 0.1)' }}>
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <span className="text-[16px] font-bold" style={{ color: '#3d6b4f' }}>{totalMarks}</span>
                    <p className="text-[11px] font-medium m-0" style={{ color: '#0a2e12b3' }}>Points</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2.5 p-2.5 rounded-xl border border-[var(--color-tertiary)]/15" style={{ backgroundColor: '#ffdbce4d' }}>
                <div className="w-9 h-9 rounded-lg flex items-center justify-center shadow-sm" style={{ backgroundColor: '#8b4513', boxShadow: '0 1px 3px rgba(139, 69, 19, 0.1)' }}>
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-[11px] m-0">
                    Est. time: <span className="font-bold text-[14px]" style={{ color: '#2e0c00' }}>{Math.ceil(supportedQuestions.length * timePerQuestionSec / 60)} min</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="rounded-xl bg-[var(--color-error-container)]/30 border border-[var(--color-error)]/15 p-4 flex items-start gap-3">
                <svg className="w-5 h-5 text-[var(--color-error)] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-[13px] font-semibold text-[var(--color-error)] m-0">Error</p>
                  <p className="text-[13px] text-on-error-container/80 m-0 mt-0.5">{error}</p>
                </div>
              </div>
            )}

            {/* Warning: Questions without options */}
            {questionsWithoutOptions.length > 0 && (
              <div className="rounded-xl bg-[var(--color-tertiary-container)]/30 border border-[var(--color-tertiary)]/15 p-4 flex items-start gap-3">
                <svg className="w-5 h-5 text-[var(--color-tertiary)] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <p className="text-[13px] font-semibold text-[var(--color-tertiary)] m-0">
                    {questionsWithoutOptions.length} question{questionsWithoutOptions.length > 1 ? 's' : ''} excluded
                  </p>
                  <p className="text-[12px] text-[var(--color-tertiary)]/80 m-0 mt-0.5">
                    MCQ and True/False questions must have answer options.
                  </p>
                </div>
              </div>
            )}

            {/* Form Fields */}
            <div className="space-y-5">
              {/* Quiz Title */}
              <div className="space-y-1.5">
                <Label htmlFor="title" required>Quiz Title</Label>
                <Input
                  id="title"
                  placeholder="e.g. Chapter 7: Chemistry Quiz"
                  error={!!errors.title}
                  {...register("title")}
                />
                {errors.title && (
                  <p className="text-[12px] text-[var(--color-error)] mt-1">{errors.title.message}</p>
                )}
                <p className="text-[12px] text-on-surface-variant/60">Students will see this title</p>
              </div>

              {/* Target Class */}
              <div className="space-y-1.5">
                <Label htmlFor="classId">Target Class</Label>
                <Select
                  value={selectedClassId}
                  onValueChange={(val) => setValue("classId", val)}
                  icon={
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  }
                >
                  <SelectItem value="general">None (General Quiz)</SelectItem>
                  {classes.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      Class {item.name} • Section {item.section}
                    </SelectItem>
                  ))}
                </Select>
                <p className="text-[12px] text-on-surface-variant/60">Quiz will be assigned to this class</p>
              </div>

              {/* Time per Question */}
              <div className="space-y-1.5">
                <Label htmlFor="timePerQuestionSec" required>Time per Question</Label>
                <div className="relative">
                  <Input
                    id="timePerQuestionSec"
                    type="number"
                    min={5}
                    max={300}
                    inputMode="numeric"
                    error={!!errors.timePerQuestionSec}
                    {...register("timePerQuestionSec", { valueAsNumber: true })}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[12px] text-on-surface-variant/60 font-medium">
                    seconds
                  </span>
                </div>
                {errors.timePerQuestionSec && (
                  <p className="text-[12px] text-[var(--color-error)] mt-1">{errors.timePerQuestionSec.message}</p>
                )}
                <p className="text-[12px] text-on-surface-variant/60">Recommended: 30-60 seconds per question</p>
              </div>

              {/* Publish Self-Paced */}
              <div className="pt-2">
                <Checkbox
                  id="publishSelfPaced"
                  checked={watch("publishSelfPaced")}
                  onCheckedChange={(checked) => setValue("publishSelfPaced", checked as boolean)}
                  label="Publish self-paced code immediately"
                  description="Recommended — students can take the quiz at their own pace"
                />
              </div>
            </div>

            {/* Submit Button - Tonal style per Material Design 3 */}
            <button
              type="submit"
              disabled={isPending || supportedQuestions.length === 0}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-[14px] font-bold tracking-wide text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 active:opacity-80"
              style={{ backgroundColor: '#0d5a54' }}
            >
              {isPending ? <Loader size="sm" color="currentColor" label="Creating…" /> : "Create Quiz"}
            </button>

            <p className="text-[11px] text-on-surface-variant/50 leading-relaxed text-center">
              After creating, you can start a live session or share the self-paced code with your students.
            </p>
          </div>
        </form>
      </section>
    </div>
  );
}