"use client";

import { motion } from "framer-motion";

/* ─────────────────────────────────────────────────────────
   QuizOptionCard — reusable option card for quiz display
   Supports LIVE (default) and REVEAL states with distribution
   ───────────────────────────────────────────────────────── */

interface QuizOptionCardProps {
  label: string;
  text: string;
  color: string;
  isRevealed: boolean;
  isCorrect: boolean;
  distribution?: {
    count: number;
    percentage: number;
  };
  index?: number;
}

export default function QuizOptionCard({
  label,
  text,
  color,
  isRevealed,
  isCorrect,
  distribution,
  index = 0,
}: QuizOptionCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.08, ease: "easeOut" }}
      className={`relative overflow-hidden rounded-2xl transition-all duration-500 ${
        isRevealed && isCorrect
          ? "scale-[1.03]"
          : ""
      }`}
      style={{
        background: isRevealed && !isCorrect ? "#f5f0eb" : "#ffffff",
        borderLeft: `8px solid ${color}`,
        opacity: isRevealed && !isCorrect ? 0.5 : 1,
        filter: isRevealed && !isCorrect ? "grayscale(60%)" : "none",
        boxShadow:
          isRevealed && isCorrect
            ? "0 0 40px rgba(27, 107, 71, 0.35), 0 4px 20px rgba(0,0,0,0.08)"
            : "0 2px 12px rgba(0,0,0,0.06)",
      }}
    >
      <div className="p-4 md:p-6 lg:p-8 flex items-center gap-4 md:gap-6">
        {/* Label circle */}
        <div
          className="w-10 h-10 md:w-14 md:h-14 lg:w-16 lg:h-16 rounded-full flex items-center justify-center flex-shrink-0 text-white font-black text-lg md:text-2xl lg:text-3xl"
          style={{ background: color }}
        >
          {label}
        </div>

        {/* Text */}
        <span className="flex-1 text-lg md:text-2xl lg:text-3xl font-bold text-[#1a1a1a] leading-tight">
          {text}
        </span>

        {/* Correct checkmark */}
        {isRevealed && isCorrect && (
          <motion.svg
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
            className="w-8 h-8 md:w-12 md:h-12 flex-shrink-0"
            style={{ color: "#1B6B47" }}
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
          </motion.svg>
        )}
      </div>

      {/* Distribution bar */}
      {isRevealed && distribution && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="px-4 md:px-6 lg:px-8 pb-3 md:pb-4 lg:pb-5"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs md:text-sm font-semibold text-[#4a4542]">
              {distribution.count} response{distribution.count !== 1 ? "s" : ""}
            </span>
            <span className="text-xs md:text-sm font-bold text-[#4a4542]">
              {distribution.percentage}%
            </span>
          </div>
          <div className="h-2 md:h-3 rounded-full overflow-hidden" style={{ background: "var(--color-surface-container)" }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${distribution.percentage}%` }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
              className="h-full rounded-full"
              style={{ background: color }}
            />
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
