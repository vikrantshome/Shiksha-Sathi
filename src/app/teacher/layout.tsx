"use client";

import { AssignmentProvider } from "@/components/AssignmentContext";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { deleteCookie } from "cookies-next";
import CartIcon from "@/components/CartIcon";
import { useState } from "react";

/* ─────────────────────────────────────────────────────────
   Teacher Layout Shell — Stitch-Directed
   Design Source: doc/stitch-export-bundle (Canonical Export)
   Implements: persistent left rail (desktop), glassmorphism top bar,
   bottom tab bar (mobile), "Digital Atelier" design tokens.
   ───────────────────────────────────────────────────────── */

/* ── SVG Icon Components ── */
const IconDashboard = ({ active }: { active: boolean }) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill={active ? "currentColor" : "none"}
    stroke="currentColor"
    strokeWidth={active ? 0 : 2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
  </svg>
);

const IconClasses = ({ active }: { active: boolean }) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={active ? 2.5 : 2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </svg>
);

const IconQuestionBank = ({ active }: { active: boolean }) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={active ? 2.5 : 2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <ellipse cx="12" cy="5" rx="9" ry="3" />
    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
    <path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3" />
  </svg>
);

const IconQuiz = ({ active }: { active: boolean }) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={active ? 2.5 : 2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9 12h6" />
    <path d="M9 16h4" />
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <path d="M14 2v6h6" />
  </svg>
);

/* IconAnalytics, IconSettings, IconHelp removed — no shipped destinations (SSA-249) */

const IconLogout = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const IconPlus = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 5v14" /><path d="M5 12h14" />
  </svg>
);

const IconMenu = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" y1="6" x2="20" y2="6" />
    <line x1="4" y1="12" x2="20" y2="12" />
    <line x1="4" y1="18" x2="20" y2="18" />
  </svg>
);

