"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import AuthShell from "@/components/AuthShell";
import Loader from "@/components/Loader";

export default function StudentQuizJoinPage() {
  const router = useRouter();

  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const value = params.get("code");
      if (value) setCode(value);
    } catch {
      // ignore
    }
  }, []);

  const handleJoin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsPending(true);

    const trimmed = code.trim().toUpperCase();
    if (!trimmed) {
      setError("Enter a quiz code.");
      setIsPending(false);
      return;
    }

    try {
      await api.quizSessions.join(trimmed);
      router.push(`/student/quizzes/live/${trimmed}`);
      return;
    } catch (err: unknown) {
      // If join fails due to auth, route to login; otherwise assume self-paced code.
      const anyErr = err as unknown as { status?: number; message?: string };
      if (anyErr?.status === 401 || anyErr?.status === 403) {
        router.push("/student/login");
      } else {
        router.push(`/student/quizzes/${trimmed}`);
      }
      return;
    } finally {
      setIsPending(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Join a Quiz"
      title="Enter Quiz Code"
      description="Type the code shared by your teacher. If it’s a live quiz, you’ll join the lobby. If it’s self‑paced, you’ll start the quiz."
      alternatePrompt="Need to sign in?"
      alternateHref="/student/login"
      alternateLabel="Student login"
    >
      {error ? (
        <div className="mb-6 rounded-md bg-error/10 p-4 text-sm text-error">
          {error}
        </div>
      ) : null}

      <form onSubmit={handleJoin} className="grid gap-6">
        <div className="group relative">
          <label className="mb-2 block text-xs font-semibold tracking-wider text-on-surface-variant uppercase transition-colors group-focus-within:text-primary">
            Quiz Code
          </label>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
            placeholder="e.g. A3K9X7"
            className="w-full border-0 border-b border-outline-variant bg-surface-container-highest py-3 text-base text-on-surface transition-colors placeholder:text-on-surface-variant/50 focus:border-primary focus:outline-none focus:ring-0 font-mono tracking-[0.15em]"
            maxLength={12}
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-lg px-6 py-4 text-sm font-bold tracking-wider uppercase shadow-md transition-all ease-out hover:-translate-y-px hover:opacity-95 active:scale-95 disabled:cursor-wait disabled:opacity-75 disabled:hover:translate-y-0 disabled:active:scale-100"
          style={{ background: "linear-gradient(145deg, var(--color-primary), var(--color-primary-dim))", color: "var(--color-on-primary)" }}
        >
          {isPending ? <Loader size="sm" color="currentColor" label="Joining…" /> : "Continue"}
        </button>
      </form>
    </AuthShell>
  );
}
