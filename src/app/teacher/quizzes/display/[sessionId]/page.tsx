"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { api } from "@/lib/api";
import type { TeacherQuizSessionStateDTO } from "@/lib/api/types";

import QuizProgressBar from "@/components/quiz/display/QuizProgressBar";
import QuizLobbyScreen from "@/components/quiz/display/QuizLobbyScreen";
import CountdownOverlay from "@/components/quiz/display/CountdownOverlay";
import QuizQuestionDisplay from "@/components/quiz/display/QuizQuestionDisplay";
import AnswerRevealDisplay from "@/components/quiz/display/AnswerRevealDisplay";
import InterstitialLeaderboard from "@/components/quiz/display/InterstitialLeaderboard";
import FinalPodium from "@/components/quiz/display/FinalPodium";

/* ─────────────────────────────────────────────────────────
   Quiz Display Page — Projector / Big Screen Mode
   Warm light theme, colorful options, countdown,
   interstitial leaderboard, final podium.
   ───────────────────────────────────────────────────────── */

export default function QuizDisplayPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const resolvedParams = Promise.resolve(params);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [state, setState] = useState<TeacherQuizSessionStateDTO | null>(null);
  const [loading, setLoading] = useState(true);

  /* UI state */
  const [showCountdown, setShowCountdown] = useState(false);
  const [showInterstitial, setShowInterstitial] = useState(false);
  const prevStatusRef = useRef<string>("");
  const interstitialTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    resolvedParams.then((p) => setSessionId(p.sessionId));
  }, [resolvedParams]);

  const loadState = useCallback(async () => {
    if (!sessionId) return;
    try {
      const data = await api.quizSessions.getTeacherState(sessionId);
      setState(data);
    } catch {
      // Session ended or error
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    if (!sessionId) return;
    loadState();
    const interval = setInterval(loadState, 2000);
    return () => clearInterval(interval);
  }, [sessionId, loadState]);

  /* Detect status transitions and manage UI overlays */
  useEffect(() => {
    if (!state) return;
    const prev = prevStatusRef.current;
    const curr = state.status;

    /* LOBBY → LIVE : trigger countdown */
    if (prev === "LOBBY" && curr === "LIVE") {
      setShowCountdown(true);
    }

    /* REVEAL : show interstitial after 2s, hide after 6s */
    if (curr === "REVEAL") {
      if (interstitialTimerRef.current) clearTimeout(interstitialTimerRef.current);
      const showTimer = setTimeout(() => setShowInterstitial(true), 2000);
      const hideTimer = setTimeout(() => setShowInterstitial(false), 6000);
      interstitialTimerRef.current = hideTimer;
      return () => {
        clearTimeout(showTimer);
        clearTimeout(hideTimer);
      };
    }

    /* LIVE or ENDED : reset interstitial */
    if (curr === "LIVE" || curr === "ENDED") {
      setShowInterstitial(false);
      if (interstitialTimerRef.current) {
        clearTimeout(interstitialTimerRef.current);
        interstitialTimerRef.current = null;
      }
    }

    prevStatusRef.current = curr;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state?.status]);

  /* Cleanup timers on unmount */
  useEffect(() => {
    return () => {
      if (interstitialTimerRef.current) {
        clearTimeout(interstitialTimerRef.current);
      }
    };
  }, []);

  if (loading || !state) {
    return (
      <div className="fixed inset-0 flex items-center justify-center" style={{ background: "#fffbf7" }}>
        <div className="text-center">
          <div className="text-4xl md:text-6xl font-black text-[#0d5a54] mb-4">Loading…</div>
          <div className="text-xl md:text-2xl text-[#4a4542]">Preparing quiz</div>
        </div>
      </div>
    );
  }

  const status = state.status;
  const isLobby = status === "LOBBY";
  const isLive = status === "LIVE";
  const isReveal = status === "REVEAL";
  const isEnded = status === "ENDED";

  const question = state.currentQuestion;
  const qIndex = state.currentQuestionIndex ?? 0;
  const qTotal = state.totalQuestions ?? 0;

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden" style={{ background: "#fffbf7" }}>
      {/* Progress bar */}
      {!isLobby && !isEnded && (
        <QuizProgressBar
          current={isReveal ? qIndex + 1 : qIndex + 1}
          total={qTotal}
        />
      )}

      {/* Countdown overlay */}
      {showCountdown && (
        <CountdownOverlay
          onComplete={() => setShowCountdown(false)}
        />
      )}

      {/* Main content by status */}
      {isLobby && (
        <QuizLobbyScreen
          quizTitle={state.quizTitle || "Quiz"}
          sessionCode={state.sessionCode}
          participantCount={state.participants?.length ?? 0}
          totalQuestions={qTotal}
        />
      )}

      {isLive && question && (
        <QuizQuestionDisplay
          questionText={question.text}
          options={question.options ?? []}
          questionIndex={qIndex}
          totalQuestions={qTotal}
          secondsRemaining={state.secondsRemaining}
          questionType={question.type}
        />
      )}

      {isReveal && question && (
        <AnswerRevealDisplay
          questionText={question.text}
          options={question.options ?? []}
          correctAnswer={state.correctAnswer}
          correctAnswers={state.correctAnswers}
          answerDistribution={state.answerDistribution}
          totalResponses={state.totalResponses}
          questionIndex={qIndex}
          totalQuestions={qTotal}
          questionType={question.type}
        />
      )}

      {isEnded && (
        <FinalPodium
          entries={state.leaderboard ?? []}
          quizTitle={state.quizTitle || "Quiz"}
        />
      )}

      {/* Persistent join code — visible during quiz */}
      {!isLobby && !isEnded && (
        <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-30">
          <div
            className="px-4 py-2 md:px-5 md:py-2.5 rounded-xl text-sm md:text-base font-bold font-mono tracking-wider"
            style={{
              background: "rgba(255,255,255,0.92)",
              color: "#0d5a54",
              boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
              border: "1px solid rgba(13,90,84,0.15)",
            }}
          >
            Join: <span className="text-lg md:text-xl">{state.sessionCode}</span>
          </div>
        </div>
      )}

      {/* Interstitial leaderboard overlay */}
      <InterstitialLeaderboard
        entries={state.leaderboard ?? []}
        visible={showInterstitial}
      />
    </div>
  );
}
