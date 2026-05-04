"use client";

import { motion } from "framer-motion";
import QuizOptionCard from "./QuizOptionCard";

/* ─────────────────────────────────────────────────────────
   QuizQuestionDisplay — LIVE state: question + options + timer
   ───────────────────────────────────────────────────────── */

const OPTION_COLORS = ["#0d5a54", "#c67b2a", "#c44a3a", "#6b4c9a"];

interface QuizQuestionDisplayProps {
  questionText: string;
  options: string[];
  questionIndex: number;
  totalQuestions: number;
  secondsRemaining?: number;
  questionType?: string;
}

export default function QuizQuestionDisplay({
  questionText,
  options,
  questionIndex,
  totalQuestions,
  secondsRemaining,
  questionType,
}: QuizQuestionDisplayProps) {
  const labels = ["A", "B", "C", "D"];
  const isTrueFalse =
    questionType?.toUpperCase() === "TRUE_FALSE" || questionType?.toUpperCase() === "TF";
  const displayOptions =
    isTrueFalse && (!options || options.length === 0)
      ? ["TRUE", "FALSE"]
      : options;

  const timerColor =
    (secondsRemaining ?? 0) <= 5
      ? "#c44a3a"
      : (secondsRemaining ?? 0) <= 10
        ? "#c67b2a"
        : "#0d5a54";

  const timerClass =
    (secondsRemaining ?? 0) <= 5
      ? "animate-bounce"
      : (secondsRemaining ?? 0) <= 10
        ? "animate-pulse"
        : "";

  return (
    <div className="fixed inset-0 flex flex-col pt-2" style={{ background: "#fffbf7" }}>
      {/* Top bar */}
      <header className="flex-shrink-0 px-4 md:px-8 py-3 md:py-4 flex items-center justify-between">
        <div>
          <p className="text-xs md:text-sm font-bold text-[#4a4542] uppercase tracking-wider">
            Question {questionIndex + 1} of {totalQuestions}
          </p>
        </div>
        {typeof secondsRemaining === "number" && (
          <div className="flex items-center gap-3">
            <div
              className={`text-4xl md:text-6xl lg:text-7xl font-black tabular-nums ${timerClass}`}
              style={{ color: timerColor }}
            >
              {secondsRemaining}
            </div>
            <div className="hidden md:block text-sm font-bold text-[#4a4542] uppercase">
              sec
            </div>
          </div>
        )}
      </header>

      {/* Question */}
      <main className="flex-1 flex flex-col justify-center px-4 md:px-12 lg:px-20 pb-4">
        <motion.h2
          key={questionIndex}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="text-center text-2xl md:text-4xl lg:text-5xl font-extrabold text-[#1a1a1a] leading-tight mb-6 md:mb-10"
        >
          {questionText}
        </motion.h2>

        {/* Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 max-w-5xl mx-auto w-full">
          {displayOptions.map((opt, idx) => (
            <QuizOptionCard
              key={isTrueFalse ? opt : idx}
              label={labels[idx] ?? String(idx + 1)}
              text={opt}
              color={OPTION_COLORS[idx % OPTION_COLORS.length]}
              isRevealed={false}
              isCorrect={false}
              index={idx}
            />
          ))}
        </div>
      </main>
    </div>
  );
}
