"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { api } from "@/lib/api";
import Loader from "@/components/Loader";

export default function TeacherQuizActions({
  quizId,
  initiallySelfPacedEnabled,
  initiallySelfPacedCode,
}: {
  quizId: string;
  initiallySelfPacedEnabled: boolean;
  initiallySelfPacedCode?: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [selfPacedEnabled, setSelfPacedEnabled] = useState(initiallySelfPacedEnabled);
  const [selfPacedCode, setSelfPacedCode] = useState(initiallySelfPacedCode);

  const handlePublishSelfPaced = () => {
    startTransition(async () => {
      setError(null);
      try {
        const updated = await api.quizzes.publishSelfPaced(quizId);
        setSelfPacedEnabled(!!updated.selfPacedEnabled);
        setSelfPacedCode(updated.selfPacedCode);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to publish self-paced code.");
      }
    });
  };

  const handleStartLive = () => {
    startTransition(async () => {
      setError(null);
      try {
        const started = await api.quizzes.startSession(quizId);
        router.push(`/teacher/quizzes/session/${started.sessionId}`);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to start session.");
      }
    });
  };

  return (
    <section className="bg-surface-container-lowest rounded-lg p-8 shadow-sm">
      <h2 className="m-0 text-lg font-bold text-on-surface">Actions</h2>
      <p className="mt-2 mb-0 text-sm text-on-surface-variant leading-[1.7]">
        Publish for self‑paced practice, or start a live session to host in class.
      </p>

      {error ? (
        <div className="mt-5 rounded-md border border-error/20 bg-error-container/50 py-3 px-4 text-[0.8125rem] leading-[1.6] text-on-surface">
          {error}
        </div>
      ) : null}

      <div className="mt-6 flex gap-3 flex-wrap items-center">
        {!selfPacedEnabled || !selfPacedCode ? (
          <button
            type="button"
            onClick={handlePublishSelfPaced}
            disabled={isPending}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-sm text-sm font-bold transition-all active:scale-95 disabled:opacity-75 disabled:cursor-wait"
            style={{ background: "var(--color-surface-container)", color: "var(--color-on-surface)" }}
          >
            {isPending ? <Loader size="sm" color="currentColor" label="Publishing…" /> : "Publish Self‑Paced Code"}
          </button>
        ) : (
          <span className="text-xs font-bold px-3 py-2 rounded-full" style={{ background: "var(--color-primary-container)", color: "var(--color-on-primary-container)" }}>
            Self‑paced: {selfPacedCode}
          </span>
        )}

        <button
          type="button"
          onClick={handleStartLive}
          disabled={isPending}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-sm text-sm font-bold transition-all active:scale-95 disabled:opacity-75 disabled:cursor-wait"
          style={{ background: "linear-gradient(145deg, var(--color-primary), var(--color-primary-dim))", color: "var(--color-on-primary)" }}
        >
          {isPending ? <Loader size="sm" color="currentColor" label="Starting…" /> : "Start Live Session"}
        </button>

        <Link href="/teacher/question-bank" className="btn-ghost">
          Add More Questions
        </Link>
      </div>
    </section>
  );
}

