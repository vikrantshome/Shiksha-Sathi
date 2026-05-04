"use client";

import { motion } from "framer-motion";

/* ─────────────────────────────────────────────────────────
   QuizLobbyScreen — warm light lobby with big code display
   ───────────────────────────────────────────────────────── */

interface QuizLobbyScreenProps {
  quizTitle: string;
  sessionCode: string;
  participantCount: number;
  totalQuestions: number;
}

export default function QuizLobbyScreen({
  quizTitle,
  sessionCode,
  participantCount,
  totalQuestions,
}: QuizLobbyScreenProps) {
  return (
    <div className="fixed inset-0 flex flex-col" style={{ background: "radial-gradient(ellipse at center, #ffffff 0%, #fffbf7 100%)" }}>
      {/* Top bar */}
      <header className="flex-shrink-0 px-6 py-4 md:px-10 md:py-6 flex items-center justify-between">
        <h1 className="text-xl md:text-3xl lg:text-4xl font-bold text-[#1a1a1a] truncate max-w-[60%]">
          {quizTitle}
        </h1>
        <div className="flex items-center gap-2 px-4 py-2 rounded-full" style={{ background: "var(--color-surface-container)" }}>
          <span className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ background: "#1B6B47" }} />
          <span className="text-sm md:text-base font-bold text-[#1a1a1a]">
            {participantCount} joined
          </span>
        </div>
      </header>

      {/* Center content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm md:text-base text-[#4a4542] mb-4 md:mb-6"
        >
          Join at shiksha-sathi.com
        </motion.p>

        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="inline-flex items-center gap-3 px-8 py-5 md:px-12 md:py-8 rounded-3xl"
          style={{
            background: "#ffffff",
            boxShadow: "0 8px 40px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)",
            border: "2px solid var(--color-outline-variant)",
          }}
        >
          <span className="text-sm md:text-base font-semibold text-[#4a4542] uppercase tracking-wider">
            Code
          </span>
          <span className="text-5xl md:text-7xl lg:text-8xl font-black tracking-[0.15em] text-[#0d5a54] font-mono">
            {sessionCode}
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6 md:mt-10 flex items-center gap-2 text-lg md:text-2xl font-medium text-[#4a4542]"
        >
          Waiting for host to start
          <span className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                animate={{ y: [0, -6, 0] }}
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                  delay: i * 0.15,
                  ease: "easeInOut",
                }}
                className="text-[#0d5a54]"
              >
                .
              </motion.span>
            ))}
          </span>
        </motion.div>
      </main>

      {/* Bottom bar */}
      <footer className="flex-shrink-0 px-6 py-4 md:px-10 md:py-6 text-center">
        <p className="text-sm md:text-base text-[#4a4542]">
          <span className="font-bold">{totalQuestions}</span> questions ready
        </p>
      </footer>
    </div>
  );
}
