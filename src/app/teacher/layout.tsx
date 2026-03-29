"use client";

import { AssignmentProvider } from "@/components/AssignmentContext";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { deleteCookie } from "cookies-next";
import CartIcon from "@/components/CartIcon";
import { useState } from "react";

/* ─────────────────────────────────────────────────────────
   Teacher Layout Shell — Stitch-Directed
   Design Source: doc/stitch_shiksha_sathi_ui_refresh/teacher_dashboard
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

const IconAnalytics = ({ active }: { active: boolean }) => (
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
    <path d="M3 3v18h18" />
    <path d="m19 9-5 5-4-4-3 3" />
  </svg>
);

const IconSettings = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

const IconHelp = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
    <path d="M12 17h.01" />
  </svg>
);

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
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          background: "var(--color-surface)",
        }}
      >
        {/* ═══ Top Navigation Bar ═══ */}
        <nav
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 50,
            background: "rgba(250, 249, 245, 0.8)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            borderBottom: "1px solid rgba(176, 179, 173, 0.15)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "0 var(--space-8)",
              height: "4rem",
              maxWidth: "100rem",
              margin: "0 auto",
            }}
          >
            {/* Left: Brand + Desktop Nav */}
            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-12)" }}>
              <Link
                href="/teacher/dashboard"
                style={{
                  fontFamily: "var(--font-manrope), system-ui, sans-serif",
                  fontSize: "1.25rem",
                  fontWeight: 700,
                  color: "var(--color-on-surface)",
                  letterSpacing: "-0.03em",
                  textDecoration: "none",
                }}
              >
                Shiksha Sathi
              </Link>

              {/* Desktop Top Tabs */}
              <div className="desktop-top-tabs">
                {navItems.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      style={{
                        height: "4rem",
                        display: "flex",
                        alignItems: "center",
                        fontSize: "0.875rem",
                        fontWeight: active ? 600 : 400,
                        color: active
                          ? "var(--color-primary)"
                          : "var(--color-on-surface-variant)",
                        borderBottom: active
                          ? "2px solid var(--color-primary)"
                          : "2px solid transparent",
                        textDecoration: "none",
                        transition: "color 200ms ease-out, border-color 200ms ease-out",
                      }}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Right: Actions */}
            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-4)" }}>
              <Link
                href="/teacher/question-bank"
                className="desktop-cta-btn"
                style={{
                  background: "var(--color-primary)",
                  color: "var(--color-on-primary)",
                  padding: "var(--space-2) var(--space-4)",
                  borderRadius: "var(--radius-sm)",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  textDecoration: "none",
                  transition: "background 150ms ease-out, transform 150ms ease-out",
                }}
              >
                Assignment Builder
              </Link>
              <div style={{ display: "flex", alignItems: "center", gap: "var(--space-1)" }}>
                <CartIcon />
                <Link
                  href="/teacher/profile"
                  style={{
                    padding: "var(--space-2)",
                    color: "var(--color-on-surface-variant)",
                    borderRadius: "var(--radius-full)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "background 120ms ease-out",
                    textDecoration: "none",
                  }}
                  className="icon-btn"
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
                className="mobile-menu-btn"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                style={{
                  padding: "var(--space-2)",
                  color: "var(--color-on-surface-variant)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                }}
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <IconClose /> : <IconMenu />}
              </button>
            </div>
          </div>
        </nav>

        {/* ═══ Mobile Dropdown Menu ═══ */}
        {mobileMenuOpen && (
          <div
            className="mobile-dropdown"
            style={{
              position: "fixed",
              top: "4rem",
              left: 0,
              right: 0,
              zIndex: 45,
              background: "var(--color-surface-container-lowest)",
              borderBottom: "1px solid rgba(176, 179, 173, 0.15)",
              padding: "var(--space-4)",
            }}
          >
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  display: "block",
                  padding: "var(--space-2) var(--space-3)",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  color: isActive(item.href)
                    ? "var(--color-primary)"
                    : "var(--color-on-surface-variant)",
                  background: isActive(item.href)
                    ? "rgba(198, 232, 248, 0.2)"
                    : "transparent",
                  borderRadius: "var(--radius-md)",
                  textDecoration: "none",
                }}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/teacher/profile"
              onClick={() => setMobileMenuOpen(false)}
              style={{
                display: "block",
                padding: "var(--space-2) var(--space-3)",
                fontSize: "0.875rem",
                fontWeight: 500,
                color: "var(--color-on-surface-variant)",
                textDecoration: "none",
              }}
            >
              Profile
            </Link>
            <form onSubmit={handleLogout}>
              <button
                type="submit"
                style={{
                  width: "100%",
                  textAlign: "left",
                  padding: "var(--space-2) var(--space-3)",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  color: "var(--color-on-surface-variant)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Log out
              </button>
            </form>
          </div>
        )}

        <div style={{ display: "flex", flex: 1, paddingTop: "4rem" }}>
          {/* ═══ Left Sidebar Rail (Desktop only) ═══ */}
          <aside className="desktop-sidebar">
            {/* Brand Section */}
            <div style={{ padding: "var(--space-6)" }}>
              <p
                style={{
                  fontSize: "0.6875rem",
                  fontWeight: 700,
                  color: "var(--color-on-surface)",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  margin: 0,
                }}
              >
                Shiksha Sathi
              </p>
              <p
                style={{
                  fontSize: "0.625rem",
                  color: "var(--color-on-surface-variant)",
                  textTransform: "uppercase",
                  letterSpacing: "-0.02em",
                  margin: 0,
                }}
              >
                Teacher Portal
              </p>
            </div>

            {/* Nav Links */}
            <nav style={{ display: "flex", flexDirection: "column", gap: "var(--space-1)", paddingRight: "var(--space-4)" }}>
              {navItems.map((item) => {
                const active = isActive(item.href);
                const ItemIcon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "var(--space-3)",
                      padding: "var(--space-3) var(--space-6)",
                      fontSize: "0.875rem",
                      fontWeight: active ? 500 : 400,
                      color: active
                        ? "var(--color-primary)"
                        : "var(--color-on-surface-variant)",
                      background: active
                        ? "var(--color-surface-container-lowest)"
                        : "transparent",
                      borderRadius: active ? "0 var(--radius-lg) var(--radius-lg) 0" : "0",
                      textDecoration: "none",
                      transition: "all 200ms ease-out",
                    }}
                    className="sidebar-link"
                  >
                    <ItemIcon active={active} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* Bottom Actions */}
            <div style={{ marginTop: "auto", padding: "var(--space-6)" }}>
              {/* Create Assignment CTA */}
              <Link
                href="/teacher/question-bank"
                style={{
                  display: "block",
                  width: "100%",
                  background: "var(--color-primary)",
                  color: "var(--color-on-primary)",
                  padding: "var(--space-3) 0",
                  borderRadius: "var(--radius-sm)",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  textAlign: "center",
                  textDecoration: "none",
                  boxShadow: "0 4px 12px rgba(48, 51, 47, 0.06)",
                  transition: "transform 150ms ease-out",
                }}
              >
                Create New Assignment
              </Link>

              {/* Settings + Support */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "var(--space-1)",
                  borderTop: "1px solid rgba(176, 179, 173, 0.1)",
                  paddingTop: "var(--space-4)",
                  marginTop: "var(--space-4)",
                }}
              >
                <Link
                  href="#"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "var(--space-3)",
                    color: "var(--color-on-surface-variant)",
                    padding: "var(--space-2) 0",
                    fontSize: "0.8125rem",
                    textDecoration: "none",
                    transition: "color 120ms ease-out",
                  }}
                  className="sidebar-secondary-link"
                >
                  <IconSettings />
                  Settings
                </Link>
                <Link
                  href="#"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "var(--space-3)",
                    color: "var(--color-on-surface-variant)",
                    padding: "var(--space-2) 0",
                    fontSize: "0.8125rem",
                    textDecoration: "none",
                    transition: "color 120ms ease-out",
                  }}
                  className="sidebar-secondary-link"
                >
                  <IconHelp />
                  Support
                </Link>
                <button
                  onClick={handleLogout}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "var(--space-3)",
                    color: "var(--color-on-surface-variant)",
                    padding: "var(--space-2) 0",
                    fontSize: "0.8125rem",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    transition: "color 120ms ease-out",
                  }}
                  className="sidebar-secondary-link"
                >
                  <IconLogout />
                  Log out
                </button>
              </div>
            </div>
          </aside>

          {/* ═══ Main Content ═══ */}
          <main
            style={{
              flex: 1,
              width: "100%",
              maxWidth: "100%",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                maxWidth: "80rem",
                margin: "0 auto",
                padding: "var(--space-6) var(--space-4)",
              }}
              className="main-content-pad"
            >
              {children}
            </div>
          </main>
        </div>

        {/* ═══ Bottom Tab Bar (Mobile Only) ═══ */}
        <nav className="mobile-bottom-nav">
          {navItems.map((item) => {
            const active = isActive(item.href);
            const ItemIcon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  color: active
                    ? "var(--color-primary)"
                    : "var(--color-on-surface-variant)",
                  textDecoration: "none",
                  gap: "2px",
                }}
              >
                <ItemIcon active={active} />
                <span style={{ fontSize: "0.625rem", fontWeight: 500 }}>
                  {item.mobileLabel}
                </span>
              </Link>
            );
          })}

          {/* Floating Add Button */}
          <Link
            href="/teacher/question-bank"
            style={{
              width: "3rem",
              height: "3rem",
              marginTop: "-1.5rem",
              background: "var(--color-primary)",
              borderRadius: "var(--radius-full)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--color-on-primary)",
              boxShadow: "0 4px 12px rgba(48, 51, 47, 0.15)",
              textDecoration: "none",
            }}
          >
            <IconPlus />
          </Link>

          {/* Analytics Tab */}
          <Link
            href="/teacher/dashboard"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              color: "var(--color-on-surface-variant)",
              textDecoration: "none",
              gap: "2px",
            }}
          >
            <IconAnalytics active={false} />
            <span style={{ fontSize: "0.625rem", fontWeight: 500 }}>Stats</span>
          </Link>
        </nav>

        {/* ═══ Responsive Styles ═══ */}
        <style>{`
          /* Desktop Sidebar */
          .desktop-sidebar {
            display: none;
          }
          @media (min-width: 1024px) {
            .desktop-sidebar {
              display: flex;
              flex-direction: column;
              width: 16rem;
              flex-shrink: 0;
              position: sticky;
              top: 4rem;
              height: calc(100vh - 4rem);
              overflow-y: auto;
              background: var(--color-surface-container-low);
            }
          }

          /* Desktop Top Tabs */
          .desktop-top-tabs {
            display: none;
          }
          @media (min-width: 768px) and (max-width: 1023px) {
            .desktop-top-tabs {
              display: flex;
              align-items: center;
              gap: var(--space-8);
              height: 4rem;
            }
          }

          /* Desktop CTA Button */
          .desktop-cta-btn {
            display: none !important;
          }
          @media (min-width: 768px) {
            .desktop-cta-btn {
              display: inline-flex !important;
            }
          }
          .desktop-cta-btn:hover {
            background: var(--color-primary-dim) !important;
          }
          .desktop-cta-btn:active {
            transform: scale(0.95);
          }

          /* Mobile Menu Button */
          .mobile-menu-btn {
            display: block;
          }
          @media (min-width: 768px) {
            .mobile-menu-btn {
              display: none !important;
            }
          }

          /* Mobile Dropdown */
          .mobile-dropdown {
            display: block;
          }
          @media (min-width: 768px) {
            .mobile-dropdown {
              display: none !important;
            }
          }

          /* Bottom Nav (Mobile Only) */
          .mobile-bottom-nav {
            display: flex;
            justify-content: space-around;
            align-items: center;
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            height: 4rem;
            background: var(--color-surface);
            border-top: 1px solid rgba(176, 179, 173, 0.1);
            z-index: 50;
            padding: 0 var(--space-4);
          }
          @media (min-width: 768px) {
            .mobile-bottom-nav {
              display: none !important;
            }
          }

          /* Sidebar Link Hover */
          .sidebar-link:hover {
            background: var(--color-surface-container) !important;
          }
          .sidebar-secondary-link:hover {
            color: var(--color-primary) !important;
          }

          /* Icon Button Hover */
          .icon-btn:hover {
            background: var(--color-surface-container);
          }

          /* Main Content Padding */
          .main-content-pad {
            padding: var(--space-6) var(--space-4);
          }
          @media (min-width: 768px) {
            .main-content-pad {
              padding: var(--space-8);
            }
          }

          /* Account for bottom nav on mobile */
          @media (max-width: 767px) {
            main {
              padding-bottom: 5rem;
            }
          }
        `}</style>
      </div>
    </AssignmentProvider>
  );
}
