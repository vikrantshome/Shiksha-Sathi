import { api } from "@/lib/api";
import Link from "next/link";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function TeacherQuizzesPage() {
  let user;
  try {
    user = await api.auth.getMe();
  } catch {
    redirect("/login");
  }

  const [quizzes, classes] = await Promise.all([
    api.quizzes.listForTeacher(user.id).catch(() => []),
    api.classes.getClasses().catch(() => []),
  ]);

  const classLabelById = new Map(
    classes.map((c) => [c.id, `${c.name}${c.section ? ` • Section ${c.section}` : ""}`])
  );

  return (
    <div className="pb-12">
      <header className="mb-8 flex items-end justify-between gap-4 flex-wrap">
        <div className="grid gap-2">
          <p className="m-0 text-label-sm text-on-surface-variant">Live + Self‑Paced</p>
          <h1 className="m-0 font-headline text-[clamp(2rem,4vw,2.75rem)] font-extrabold tracking-[-0.04em] text-primary">
            Quizzes
          </h1>
          <p className="text-[0.9375rem] text-on-surface-variant leading-[1.7] max-w-[44rem] m-0">
            Create quick MCQ/True‑False checks for the end of a lesson, host live in class, or publish as self‑paced practice.
          </p>
        </div>
        <Link
          href="/teacher/quizzes/create"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-sm text-sm font-bold no-underline transition-all active:scale-95"
          style={{ background: "linear-gradient(145deg, var(--color-primary), var(--color-primary-dim))", color: "var(--color-on-primary)" }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14" /><path d="M5 12h14" />
          </svg>
          Create Quiz
        </Link>
      </header>

      {quizzes.length === 0 ? (
        <section className="bg-surface-container-lowest rounded-lg py-12 px-8 border border-dashed border-outline/25 text-center">
          <div className="w-16 h-16 rounded-full bg-surface-container-low text-primary flex items-center justify-center mx-auto mb-5">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14" />
              <path d="M5 12h14" />
            </svg>
          </div>
          <h2 className="m-0 text-2xl font-bold text-on-surface">
            No quizzes yet
          </h2>
          <p className="mt-4 mx-auto mb-0 text-on-surface-variant max-w-[30rem] leading-[1.7]">
            Start by selecting MCQ/True‑False questions from the Question Bank tray, then finalize the quiz here.
          </p>
          <div className="mt-6 flex items-center justify-center gap-3 flex-wrap">
            <Link href="/teacher/question-bank" className="btn-ghost">
              Open Question Bank
            </Link>
            <Link href="/teacher/quizzes/create" className="btn-ghost">
              Finalize Quiz
            </Link>
          </div>
        </section>
      ) : (
        <div className="grid gap-4">
          {quizzes.map((quiz) => (
            <Link
              key={quiz.id}
              href={`/teacher/quizzes/${quiz.id}`}
              className="no-underline block rounded-lg border border-outline/10 bg-surface-container-lowest p-6 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="grid gap-1">
                  <h3 className="m-0 text-lg font-bold text-on-surface">{quiz.title}</h3>
                  <p className="m-0 text-xs text-on-surface-variant">
                    {classLabelById.get(quiz.classId) ?? `Class ${quiz.classId}`} • {quiz.questionIds?.length ?? 0} questions
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {quiz.selfPacedEnabled && quiz.selfPacedCode ? (
                    <span className="text-[0.6875rem] font-bold px-3 py-1 rounded-full" style={{ background: "var(--color-primary-container)", color: "var(--color-on-primary-container)" }}>
                      Self‑paced: {quiz.selfPacedCode}
                    </span>
                  ) : (
                    <span className="text-[0.6875rem] font-bold px-3 py-1 rounded-full" style={{ background: "var(--color-surface-container)", color: "var(--color-on-surface-variant)" }}>
                      Not published
                    </span>
                  )}
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-xs font-semibold" style={{ color: "var(--color-primary)" }}>
                  Open quiz →
                </span>
                <span className="text-xs text-on-surface-variant">
                  {quiz.timePerQuestionSec ?? 30}s / question
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

