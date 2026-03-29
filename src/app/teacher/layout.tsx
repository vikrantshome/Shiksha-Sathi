"use client";

import { AssignmentProvider } from "@/components/AssignmentContext";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { deleteCookie } from "cookies-next";
import CartIcon from "@/components/CartIcon";
import { useState } from "react";

const navItems = [
  { href: "/teacher/dashboard", label: "Dashboard" },
  { href: "/teacher/classes", label: "Classes" },
  { href: "/teacher/question-bank", label: "Question Bank" },
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
        className="min-h-screen flex flex-col"
        style={{ background: "var(--color-surface)" }}
      >
        {/* ── Top Navigation (Glass) ── */}
        <header
          className="glass sticky top-0 z-30 w-full"
          style={{
            borderBottom: "1px solid rgba(176, 179, 173, 0.15)",
          }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-14 items-center">
              {/* Brand + Nav */}
              <div className="flex items-center gap-8">
                <Link
                  href="/teacher/dashboard"
                  className="text-display-sm"
                  style={{
                    fontFamily:
                      "var(--font-manrope), var(--font-geist-sans), system-ui, sans-serif",
                    fontSize: "1.125rem",
                    fontWeight: 700,
                    color: "var(--color-primary)",
                    letterSpacing: "-0.02em",
                    textDecoration: "none",
                  }}
                >
                  Shiksha Sathi
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-1">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={isActive(item.href) ? "nav-link nav-link-active" : "nav-link"}
                      style={{
                        padding: "0.375rem 0.75rem",
                        paddingBottom: "0.5rem",
                      }}
                    >
                      {item.label}
                    </Link>
                  ))}
                </nav>
              </div>

              {/* Right Actions */}
              <div className="flex items-center gap-2">
                <CartIcon />
                <Link
                  href="/teacher/profile"
                  className="nav-link"
                  style={{
                    padding: "0.375rem 0.75rem",
                    ...(isActive("/teacher/profile")
                      ? { color: "var(--color-primary)" }
                      : {}),
                  }}
                >
                  Profile
                </Link>
                <form onSubmit={handleLogout}>
                  <button
                    type="submit"
                    className="btn-ghost"
                    style={{
                      padding: "0.375rem 0.75rem",
                      fontSize: "0.875rem",
                    }}
                  >
                    Log out
                  </button>
                </form>

                {/* Mobile Menu Toggle */}
                <button
                  type="button"
                  className="md:hidden p-2"
                  style={{ color: "var(--color-on-surface-variant)" }}
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  aria-label="Toggle navigation menu"
                  aria-expanded={mobileMenuOpen}
                >
                  {mobileMenuOpen ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-5 h-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18 18 6M6 6l12 12"
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-5 h-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Nav Dropdown */}
          {mobileMenuOpen && (
            <div
              className="md:hidden"
              style={{
                background: "var(--color-surface-container-lowest)",
                borderTop: "1px solid rgba(176, 179, 173, 0.15)",
              }}
            >
              <div className="px-4 py-3 space-y-1">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-2 px-3"
                    style={{
                      fontSize: "0.875rem",
                      fontWeight: 500,
                      color: isActive(item.href)
                        ? "var(--color-primary)"
                        : "var(--color-on-surface-variant)",
                      borderRadius: "var(--radius-md)",
                      background: isActive(item.href)
                        ? "rgba(198, 232, 248, 0.2)"
                        : "transparent",
                      textDecoration: "none",
                      transition: "all var(--transition-fast)",
                    }}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </header>

        {/* ── Main Content ── */}
        <main
          className="flex-1 w-full"
          style={{
            maxWidth: "80rem",
            margin: "0 auto",
            padding: "var(--space-6) var(--space-4)",
          }}
        >
          {children}
        </main>
      </div>
    </AssignmentProvider>
  );
}
