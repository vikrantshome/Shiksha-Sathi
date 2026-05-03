import { notFound } from "next/navigation";
import StudentSelfPacedQuiz from "@/components/StudentSelfPacedQuiz";
import { api } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function StudentSelfPacedQuizPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  if (!code) notFound();

  let quiz;
  try {
    quiz = await api.quizzes.getByCode(code);
  } catch {
    notFound();
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--color-surface)" }}>
      <main className="pt-6 pb-24 px-4 md:px-8 lg:px-16">
        <div className="max-w-3xl mx-auto">
          <StudentSelfPacedQuiz quiz={quiz} />
        </div>
      </main>
    </div>
  );
}
