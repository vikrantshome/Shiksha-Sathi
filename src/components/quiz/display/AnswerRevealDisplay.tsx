"use client";

import { motion } from "framer-motion";
import QuizOptionCard from "./QuizOptionCard";

/* ─────────────────────────────────────────────────────────
   AnswerRevealDisplay — REVEAL state with correct highlight
   and answer distribution bars
   ───────────────────────────────────────────────────────── */

const OPTION_COLORS = ["#0d5a54", "#c67b2a", "#c44a3a", "#6b4c9a"];

interface AnswerRevealDisplayProps {
  questionText: string;
  options: string[];
  correctAnswer?: string;
  correctAnswers?: string[];
  answerDistribution?: Record<string, number>;
  totalResponses?: number;
  questionIndex: number;
  totalQuestions: number;
  questionType?: string;
}

export default function AnswerRevealDisplay({
  questionText,
  options,
  correctAnswer,
  correctAnswers,
  answerDistribution,
  totalResponses,
  questionIndex,
  totalQuestions,
  questionType,
}: AnswerRevealDisplayProps) {
  const labels = ["A", "B", "C", "D"];
  const isTrueFalse =
    questionType?.toUpperCase() === "TRUE_FALSE" || questionType?.toUpperCase() === "TF";
  const displayOptions =
    isTrueFalse && (!options || options.length === 0)
      ? ["TRUE", "FALSE"]
      : options;

  const correctSet = new Set<string>([
    ...(correctAnswers ?? []),
    ...(correctAnswer ? [correctAnswer] : []),
  ]);

  return (
    <div className="fixed inset-0 flex flex-col pt-2" style={{ background: "#fffbf7" }}>
      {/* Top bar */}
      <header className="flex-shrink-0 px-4 md:px-8 py-3 md:py-4 flex items-center justify-between">
        <div>
          <p className="text-xs md:text-sm font-bold text-[#4a4542] uppercase tracking-wider">
            Question {questionIndex + 1} of {totalQuestions}
          </p>
        </div>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="px-4 py-2 rounded-full text-sm md:text-base font-bold"
          style={{ background: "#C8E6D5", color: "#1B6B47" }}
        >
          {correctAnswers && correctAnswers.length > 0 ? "Correct Answers Revealed" : "Correct Answer Revealed"}
        </motion.div>
      </header>

      {/* Question */}
      <main className="flex-1 flex flex-col justify-center px-4 md:px-12 lg:px-20 pb-4">
        <h2 className="text-center text-2xl md:text-4xl lg:text-5xl font-extrabold text-[#1a1a1a] leading-tight mb-6 md:mb-10">
          {questionText}
        </h2>

        {/* Options with reveal state */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 max-w-5xl mx-auto w-full">
          {displayOptions.map((opt, idx) => {
            const label = labels[idx] ?? String(idx + 1);
            const isCorrect = correctSet.has(label) || correctSet.has(opt);
            // Robust distribution lookup: try text, label, and lowercase variants
            const distRaw = answerDistribution ?? {};
            const count =
              distRaw[opt] ??
              distRaw[label] ??
              distRaw[opt.toLowerCase()] ??
              distRaw[label.toLowerCase()] ??
              0;
            const pct =
              (totalResponses ?? 0) > 0
                ? Math.round((count / (totalResponses ?? 1)) * 100)
                : 0;

            return (
              <QuizOptionCard
                key={isTrueFalse ? opt : idx}
                label={label}
                text={opt}
                color={OPTION_COLORS[idx % OPTION_COLORS.length]}
                isRevealed={true}
                isCorrect={isCorrect}
                distribution={{ count, percentage: pct }}
                index={idx}
              />
            );
          })}
        </div>
      </main>
    </div>
  );
}