const IconClose = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const navItems = [
  { href: "/teacher/dashboard", label: "Dashboard", icon: IconDashboard, mobileLabel: "Home" },
  { href: "/teacher/classes", label: "My Classes", icon: IconClasses, mobileLabel: "Classes" },
  { href: "/teacher/question-bank", label: "Question Bank", icon: IconQuestionBank, mobileLabel: "Vault" },
  { href: "/teacher/quizzes", label: "Quizzes", icon: IconQuiz, mobileLabel: "Quiz" },
];

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = (e: React.FormEvent) => {
    e.preventDefault();
    deleteCookie("auth-token");
    router.push("/login");
  };

  const isActive = (href: string) => {
    if (href === "/teacher/dashboard") {
      return pathname === "/teacher" || pathname === "/teacher/dashboard";
    }
    return pathname.startsWith(href);
  };

  return (
    <AssignmentProvider>
      <div className="min-h-screen flex flex-col bg-surface">
        {/* ═══ Top Navigation Bar ═══ */}
        {!pathname.startsWith("/teacher/quizzes/display") ? (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-[var(--color-surface-container-lowest)]/95 backdrop-blur-[16px] border-b border-[var(--color-outline-variant)]/15 shadow-[0_2px_8px_rgba(27,28,26,0.06)]">
          <div className="flex justify-between items-center px-6 h-16 max-w-[100rem] mx-auto">
            {/* Left: Brand + Desktop Nav */}
            <div className="flex items-center gap-10">
              <Link
                href="/teacher/dashboard"
                className="font-manrope text-xl font-black text-[#12423f] tracking-[-0.03em] no-underline"
              >
                Shiksha Sathi
              </Link>

              {/* Desktop Top Tabs (Tablet) */}
              <div className="hidden md:flex lg:hidden items-center gap-8 h-16">
                {navItems.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.href}
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

            {/* Right: Actions */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <CartIcon />
                <Link
                  href="/teacher/profile"
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
                className="md:hidden block p-2 text-on-surface-variant bg-transparent border-none cursor-pointer"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <IconClose /> : <IconMenu />}
              </button>
            </div>
          </div>
        </nav>
        ) : null}

        {/* ═══ Mobile Dropdown Menu ═══ */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed top-16 left-0 right-0 z-[45] bg-[var(--color-surface-container-lowest)]/98 backdrop-blur-xl border-b border-[var(--color-outline-variant)]/15 shadow-[0_8px_24px_rgba(27,28,26,0.12)] p-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block p-2.5 px-3 text-sm font-medium rounded-md no-underline mb-2 border ${
                  isActive(item.href)
                    ? "text-primary bg-[var(--color-primary-container)]/45 border-[var(--color-primary)]/10"
                    : "text-on-surface-variant bg-[var(--color-surface-container-low)] border-[var(--color-outline-variant)]/10"
                }`}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/teacher/profile"
              onClick={() => setMobileMenuOpen(false)}
              className="block p-2.5 px-3 text-sm font-medium text-on-surface-variant no-underline mb-2 rounded-md border border-[var(--color-outline-variant)]/10 bg-[var(--color-surface-container-low)]"
            >
              Profile
            </Link>
            <form onSubmit={handleLogout}>
              <button
                type="submit"
                className="w-full text-left p-2.5 px-3 text-sm font-medium text-on-surface-variant rounded-md border border-[var(--color-outline-variant)]/10 bg-[var(--color-surface-container-low)] cursor-pointer"
              >
                Log out
              </button>
            </form>
          </div>
        )}

        <div className="flex flex-1 pt-16">
          {/* ═══ Left Sidebar Rail (Desktop only) ═══ */}
          <aside className={`${pathname.startsWith("/teacher/quizzes/display") ? "hidden" : "hidden lg:flex"} flex-col w-48 shrink-0 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto bg-[#f6f3ef]`}>
            {/* Brand Section */}
            <div className="px-4 pt-6 pb-4">
              <span className="text-[0.6875rem] font-bold tracking-[0.08em] text-[#12423f]/60 uppercase">
                Teacher Portal
              </span>
            </div>
            {/* Nav Links */}
            <nav className="flex flex-col gap-1 px-3">
              {navItems.map((item) => {
                const active = isActive(item.href);
                const ItemIcon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm no-underline transition-all duration-200 ${
                      active
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

            {/* Bottom Actions */}
            <div className="mt-auto p-6">
              {/* Create Assignment CTA */}
              <Link
                href="/teacher/question-bank"
                className="block w-full bg-[linear-gradient(135deg,#12423f_0%,#2d5a56_100%)] text-white py-3 rounded-lg font-bold text-sm text-center no-underline shadow-sm hover:opacity-90 transition-opacity"
              >
                Create New Assignment
              </Link>

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

          {/* ═══ Main Content ═══ */}
          <main className="flex-1 w-full max-w-full overflow-hidden pb-24 md:pb-0">
            <div className={pathname.startsWith("/teacher/quizzes/display") ? "w-full h-full" : "max-w-[80rem] mx-auto p-4 md:p-6 lg:p-8"}>
              {children}
            </div>
          </main>
        </div>

        {/* ═══ Bottom Tab Bar (Mobile Only) ═══ */}
        <nav className="md:hidden flex justify-around items-center fixed bottom-0 left-0 right-0 h-16 bg-[var(--color-surface-container-lowest)]/98 backdrop-blur-xl border-t border-[var(--color-outline-variant)]/15 shadow-[0_-4px_16px_rgba(27,28,26,0.08)] z-50 px-4">
          {navItems.map((item) => {
            const active = isActive(item.href);
            const ItemIcon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center no-underline gap-[2px] ${
                  active ? "text-primary" : "text-on-surface-variant"
                }`}
              >
                <div className={`px-4 py-1 rounded-full transition-colors duration-200 ${
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

          {/* Floating Add Button */}
          <Link
            href="/teacher/question-bank"
            className="w-12 h-12 -mt-6 bg-primary rounded-full flex items-center justify-center text-on-primary shadow-[0_4px_12px_rgba(48,51,47,0.15)] no-underline active:scale-95 transition-transform"
          >
            <IconPlus />
          </Link>

          {/* Analytics tab removed — no analytics-only destination (SSA-249) */}
        </nav>
      </div>
    </AssignmentProvider>
  );
}
