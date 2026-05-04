"use client";

/* ─────────────────────────────────────────────────────────
   QuizProgressBar — thin top bar showing question progress
   ───────────────────────────────────────────────────────── */

interface QuizProgressBarProps {
  current: number;
  total: number;
}

export default function QuizProgressBar({ current, total }: QuizProgressBarProps) {
  const pct = total > 0 ? (current / total) * 100 : 0;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-1.5" style={{ background: "var(--color-surface-container)" }}>
      <div
        className="h-full rounded-r-full transition-all duration-500 ease-out"
        style={{
          width: `${pct}%`,
          background: "var(--color-primary)",
        }}
      />
    </div>
  );
}
