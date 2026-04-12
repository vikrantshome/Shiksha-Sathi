"use client";

import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

export default function CountdownRing({
  secondsRemaining,
  totalSeconds,
  size = 44,
}: {
  secondsRemaining?: number;
  totalSeconds?: number;
  size?: number;
}) {
  const [maxSeconds, setMaxSeconds] = useState<number | null>(null);

  useEffect(() => {
    if (typeof totalSeconds === "number" && totalSeconds > 0) {
      setMaxSeconds(totalSeconds);
      return;
    }
    if (typeof secondsRemaining === "number") {
      setMaxSeconds((prev) => (prev == null ? secondsRemaining : prev));
    }
  }, [secondsRemaining, totalSeconds]);

  const normalizedMax = maxSeconds && maxSeconds > 0 ? maxSeconds : 30;
  const remaining = typeof secondsRemaining === "number" ? Math.max(secondsRemaining, 0) : null;

  const { radius, circumference, progress } = useMemo(() => {
    const stroke = 4;
    const r = (size - stroke) / 2;
    const c = 2 * Math.PI * r;
    const p = remaining == null ? 0 : Math.max(0, Math.min(1, remaining / normalizedMax));
    return { radius: r, circumference: c, progress: p };
  }, [normalizedMax, remaining, size]);

  const dashOffset = circumference * (1 - progress);

  const urgent = remaining != null && remaining <= 5;

  return (
    <div className="inline-flex items-center gap-3">
      <div
        className="relative grid place-items-center rounded-full"
        style={{
          width: size,
          height: size,
          background: urgent
            ? "var(--color-error-container)"
            : "var(--color-surface-container-low)",
        }}
        aria-label="Countdown"
      >
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="var(--color-outline-variant)"
            strokeWidth="4"
            fill="none"
            opacity={0.35}
          />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={urgent ? "var(--color-error)" : "var(--color-primary)"}
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            animate={{ strokeDashoffset: dashOffset }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            style={{
              transformOrigin: "50% 50%",
              transform: "rotate(-90deg)",
            }}
          />
        </svg>
        <div className="absolute inset-0 grid place-items-center">
          <span
            className="text-xs font-extrabold tabular-nums"
            style={{
              color: urgent ? "var(--color-error)" : "var(--color-on-surface)",
            }}
          >
            {remaining == null ? "—" : remaining}
          </span>
        </div>
      </div>
      <div className="hidden sm:block">
        <p className="m-0 text-[0.625rem] font-bold tracking-widest uppercase" style={{ color: "var(--color-on-surface-variant)" }}>
          Time
        </p>
        <p className="m-0 mt-1 text-sm font-semibold" style={{ color: "var(--color-on-surface)" }}>
          {remaining == null ? "Waiting" : `${remaining}s left`}
        </p>
      </div>
    </div>
  );
}

