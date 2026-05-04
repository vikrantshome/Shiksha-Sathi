"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface QuizSuccessCelebrationProps {
  quizTitle: string;
  selfPacedCode?: string;
  quizId: string;
}

export default function QuizSuccessCelebration({ quizTitle, selfPacedCode, quizId }: QuizSuccessCelebrationProps) {
  const [showConfetti, setShowConfetti] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Trigger confetti after mount
    const timer = setTimeout(() => setShowConfetti(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const copyLink = () => {
    if (selfPacedCode) {
      const link = `${window.location.origin}/student/quizzes/${selfPacedCode}`;
      navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Confetti Particles - Optimized for performance
  const confettiCount = 25; // Reduced from 50 for better performance
  const confettiColors = ["#0d5a54", "#12423f", "#bcece6", "#ffd700", "#ff6b6b", "#4ecdc4"];

  // Use CSS animation instead of JS for better performance
  const getAnimationDelay = (i: number) => `${(i % 5) * 0.2}s`;
  const getAnimationDuration = (i: number) => `${2 + (i % 3)}s`;

  return (
    <div className="relative animate-fade-in">
      {/* Confetti Particles - Optimized */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
          {Array.from({ length: confettiCount }).map((_, i) => (
            <div
              key={i}
              className="absolute animate-confetti"
              style={{
                left: `${5 + (i * 3) % 90}%`,
                top: "-20px",
                backgroundColor: confettiColors[i % confettiColors.length],
                width: `${4 + (i % 4) * 2}px`,
                height: `${4 + (i % 4) * 2}px`,
                borderRadius: i % 2 === 0 ? "50%" : "2px",
                animationDelay: getAnimationDelay(i),
                animationDuration: getAnimationDuration(i),
              }}
            />
          ))}
        </div>
      )}

      {/* Main Card */}
      <div className="relative overflow-hidden rounded-2xl border border-outline-variant/20 bg-surface-container-lowest shadow-xl">
        {/* Celebration Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary-container/30 via-transparent to-transparent opacity-50" />

        <div className="relative z-10 px-8 py-12 text-center">
          {/* Owl Mascot SVG */}
          <div className="w-24 h-24 mx-auto mb-6 relative">
            <svg viewBox="0 0 120 120" className="w-full h-full animate-bounce-in">
              {/* Graduation Cap */}
              <g className="animate-bounce" style={{ animationDelay: "0.3s", animationDuration: "1.5s", animationIterationCount: "2" }}>
                <polygon points="60,10 90,30 60,50 30,30" fill="#12423f" />
                <rect x="40" y="50" width="40" height="6" fill="#0d5a54" rx="2" />
                <circle cx="60" cy="50" r="4" fill="#ffd700" />
                <line x1="60" y1="50" x2="75" y2="65" stroke="#ffd700" strokeWidth="2" />
                <circle cx="75" cy="65" r="3" fill="#ffd700" />
              </g>

              {/* Owl Body */}
              <ellipse cx="60" cy="75" rx="30" ry="28" fill="#bcece6" />
              <ellipse cx="60" cy="75" rx="25" ry="23" fill="#9edfd8" />

              {/* Wings */}
              <g className="animate-pulse" style={{ animationDelay: "0.5s" }}>
                <ellipse cx="30" cy="78" rx="8" ry="12" fill="#7bbcb4" />
                <ellipse cx="90" cy="78" rx="8" ry="12" fill="#7bbcb4" />
              </g>

              {/* Eyes - Left */}
              <circle cx="48" cy="68" r="10" fill="white" />
              <circle cx="48" cy="68" r="7" fill="#12423f" />
              <circle cx="50" cy="66" r="2.5" fill="white" />
              <circle cx="46" cy="66" r="1" fill="white" opacity="0.6" />

              {/* Eyes - Right */}
              <circle cx="72" cy="68" r="10" fill="white" />
              <circle cx="72" cy="68" r="7" fill="#12423f" />
              <circle cx="74" cy="66" r="2.5" fill="white" />
              <circle cx="70" cy="66" r="1" fill="white" opacity="0.6" />

              {/* Beak */}
              <polygon points="60,75 55,82 60,89 65,82" fill="#ffd700" />

              {/* Feet */}
              <ellipse cx="50" cy="102" rx="5" ry="3" fill="#ffd700" />
              <ellipse cx="70" cy="102" rx="5" ry="3" fill="#ffd700" />

              {/* Sparkles */}
              <g className="animate-pulse" style={{ animationDelay: "0.8s" }}>
                <circle cx="15" cy="30" r="2" fill="#ffd700" opacity="0.8" />
                <circle cx="105" cy="45" r="2" fill="#ffd700" opacity="0.8" />
                <circle cx="20" cy="50" r="1.5" fill="#bcece6" opacity="0.6" />
                <circle cx="100" cy="35" r="1.5" fill="#bcece6" opacity="0.6" />
              </g>
            </svg>
          </div>

          {/* Success Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-success-container/50 mb-4 animate-scale-in">
            <svg className="w-4 h-4 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-[11px] font-bold text-on-success-container uppercase tracking-wider">Quiz Ready</span>
          </div>

          {/* Quiz Title */}
          <h2 className="text-[24px] font-bold text-on-surface mb-6 animate-scale-in" style={{ animationDelay: "0.2s" }}>
            {quizTitle}
          </h2>

          {/* Self-Paced Code Card */}
          {selfPacedCode && (
            <div className="inline-flex flex-col items-center gap-3 bg-primary-container/40 rounded-xl px-8 py-5 mb-8 animate-scale-in" style={{ animationDelay: "0.3s" }}>
              <p className="text-[10px] font-bold uppercase tracking-widest text-on-primary-container/70">
                Self-Paced Code
              </p>
              <code className="text-[32px] font-bold tracking-[0.15em] text-primary font-mono">
                {selfPacedCode}
              </code>
              <button
                type="button"
                onClick={copyLink}
                className={`
                  inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-[13px] font-semibold transition-all duration-200
                  ${copied
                    ? "bg-success text-on-success"
                    : "bg-primary text-on-primary hover:opacity-90 hover:shadow-sm active:scale-[0.98]"
                  }
                `}
              >
                {copied ? (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    Copied to clipboard!
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copy Link
                  </>
                )}
              </button>
              <p className="text-[11px] text-on-primary-container/60 m-0">
                Students open <span className="font-semibold">Student Portal → Quizzes</span>
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 animate-fade-in" style={{ animationDelay: "0.4s" }}>
            <Link
              href={`/teacher/quizzes/session/${quizId}`}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-[14px] font-semibold bg-primary text-on-primary hover:opacity-90 hover:shadow-md active:scale-[0.98] transition-all"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
              Start Live Session
            </Link>
            <Link
              href={`/teacher/quizzes/${quizId}`}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-[14px] font-semibold bg-surface-container text-on-surface hover:bg-surface-container-high transition-all"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              View Details
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}