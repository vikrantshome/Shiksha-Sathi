"use client";

import { motion } from "framer-motion";
import type { LeaderboardEntryDTO } from "@/lib/api/types";
import Leaderboard from "../Leaderboard";

/* ─────────────────────────────────────────────────────────
   FinalPodium — ENDED state with 3D-style podium + leaderboard
   ───────────────────────────────────────────────────────── */

interface FinalPodiumProps {
  entries: LeaderboardEntryDTO[];
  quizTitle: string;
}

export default function FinalPodium({ entries, quizTitle }: FinalPodiumProps) {
  const top3 = entries.slice(0, 3);

  const podiumData = [
    { rank: 2, height: "60%", color: "#9ca3af", label: "2nd", entry: top3[1] },
    { rank: 1, height: "85%", color: "#f59e0b", label: "1st", entry: top3[0] },
    { rank: 3, height: "45%", color: "#b45309", label: "3rd", entry: top3[2] },
  ];

  return (
    <div className="fixed inset-0 flex flex-col overflow-auto" style={{ background: "radial-gradient(ellipse at center, #ffffff 0%, #fff5e6 100%)" }}>
      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center pt-8 md:pt-12 pb-4 md:pb-6"
      >
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-[#1a1a1a]">
          🎉 Quiz Complete!
        </h1>
        <p className="text-lg md:text-2xl text-[#4a4542] mt-2 font-medium">{quizTitle}</p>
      </motion.div>

      {/* Podium */}
      <div className="flex-shrink-0 flex items-end justify-center gap-3 md:gap-6 px-4 pb-6 md:pb-10" style={{ minHeight: "220px" }}>
        {podiumData.map((p, idx) => (
          <motion.div
            key={p.rank}
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{
              duration: 0.6,
              delay: idx * 0.15,
              ease: [0.68, -0.55, 0.265, 1.55],
            }}
            className="flex flex-col items-center"
            style={{ transformOrigin: "bottom", width: p.rank === 1 ? "140px" : "110px" }}
          >
            {/* Name + Score above bar */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + idx * 0.1 }}
              className="text-center mb-2"
            >
              {p.entry ? (
                <>
                  <p className="text-sm md:text-base font-bold text-[#1a1a1a] truncate max-w-[120px]">
                    {p.entry.displayName}
                  </p>
                  <p className="text-lg md:text-xl font-black" style={{ color: p.color }}>
                    {p.entry.score}
                  </p>
                </>
              ) : (
                <p className="text-sm text-[#4a4542]">—</p>
              )}
            </motion.div>

            {/* Bar */}
            <div
              className="w-full rounded-t-xl flex items-end justify-center pb-2"
              style={{
                height: p.height,
                background: `linear-gradient(180deg, ${p.color}22 0%, ${p.color}55 100%)`,
                border: `2px solid ${p.color}`,
                borderBottom: "none",
              }}
            >
              <span className="text-xl md:text-2xl font-black text-white drop-shadow-md">
                {p.label}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Full Leaderboard */}
      <div className="flex-1 px-4 md:px-8 pb-8 max-w-3xl mx-auto w-full">
        <Leaderboard entries={entries} variant="display" maxEntries={10} />
      </div>
    </div>
  );
}
