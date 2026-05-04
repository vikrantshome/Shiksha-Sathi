"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { LeaderboardEntryDTO } from "@/lib/api/types";

function medal(rank: number) {
  if (rank === 1) return "🥇";
  if (rank === 2) return "🥈";
  if (rank === 3) return "🥉";
  return null;
}

export default function Leaderboard({
  entries,
  title = "Leaderboard",
  variant = "default",
  maxEntries,
}: {
  entries: LeaderboardEntryDTO[];
  title?: string;
  variant?: "default" | "display";
  maxEntries?: number;
}) {
  const displayEntries = maxEntries ? entries.slice(0, maxEntries) : entries;
  const isDisplay = variant === "display";

  const content = (
    <div className={isDisplay ? "grid gap-3" : "mt-5 grid gap-2"}>
      {displayEntries.length === 0 ? (
        <p className="m-0 text-sm text-on-surface-variant">No scores yet.</p>
      ) : (
        <AnimatePresence initial={false}>
          {displayEntries.map((entry, idx) => {
            const m = medal(entry.rank);
            return (
              <motion.div
                key={`${entry.rank}-${entry.displayName}`}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25, delay: isDisplay ? idx * 0.08 : 0 }}
                className={`flex items-center justify-between rounded-md ${isDisplay ? "px-5 py-4" : "px-4 py-3"}`}
                style={{
                  background: entry.isMe
                    ? "var(--color-primary-container)"
                    : "var(--color-surface-container-low)",
                  border: entry.isMe ? "1px solid rgba(44,95,110,0.25)" : "1px solid transparent",
                }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className={`font-extrabold tabular-nums ${isDisplay ? "text-base" : "text-xs"}`} style={{ color: "var(--color-primary)" }}>
                    {m ?? `#${entry.rank}`}
                  </span>
                  <span
                    className={`font-semibold truncate ${isDisplay ? "text-lg" : "text-sm"}`}
                    style={{
                      color: entry.isMe ? "var(--color-on-primary-container)" : "var(--color-on-surface)",
                    }}
                  >
                    {entry.displayName}
                  </span>
                  {entry.isMe ? (
                    <span className="text-[0.625rem] font-bold uppercase tracking-widest" style={{ color: "var(--color-primary)" }}>
                      You
                    </span>
                  ) : null}
                </div>
                <span
                  className={`font-extrabold tabular-nums ${isDisplay ? "text-lg" : "text-sm"}`}
                  style={{
                    color: entry.isMe ? "var(--color-on-primary-container)" : "var(--color-on-surface)",
                  }}
                >
                  {entry.score}
                </span>
              </motion.div>
            );
          })}
        </AnimatePresence>
      )}
    </div>
  );

  if (isDisplay) {
    return content;
  }

  return (
    <section className="bg-surface-container-lowest rounded-lg p-8 shadow-sm">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="m-0 text-xs font-bold tracking-widest uppercase" style={{ color: "var(--color-primary)" }}>
            {title}
          </p>
          <h2 className="m-0 mt-2 text-lg font-extrabold tracking-tight text-on-surface">
            Top Scores
          </h2>
        </div>
        <span className="text-xs font-semibold text-on-surface-variant">
          Live ranking
        </span>
      </div>
      {content}
    </section>
  );
}

