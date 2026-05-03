"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import StudentSelfPacedQuiz from "@/components/StudentSelfPacedQuiz";
import { api } from "@/lib/api";
import { StudentQuizDTO } from "@/lib/api/types";
import Loader from "@/components/Loader";
import ErrorState from "@/components/ErrorState";

export default function StudentSelfPacedQuizPage() {
  const params = useParams();
  const [quiz, setQuiz] = useState<StudentQuizDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const code = params?.code as string;

  useEffect(() => {
    if (!code) {
      setError(true);
      setLoading(false);
      return;
    }

    async function fetchQuiz() {
      try {
        const data = await api.quizzes.getByCode(code);
        setQuiz(data);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    fetchQuiz();
  }, [code]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--color-surface)" }}>
        <Loader size="lg" label="Loading quiz..." />
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <ErrorState
        title="Quiz Not Found"
        message="The quiz code may be invalid or expired."
        type="not_found"
        onRetry={() => {
          setError(false);
          setLoading(true);
          api.quizzes.getByCode(code)
            .then(data => {
              setQuiz(data);
              setLoading(false);
            })
            .catch(() => {
              setError(true);
              setLoading(false);
            });
        }}
      />
    );
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