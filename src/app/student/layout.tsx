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

  const handleLogout = () => {
    clearStudentIdentity();
    window.location.href = "/student/dashboard";
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--color-m3-surface)" }}>
      {/* ═══ M3 Top App Bar (Medium Variant) ═══ */}
      <nav className="fixed top-0 left-0 right-0 z-50" style={{ background: "var(--color-m3-surface-container-low)", height: "64px" }}>
        <div className="flex justify-between items-center px-2 md:px-4 h-full max-w-[100rem] mx-auto">
          {/* Left: Brand + Nav */}
          <div className="flex items-center gap-1 md:gap-2">
            <Link
              href="/student/dashboard"
              className="font-[family-name:var(--font-manrope)] text-lg font-bold no-underline flex-shrink-0"
              style={{ color: "var(--color-m3-on-surface)" }}
            >
              Shiksha Sathi
            </Link>

            {/* M3 Navigation Tabs */}
            <div className="hidden md:flex items-center gap-1 h-full">
              {navItems.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.key}
                    href={item.href}
                    className={`h-10 flex items-center text-[0.875rem] no-underline transition-all duration-200 rounded-full px-4 ${
                      active
                        ? "font-semibold"
                        : "font-medium hover:opacity-70"
                    }`}
                    style={active
                      ? { background: "var(--color-m3-secondary-container)", color: "var(--color-m3-on-secondary-container)" }
                      : { color: "var(--color-m3-on-surface-variant)" }
                    }
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Right: Student Identity + Menu Toggle */}
          <div className="flex items-center gap-2">
            {studentName && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ background: "var(--color-m3-surface-container)" }}>
                <IconStudent />
                <span className="text-xs font-medium" style={{ color: "var(--color-m3-on-surface)" }}>{studentName}</span>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="ml-1 text-[0.625rem] font-bold uppercase tracking-wider cursor-pointer bg-transparent border-none transition-colors"
                  style={{ color: "var(--color-m3-primary)" }}
                >
                  Logout
                </button>
              </div>
            )}
            <Link
              href="/student/assignment/"
              className="hidden md:inline-flex no-underline text-[0.875rem] font-medium px-4 py-2 rounded-full transition-all active:scale-95"
              style={{ background: "var(--color-m3-primary)", color: "var(--color-m3-on-primary)" }}
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
              className="md:hidden p-2 bg-transparent border-none cursor-pointer"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
              style={{ color: "var(--color-m3-on-surface-variant)" }}
            >
              {mobileMenuOpen ? <IconClose /> : <IconMenu />}
            </button>
          </div>
        </div>
      </nav>

      {/* ═══ Mobile Dropdown Menu ═══ */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed top-16 left-0 right-0 z-[45] p-3" style={{ background: "var(--color-m3-surface-container-low)" }}>
          {navItems.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`block p-3 px-4 text-sm font-medium rounded-full no-underline mb-1 ${
                isActive(item.href)
                  ? "font-semibold"
                  : "font-medium"
              }`}
              style={isActive(item.href)
                ? { background: "var(--color-m3-secondary-container)", color: "var(--color-m3-on-secondary-container)" }
                : { color: "var(--color-m3-on-surface-variant)" }
              }
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
            className="w-full text-left p-3 px-4 text-sm font-medium rounded-full cursor-pointer mb-1"
            style={{ color: "var(--color-m3-primary)", background: "var(--color-m3-primary-container)" }}
          >
            Enter Assignment Code
          </button>
          {studentName && (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                handleLogout();
              }}
              className="w-full text-left p-3 px-4 text-sm font-medium rounded-full cursor-pointer"
              style={{ color: "var(--color-m3-on-surface-variant)", background: "var(--color-m3-surface-container)" }}
            >
              Logout
            </button>
          )}
        </div>
      )}

      {/* ═══ Main Content ═══ */}
      <main className="flex-1 w-full pt-16 pb-20 md:pb-8" style={{ background: "var(--color-m3-surface)" }}>
        <div className="max-w-[80rem] mx-auto p-4 md:p-6 lg:p-8">
          {children}
        </div>
      </main>

      {/* ═══ M3 Bottom Navigation Bar (Mobile) ═══ */}
      <nav className="md:hidden flex justify-around items-center fixed bottom-0 left-0 right-0 z-50 px-1" style={{ background: "var(--color-m3-surface-container)", height: "80px" }}>
        {navItems.map((item) => {
          const active = isActive(item.href);
          const ItemIcon = item.icon;
          return (
            <Link
              key={item.key}
              href={item.href}
              className="flex flex-col items-center justify-center no-underline w-16"
            >
              <div
                className="flex items-center justify-center transition-all duration-200 mb-1"
                style={{
                  width: "56px",
                  height: "32px",
                  borderRadius: "16px",
                  background: active ? "var(--color-m3-secondary-container)" : "transparent",
                }}
              >
                <ItemIcon active={active} />
              </div>
              <span className="text-[0.75rem] font-medium" style={{
                color: active ? "var(--color-m3-on-surface)" : "var(--color-m3-on-surface-variant)",
              }}>
                {item.mobileLabel}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
