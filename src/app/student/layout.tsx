"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getStudentIdentity, clearStudentIdentity } from "@/lib/api/students";
import { useState, useSyncExternalStore } from "react";

/* ─────────────────────────────────────────────────────────
   Student Layout Shell
   Patterned after teacher layout but simplified for student needs.
   Top nav + mobile bottom tabs. No left sidebar rail.
   Design System: "The Digital Atelier" (design-system.md)
   ───────────────────────────────────────────────────────── */

const IconDashboard = ({ active }: { active: boolean }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={active ? 0 : 2} strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
  </svg>
);

const IconAssignments = ({ active }: { active: boolean }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
    <rect x="9" y="3" width="6" height="4" rx="1" />
    <path d="M9 12h6" /><path d="M9 16h6" />
  </svg>
);

const IconResults = ({ active }: { active: boolean }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
    <polyline points="16 7 22 7 22 13" />
  </svg>
);

const IconMenu = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" y1="6" x2="20" y2="6" /><line x1="4" y1="12" x2="20" y2="12" /><line x1="4" y1="18" x2="20" y2="18" />
  </svg>
);

const IconClose = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const IconStudent = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
  </svg>
);

const navItems = [
  { key: "dashboard", href: "/student/dashboard", label: "Dashboard", icon: IconDashboard, mobileLabel: "Home" },
  { key: "assignments", href: "/student/assignments", label: "My Assignments", icon: IconAssignments, mobileLabel: "Work" },
  { key: "results", href: "/student/assignments?filter=GRADED", label: "Results", icon: IconResults, mobileLabel: "Results" },
];

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // useSyncExternalStore ensures hydration-safe reads from localStorage
  const studentName = useSyncExternalStore(
    () => () => {}, // no subscription needed (read-only for now)
    () => getStudentIdentity()?.studentName ?? null,
    () => null, // server always returns null
  );

  const isActive = (href: string) => {
    const hrefPath = href.split("?")[0]; // Strip query params for comparison
    const search = href.split("?")[1] || "";

    if (hrefPath === "/student/dashboard") {
      return pathname === "/student" || pathname === "/student/dashboard";
    }
    if (hrefPath === "/student/assignments") {
      if (search.includes("filter=GRADED")) {
        // Results tab: active when on assignments page with GRADED filter
        return pathname.startsWith(hrefPath);
      }
      // My Assignments tab: active when on assignments page WITHOUT GRADED filter
      return pathname.startsWith(hrefPath) && !pathname.includes("filter=GRADED");
    }
    return pathname.startsWith(hrefPath);
  };

  const handleClearIdentity = () => {
    clearStudentIdentity();
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface">
      {/* ═══ Top Navigation Bar ═══ */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[var(--color-surface-container-lowest)]/95 backdrop-blur-[16px] border-b border-[#B0B3AD]/15 shadow-[0_2px_8px_rgba(27,28,26,0.06)]">
        <div className="flex justify-between items-center px-4 md:px-6 h-16 max-w-[100rem] mx-auto">
          {/* Left: Brand */}
          <div className="flex items-center gap-6">
            <Link
              href="/student/dashboard"
              className="font-[family-name:var(--font-manrope)] text-lg md:text-xl font-bold text-on-surface tracking-[-0.03em] no-underline"
            >
              Shiksha Sathi
            </Link>

            {/* Desktop Nav Tabs */}
            <div className="hidden md:flex items-center gap-6 h-16">
              {navItems.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.key}
                    href={item.href}
                    className={`h-16 flex items-center text-sm transition-colors duration-200 border-b-2 no-underline ${
                      active
                        ? "font-semibold text-primary border-primary"
                        : "font-normal text-on-surface-variant border-transparent"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Right: Student Identity + Menu Toggle */}
          <div className="flex items-center gap-3">
            {studentName && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-surface-container-low rounded-full">
                <IconStudent />
                <span className="text-xs font-semibold text-on-surface">{studentName}</span>
              </div>
            )}
            <Link
              href="/student/assignment/"
              className="hidden md:inline-flex bg-primary text-on-primary px-3 py-1.5 rounded-sm text-xs font-semibold no-underline hover:brightness-95 active:scale-95 transition-all"
              onClick={(e) => {
                e.preventDefault();
                const code = prompt("Enter your assignment code:");
                if (code) window.location.href = `/student/assignment/${code}`;
              }}
            >
              Enter Code
            </Link>

            {/* Mobile Menu Toggle */}
            <button
              type="button"
              className="md:hidden p-2 text-on-surface-variant bg-transparent border-none cursor-pointer"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <IconClose /> : <IconMenu />}
            </button>
          </div>
        </div>
      </nav>

      {/* ═══ Mobile Dropdown Menu ═══ */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed top-16 left-0 right-0 z-[45] bg-[var(--color-surface-container-lowest)]/98 backdrop-blur-xl border-b border-[#B0B3AD]/15 shadow-[0_8px_24px_rgba(27,28,26,0.12)] p-4">
          {navItems.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`block p-2.5 px-3 text-sm font-medium rounded-md no-underline mb-2 border ${
                isActive(item.href)
                  ? "text-primary bg-[var(--color-primary-container)]/45 border-[var(--color-primary)]/10"
                  : "text-on-surface-variant bg-[var(--color-surface-container-low)] border-[#B0B3AD]/10"
              }`}
            >
              {item.label}
            </Link>
          ))}
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              const code = prompt("Enter your assignment code:");
              if (code) window.location.href = `/student/assignment/${code}`;
            }}
            className="w-full text-left p-2.5 px-3 text-sm font-medium text-primary rounded-md border border-[var(--color-primary)]/10 bg-[var(--color-primary-container)]/20 cursor-pointer"
          >
            Enter Assignment Code
          </button>
          {studentName && (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                handleClearIdentity();
              }}
              className="w-full text-left p-2.5 px-3 text-sm font-medium text-on-surface-variant rounded-md border border-[#B0B3AD]/10 bg-[var(--color-surface-container-low)] cursor-pointer"
            >
              Switch Student
            </button>
          )}
        </div>
      )}

      {/* ═══ Main Content ═══ */}
      <main className="flex-1 w-full pt-16 pb-24 md:pb-8">
        <div className="max-w-[80rem] mx-auto p-4 md:p-6 lg:p-8">
          {children}
        </div>
      </main>

      {/* ═══ Bottom Tab Bar (Mobile Only) ═══ */}
      <nav className="md:hidden flex justify-around items-center fixed bottom-0 left-0 right-0 h-16 bg-[var(--color-surface-container-lowest)]/98 backdrop-blur-xl border-t border-[#B0B3AD]/15 shadow-[0_-4px_16px_rgba(27,28,26,0.08)] z-50 px-4">
        {navItems.map((item) => {
          const active = isActive(item.href);
          const ItemIcon = item.icon;
          return (
            <Link
              key={item.key}
              href={item.href}
              className={`flex flex-col items-center no-underline gap-[2px] ${
                active ? "text-primary" : "text-on-surface-variant"
              }`}
            >
              <div className={`px-3 py-1 rounded-full transition-colors duration-200 ${
                active ? "bg-primary-container/30" : "bg-transparent"
              }`}>
                <ItemIcon active={active} />
              </div>
              <span className="text-[0.625rem] font-medium">
                {item.mobileLabel}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
