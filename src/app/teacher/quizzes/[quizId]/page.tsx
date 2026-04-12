import { api } from "@/lib/api";
import Link from "next/link";
import { redirect } from "next/navigation";
import TeacherQuizActions from "@/components/TeacherQuizActions";

export const dynamic = "force-dynamic";

export default async function TeacherQuizDetailsPage({
  params,
}: {
  params: Promise<{ quizId: string }>;
}) {
  try {
    await api.auth.getMe();
  } catch {
    redirect("/login");
  }

  const { quizId } = await params;
  const quiz = await api.quizzes.getById(quizId);

  return (
    <div className="pb-12 grid gap-6">
      <header className="flex items-start justify-between gap-4 flex-wrap">
        <div className="grid gap-2">
          <p className="m-0 text-label-sm text-on-surface-variant">Quiz Template</p>
          <h1 className="m-0 font-headline text-[clamp(2rem,4vw,2.75rem)] font-extrabold tracking-[-0.04em] text-primary">
            {quiz.title}
          </h1>
          <p className="text-[0.9375rem] text-on-surface-variant leading-[1.7] max-w-[44rem] m-0">
            {quiz.questionIds?.length ?? 0} questions • {quiz.timePerQuestionSec ?? 30}s per question
          </p>
        </div>
        <Link href="/teacher/quizzes" className="btn-ghost">
          Back to Quizzes
        </Link>
      </header>

      <section className="bg-surface-container-lowest rounded-lg p-8 shadow-sm">
        <h2 className="m-0 text-lg font-bold text-on-surface">Sharing</h2>
        <div className="mt-4 grid gap-3">
          {quiz.selfPacedEnabled && quiz.selfPacedCode ? (
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <p className="m-0 text-xs font-bold tracking-widest uppercase" style={{ color: "var(--color-primary)" }}>
                  Self‑paced code
                </p>
                <code className="block mt-2 text-2xl font-extrabold tracking-[0.15em] text-primary font-mono">
                  {quiz.selfPacedCode}
                </code>
                <p className="m-0 mt-2 text-xs text-on-surface-variant">
                  Student URL: <span className="font-semibold">/student/quizzes/{quiz.selfPacedCode}</span>
                </p>
              </div>
            </div>
          ) : (
            <p className="m-0 text-sm text-on-surface-variant">
              Not published for self‑paced yet.
            </p>
          )}
        </div>
      </section>

      <TeacherQuizActions quizId={quiz.id} initiallySelfPacedCode={quiz.selfPacedCode} initiallySelfPacedEnabled={!!quiz.selfPacedEnabled} />
    </div>
  );
}
