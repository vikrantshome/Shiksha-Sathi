"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { LeaderboardEntryDTO } from "@/lib/api/types";

/* ─────────────────────────────────────────────────────────
   InterstitialLeaderboard — bottom overlay showing top 5
   Slides up after reveal, auto-dismisses before next question
   ───────────────────────────────────────────────────────── */

function medalIcon(rank: number) {
  if (rank === 1) return "👑";
  if (rank === 2) return "🥈";
  if (rank === 3) return "🥉";
  return null;
}

function rankBg(rank: number): string {
  if (rank === 1) return "rgba(245, 158, 11, 0.12)";
  if (rank === 2) return "rgba(156, 163, 175, 0.12)";
  if (rank === 3) return "rgba(180, 83, 9, 0.12)";
  return "transparent";
}

function rankBorder(rank: number): string {
  if (rank === 1) return "2px solid rgba(245, 158, 11, 0.4)";
  if (rank === 2) return "2px solid rgba(156, 163, 175, 0.4)";
  if (rank === 3) return "2px solid rgba(180, 83, 9, 0.4)";
  return "1px solid transparent";
}

interface InterstitialLeaderboardProps {
  entries: LeaderboardEntryDTO[];
  visible: boolean;
}

export default function InterstitialLeaderboard({
  entries,
  visible,
}: InterstitialLeaderboardProps) {
  const topFive = entries.slice(0, 5);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
          className="fixed bottom-0 left-0 right-0 z-40 rounded-t-3xl shadow-2xl"
          style={{
            background: "#ffffff",
            boxShadow: "0 -8px 40px rgba(0,0,0,0.12)",
            maxHeight: "65vh",
          }}
        >
          {/* Header */}
          <div className="px-6 md:px-10 pt-6 pb-4 text-center">
            <h3 className="text-2xl md:text-4xl font-black text-[#1a1a1a]">
              🏆 Top Players
            </h3>
            <p className="text-sm md:text-base text-[#4a4542] mt-1">
              Question Results
            </p>
          </div>

          {/* Entries */}
          <div className="px-4 md:px-8 pb-8 space-y-2 md:space-y-3 max-w-3xl mx-auto">
            <AnimatePresence>
              {topFive.map((entry, idx) => {
                const icon = medalIcon(entry.rank);
                return (
                  <motion.div
                    key={`${entry.rank}-${entry.displayName}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3, delay: idx * 0.1 }}
                    className="flex items-center justify-between rounded-xl px-5 py-3 md:py-4"
                    style={{
                      background: rankBg(entry.rank),
                      border: rankBorder(entry.rank),
                    }}
                  >
                    <div className="flex items-center gap-3 md:gap-4">
                      <span className="text-xl md:text-2xl">{icon ?? `#${entry.rank}`}</span>
                      <span className="text-base md:text-xl font-bold text-[#1a1a1a]">
                        {entry.displayName}
                      </span>
                    </div>
                    <span className="text-lg md:text-2xl font-black text-[#0d5a54]">
                      {entry.score}
                    </span>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {topFive.length === 0 && (
              <p className="text-center text-[#4a4542] py-4">No scores yet</p>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
