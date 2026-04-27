"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getStudentIdentity, clearStudentIdentity } from "@/lib/api/students";
import { useState, useSyncExternalStore } from "react";
import { deleteCookie } from "cookies-next";
import CodeEntryModal from "@/components/CodeEntryModal";

/* ─────────────────────────────────────────────────────────
    Student Layout Shell
    Patterned after teacher layout with left sidebar rail on desktop.
    Top nav + mobile bottom tabs. 
    Design System: "The Digital Atelier" — Heritage Palette + M3
    ───────────────────────────────────────────────────────── */

const IconLogout = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const IconBook = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
  </svg>
);

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

const IconQuiz = ({ active }: { active: boolean }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

const IconProfile = ({ active }: { active: boolean }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={active ? 0 : 2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
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
  { key: "assignments", href: "/student/assignments", label: "My Assignments", icon: IconAssignments, mobileLabel: "Assignments" },
  { key: "quiz", href: "/student/quizzes/join", label: "Quiz", icon: IconQuiz, mobileLabel: "Quiz" },
];

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);

  // useSyncExternalStore ensures hydration-safe reads from localStorage
  const studentName = useSyncExternalStore(
    () => () => { }, // no subscription needed (read-only for now)
    () => getStudentIdentity()?.studentName ?? null,
    () => null, // server always returns null
  );

  const isActive = (href: string) => {
    const hrefPath = href.split("?")[0]; // Strip query params for comparison
    if (hrefPath === "/student/dashboard") {
      return pathname === "/student" || pathname === "/student/dashboard";
    }
    if (hrefPath === "/student/quizzes/join") {
      return pathname.startsWith("/student/quizzes");
    }
    return pathname.startsWith(hrefPath);
  };

  const handleLogout = () => {
    deleteCookie("auth-token", { path: "/" });
    sessionStorage.removeItem('shiksha-sathi-token');
    window.location.href = "/";
  };

  // Login page uses its own AuthShell — skip student layout chrome
  if (pathname === "/student/login") {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-surface">
      {/* ═══ Top App Bar (M3 Enhanced) ═══ */}
      <nav className="fixed top-0 left-0 right-0 z-50" style={{
        height: "64px",
        background: "var(--color-surface-container-low)",
        borderBottom: "1px solid var(--color-outline-variant)",
        boxShadow: "0 1px 3px rgba(27, 28, 30, 0.04)"
      }}>
        <div className="flex justify-between items-center px-3 md:px-4 h-full max-w-[100rem] mx-auto">
          {/* Left: Brand */}
          <div className="flex items-center gap-2 md:gap-3">
            <Link
              href="/student/dashboard"
              className="flex items-center gap-2 no-underline flex-shrink-0"
            >
              <div className="w-8 h-8 rounded-sm flex items-center justify-center" style={{ background: "var(--color-primary-container)", color: "var(--color-on-primary-container)" }}>
                <IconBook />
              </div>
              <span className="font-manrope text-lg font-bold tracking-tight" style={{ color: "var(--color-on-surface)" }}>
                Shiksha Sathi
              </span>
            </Link>
          </div>

          {/* Right: Student Identity + Menu Toggle */}
          <div className="flex items-center gap-2 md:gap-4">
            <div className="flex items-center gap-2">
              {studentName && (
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-md" style={{ background: "var(--color-surface-container)" }}>
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-[0.625rem] font-bold" style={{ background: "var(--color-secondary-container)", color: "var(--color-on-secondary-container)" }}>
                    {studentName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                  </div>
                  <span className="text-xs font-medium" style={{ color: "var(--color-on-surface)" }}>{studentName}</span>
                </div>
              )}

              <Link
                href="/student/profile"
                className="p-2 text-on-surface-variant rounded-full flex items-center justify-center transition-colors duration-120 hover:bg-surface-container no-underline"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="8" r="5" />
                  <path d="M20 21a8 8 0 0 0-16 0" />
                </svg>
              </Link>
            </div>

            {/* Mobile Menu Toggle */}
            <button
              type="button"
              className="md:hidden p-2 rounded-md transition-colors cursor-pointer bg-transparent border-none"
              style={{ color: "var(--color-on-surface-variant)" }}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <IconClose /> : <IconMenu />}
            </button>
          </div>
        </div>
      </nav>

      {/* ═══ Mobile Dropdown Menu (M3 Enhanced) ═══ */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed top-16 left-0 right-0 z-[45] p-3" style={{
          background: "var(--color-surface-container-low)",
          boxShadow: "var(--shadow-lg)",
          borderBottom: "1px solid var(--color-outline-variant)"
        }}>
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.key}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 p-3 px-4 text-sm font-medium rounded-sm no-underline mb-2 transition-all ${active ? "font-semibold" : "font-medium"
                  }`}
                style={active ? {
                  background: "var(--color-primary-container)",
                  color: "var(--color-on-primary-container)"
                } : {
                  color: "var(--color-on-surface-variant)",
                  background: "var(--color-surface-container)"
                }}
              >
                <item.icon active={active} />
                {item.label}
              </Link>
            );
          })}
          <Link
            href="/student/profile"
            onClick={() => setMobileMenuOpen(false)}
            className={`flex items-center gap-3 p-3 px-4 text-sm font-medium rounded-sm no-underline mb-2 transition-all ${isActive("/student/profile") ? "font-semibold" : "font-medium"
              }`}
            style={isActive("/student/profile") ? {
              background: "var(--color-primary-container)",
              color: "var(--color-on-primary-container)"
            } : {
              color: "var(--color-on-surface-variant)",
              background: "var(--color-surface-container)"
            }}
          >
            <IconProfile active={isActive("/student/profile")} />
            Profile
          </Link>
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              setIsAssignmentModalOpen(true);
            }}
            className="w-full flex items-center gap-3 p-3 px-4 text-sm font-medium rounded-sm cursor-pointer mb-2 transition-all bg-transparent border-none"
            style={{
              background: "var(--color-secondary-container)",
              color: "var(--color-on-secondary-container)"
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
            </svg>
            Enter Assignment Code
          </button>
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              setIsQuizModalOpen(true);
            }}
            className="w-full flex items-center gap-3 p-3 px-4 text-sm font-medium rounded-sm cursor-pointer mb-2 transition-all bg-transparent border-none"
            style={{ 
              background: "var(--color-primary-container)", 
              color: "var(--color-on-primary-container)" 
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
            Join Quiz
          </button>
          {studentName && (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                handleLogout();
              }}
              className="w-full flex items-center gap-3 p-3 px-4 text-sm font-medium rounded-sm cursor-pointer transition-all bg-transparent border-none"
              style={{
                color: "var(--color-error)",
                background: "var(--color-error-container)"
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Logout
            </button>
          )}
        </div>
      )}

      {/* ═══ Main Content ═══ */}
      <div className="flex flex-1 pt-16">
        {/* ═══ Left Sidebar Rail (Desktop only) ═══ */}
        <aside className="hidden lg:flex flex-col w-52 shrink-0 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto bg-[#f6f3ef]">
          {/* Brand Section */}
          <div className="px-4 pt-6 pb-4">
            <span className="text-[0.6875rem] font-bold tracking-[0.08em] text-[#12423f]/60 uppercase">
              Student Portal
            </span>
          </div>
          {/* Nav Links */}
          <nav className="flex flex-col gap-1 px-3">
            {navItems.map((item) => {
              const active = isActive(item.href);
              const ItemIcon = item.icon;
              return (
                <Link
                  key={item.key}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm no-underline transition-all duration-200 ${active
                      ? "bg-white text-[#12423f] font-semibold shadow-sm"
                      : "text-[#1c1c1a] opacity-80 hover:opacity-100 hover:bg-[#ebe8e4]"
                    }`}
                >
                  <ItemIcon active={active} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Quick Actions */}
          <div className="mt-auto p-6">
            {/* Enter Assignment Code */}
            <button
              onClick={() => setIsAssignmentModalOpen(true)}
              className="block w-full bg-[linear-gradient(135deg,#12423f_0%,#2d5a56_100%)] text-white py-3 rounded-lg font-bold text-sm text-center no-underline shadow-sm hover:opacity-90 transition-opacity cursor-pointer border-none mb-3"
            >
              Enter Assignment
            </button>

            {/* Enter Quiz Code */}
            <button
              onClick={() => setIsQuizModalOpen(true)}
              className="block w-full bg-white text-[#12423f] py-3 rounded-lg font-bold text-sm text-center no-underline shadow-sm hover:bg-gray-50 transition-colors cursor-pointer border border-[#12423f]/20 mb-3"
            >
              Join Quiz
            </button>

            {/* Log out */}
            <div className="border-t border-[#c0c8c6]/20 pt-3 mt-3">
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 text-[#1c1c1a] py-2 text-[0.8125rem] bg-transparent border-none cursor-pointer hover:text-[#12423f] transition-colors duration-120 text-left w-full"
              >
                <IconLogout />
                Log out
              </button>
            </div>
          </div>
        </aside>

        {/* ═══ Main Content Area ═══ */}
        <main className="flex-1 w-full max-w-full overflow-hidden pb-24 md:pb-0">
          <div className="max-w-[80rem] mx-auto p-4 md:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>

      {/* ═══ Bottom Navigation Bar (Refined M3 Pattern) ═══ */}
      <nav className="md:hidden flex justify-around items-center fixed bottom-0 left-0 right-0 z-50 px-1" style={{
        height: "76px",
        background: "var(--color-surface-container)",
        borderTop: "1px solid var(--color-outline-variant)",
        boxShadow: "0 -1px 2px rgba(27, 28, 30, 0.06)",
        paddingBottom: "env(safe-area-inset-bottom, 0px)"
      }}>
        {navItems.map((item) => {
          const active = isActive(item.href);
          const ItemIcon = item.icon;
          return (
            <Link
              key={item.key}
              href={item.href}
              className="flex flex-col items-center justify-center no-underline w-14 transition-all duration-200"
            >
              <div
                className={`flex items-center justify-center transition-all duration-200 mb-1 w-14 h-7 rounded-full ${
                  active ? "" : "bg-transparent"
                }`}
                style={active ? {
                  background: "var(--color-secondary-container)",
                  color: "var(--color-on-secondary-container)"
                } : {
                  color: "var(--color-on-surface-variant)"
                }}
              >
                <ItemIcon active={active} />
              </div>
              <span
                className={`text-[0.6875rem] transition-colors duration-200 ${active ? "font-medium" : "font-normal"
                  }`}
                style={{
                  color: active ? "var(--color-on-surface)" : "var(--color-on-surface-variant)",
                  letterSpacing: active ? "0.01em" : "0.02em"
                }}
              >
                {item.mobileLabel}
              </span>
            </Link>
          );
        })}
        {/* Join Quiz — mobile bottom nav */}
        <button
          type="button"
          onClick={() => setIsQuizModalOpen(true)}
          className="flex flex-col items-center justify-center bg-transparent border-none w-14 cursor-pointer transition-all duration-200"
        >
          <div
            className="flex items-center justify-center mb-1 w-12 h-7 rounded-full"
            style={{ color: "var(--color-on-surface-variant)" }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
          </div>
          <span
            className="text-[0.6875rem] font-normal"
            style={{ color: "var(--color-on-surface-variant)", letterSpacing: "0.02em" }}
          >
            Quiz
          </span>
        </button>
      </nav>

      {/* Modals */}
      <CodeEntryModal
        isOpen={isAssignmentModalOpen}
        onClose={() => setIsAssignmentModalOpen(false)}
        onSubmit={(code) => window.location.href = `/student/assignment/${code}`}
        title="Enter Assignment Code"
      />
      <CodeEntryModal
        isOpen={isQuizModalOpen}
        onClose={() => setIsQuizModalOpen(false)}
        onSubmit={(code) => window.location.href = `/student/quizzes/join?code=${encodeURIComponent(code)}`}
        title="Enter Quiz Code"
        description="Enter the 6-character quiz code provided by your teacher."
      />
    </div>
  );
}
