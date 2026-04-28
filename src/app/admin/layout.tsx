"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

/* ─────────────────────────────────────────────────────────
   Admin Layout Shell
   Implements: persistent left rail (desktop), glassmorphism top bar,
   bottom tab bar (mobile), "Digital Atelier" design tokens.
   ───────────────────────────────────────────────────────── */

/* ── SVG Icon Components ── */
const IconDocument = ({ active }: { active: boolean }) => (
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
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <line x1="10" y1="9" x2="8" y2="9" />
  </svg>
);

const IconChecklist = ({ active }: { active: boolean }) => (
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
    <path d="M9 11l3 3L22 4" />
    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
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

const IconLogout = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const IconChevronLeft = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const IconChevronRight = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

const navItems = [
  { href: "/admin/derived", label: "Derived Content", icon: IconDocument, mobileLabel: "Review" },
  { href: "/admin/audit", label: "Audit", icon: IconChecklist, mobileLabel: "Audit", badge: "New" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleLogout = (e: React.FormEvent) => {
    e.preventDefault();
    sessionStorage.removeItem('shiksha-sathi-token');
    router.push("/login");
  };

  const isActive = (href: string) => {
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface">
      {/* ═══ Top Navigation Bar ═══ */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[var(--color-surface-container-lowest)]/95 backdrop-blur-[16px] border-b border-[var(--color-outline-variant)]/15 shadow-[0_2px_8px_rgba(27,28,26,0.06)]">
        <div className="flex justify-between items-center px-6 h-16 max-w-[100rem] mx-auto">
          {/* Left: Brand + Desktop Nav */}
          <div className="flex items-center gap-10">
            <Link
              href="/admin/derived"
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
        <aside className={`hidden lg:flex flex-col ${sidebarCollapsed ? 'w-16' : 'w-64'} shrink-0 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto bg-[#f6f3ef] transition-all duration-200`}>
          {/* Collapse Toggle as first nav item */}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className={`flex items-center gap-3 rounded-lg text-sm no-underline transition-all duration-200 cursor-pointer ${
              sidebarCollapsed ? 'justify-center px-2 py-3' : 'px-4 py-3'
            } text-[#12423f] hover:bg-[#ebe8e4]`}
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {sidebarCollapsed ? <IconChevronRight /> : <IconChevronLeft />}
            {!sidebarCollapsed && <span className="flex-1">Collapse</span>}
          </button>
          
          {/* Brand Section */}
          {!sidebarCollapsed && (
          <div className="px-4 pt-2 pb-4">
            <span className="text-[0.6875rem] font-bold tracking-[0.08em] text-[#12423f]/60 uppercase">
              Admin Portal
            </span>
          </div>)}
 {/* Nav Links */}
        <nav className={`flex flex-col gap-1 ${sidebarCollapsed ? 'px-2' : 'px-3'}`}>
          {navItems.map((item) => {
            const active = isActive(item.href);
            const ItemIcon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg text-sm no-underline transition-all duration-200 ${
                  sidebarCollapsed ? 'justify-center px-2 py-3' : 'px-4 py-3'
                } ${
                  active
                    ? "bg-white text-[#12423f] font-semibold shadow-sm"
                    : "text-[#1c1c1a] opacity-80 hover:opacity-100 hover:bg-[#ebe8e4]"
                }`}
                title={sidebarCollapsed ? item.label : undefined}
              >
                <ItemIcon active={active} />
                {!sidebarCollapsed && (
                  <>
                  <span className="flex-1">{item.label}</span>
                  {item.badge && (
                    <span className="px-2 py-0.5 text-[0.625rem] font-bold bg-[#12423f] text-white rounded-full">
                      {item.badge}
                    </span>
                  )}
                  </>
                )}
              </Link>
            );
          })}
        </nav>

{/* Bottom Actions */}
        <div className={`mt-auto ${sidebarCollapsed ? 'p-2' : 'p-6'}`}>
          {/* Log out */}
          <div className={`border-t border-[#c0c8c6]/20 ${sidebarCollapsed ? 'pt-2 mt-2' : 'pt-3 mt-3'}`}>
            <button
              onClick={handleLogout}
              className={`flex items-center gap-3 text-[#1c1c1a] py-2 text-[0.8125rem] bg-transparent border-none cursor-pointer hover:text-[#12423f] transition-colors duration-120 ${
                sidebarCollapsed ? 'justify-center w-full px-2' : 'text-left w-full'
              }`}
              title={sidebarCollapsed ? 'Log out' : undefined}
            >
              <IconLogout />
              {!sidebarCollapsed && <span>Log out</span>}
            </button>
          </div>
        </div>
        </aside>

        {/* ═══ Main Content ═══ */}
        <main className="flex-1 w-full max-w-full overflow-hidden pb-24 md:pb-0">
          <div className="max-w-[80rem] mx-auto p-4 md:p-6 lg:p-8">
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
      </nav>
    </div>
  );
}
