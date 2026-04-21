"use client";

import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import type { TeacherQuizSessionStateDTO } from "@/lib/api/types";

/* ─────────────────────────────────────────────────────────
   Quiz Display Page - Projector Mode
   Optimized for big screen display in classroom.
   Shows questions, options, timer, and correct answers.
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

  if (loading || !state) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="text-center">
          <div className="text-6xl font-bold mb-4">Loading...</div>
          <div className="text-2xl opacity-70">Preparing quiz</div>
        </div>
      </div>
    );
  }

  const question = state.currentQuestion;
  const isRevealed = state.status === "REVEAL";
  const showTimer = typeof state.secondsRemaining === "number";

  // Normalize question type for comparisons (handle case variations and null)
  const questionType = question?.type?.toUpperCase() ?? "";
  const isTrueFalse = questionType === "TRUE_FALSE" || questionType === "TF";
  const isMCQ = questionType === "MCQ" || questionType === "MULTIPLE_CHOICE";

  // Default answers for display
  const defaultOptions = ["A", "B", "C", "D"];

  return (
    <div className="fixed inset-0 w-full h-full bg-black text-white overflow-hidden flex flex-col">
      {/* Header - compact */}
      <header className="flex-shrink-0 px-4 py-2 flex justify-between items-center">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-emerald-400">
            {state.quizTitle || "Quiz"}
          </h1>
          <p className="text-sm md:text-base opacity-70">
            Q{state.currentQuestionIndex + 1}/{state.totalQuestions}
          </p>
        </div>
        
        {/* Timer */}
        {showTimer && (
          <div className="text-center">
            <div 
              className={`text-4xl md:text-6xl font-black tabular-nums ${
                (state.secondsRemaining ?? 0) <= 5 ? "text-red-500 animate-pulse" : "text-white"
              }`}
            >
              {state.secondsRemaining}
            </div>
            <div className="text-xs md:text-sm opacity-50 uppercase tracking-widest">
              sec
            </div>
          </div>
        )}
      </header>

      {/* Question */}
      {question ? (
        <main className="flex-1 flex flex-col justify-center px-2 py-4 overflow-auto">
          <div className="text-center mb-2">
            <div className="text-lg md:text-xl font-semibold inline-block px-3 py-1 bg-gray-900 rounded-lg">
              {isMCQ ? "Multiple Choice" : isTrueFalse ? "True / False" : question.type}
            </div>
          </div>
          
          <h2 className="text-xl md:text-4xl font-bold text-center leading-tight mb-4 px-2">
            {question.text}
          </h2>

          {/* True/False - show special TRUE/FALSE buttons */}
          {isTrueFalse && (
            <div className="grid grid-cols-2 gap-3 max-w-3xl mx-auto w-full">
              {["TRUE", "FALSE"].map((option) => {
                const isCorrect = state.correctAnswer === option;
                
                return (
                  <div
                    key={option}
                    className={`p-6 md:p-10 rounded-2xl text-2xl md:text-4xl font-bold flex items-center justify-center transition-all ${
                      isRevealed && isCorrect
                        ? "bg-emerald-600 text-white scale-105"
                        : isRevealed
                          ? "bg-gray-800 opacity-50"
                          : "bg-gray-800 hover:bg-gray-700"
                    }`}
                  >
                    {option}
                    {isRevealed && isCorrect && (
                      <svg className="w-10 h-10 md:w-14 md:h-14 ml-3" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                      </svg>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Options with labels - show grid for MCQ/MULTIPLE_CHOICE type with valid options */}
          {!isTrueFalse && question.options && question.options.length > 0 && (
            <div className="grid grid-cols-2 gap-2 md:gap-3 max-w-4xl mx-auto w-full">
              {question.options.map((option, idx) => {
                const optionLabel = defaultOptions[idx] || String(idx + 1);
                const isCorrect = state.correctAnswer === optionLabel;
                
                return (
                  <div
                    key={idx}
                    className={`p-3 md:p-6 rounded-xl text-lg md:text-2xl font-bold flex items-center gap-3 transition-all ${
                      isRevealed && isCorrect
                        ? "bg-emerald-600 text-white scale-105"
                        : isRevealed
                          ? "bg-gray-800 opacity-50"
                          : "bg-gray-800 hover:bg-gray-700"
                    }`}
                  >
                    <span className="w-8 h-8 md:w-12 md:h-12 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                      {optionLabel}
                    </span>
                    <span className="flex-1">{option}</span>
                    {isRevealed && isCorrect && (
                      <svg className="w-6 h-6 md:w-10 md:h-10" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                      </svg>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </main>
      ) : (
        /* Lobby state */
        <main className="flex-1 flex flex-col items-center justify-center">
          <div className="text-center">
            <div className="text-4xl md:text-6xl font-bold text-emerald-400 mb-6">
              Ready!
            </div>
            <div className="text-xl md:text-2xl opacity-70">
              Press Start on host console to begin
            </div>
          </div>
        </main>
      )}

      {/* Footer - compact */}
      <footer className="flex-shrink-0 px-4 py-2 flex justify-between items-center opacity-50">
        <div className="text-base">
          Code: <span className="font-bold text-emerald-400">{state.sessionCode}</span>
        </div>
        <div className="text-base">
          {state.participants?.length ?? 0} watching
        </div>
      </footer>
    </div>
  );
}