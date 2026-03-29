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
        className="min-h-screen flex flex-col md:flex-row"
        style={{ background: "var(--color-surface)" }}
      >
        {/* ── Left Navigation Rail (Desktop) ── */}
        <aside
          className="hidden md:flex flex-col w-64 flex-shrink-0 sticky top-0 h-screen overflow-y-auto"
          style={{
            background: "var(--color-surface-container-low)",
          }}
        >
          <div className="p-6">
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
          </div>

          <nav className="flex-1 px-4 space-y-2 mt-4">
            {navItems.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-3 py-2"
                  style={{
                    fontSize: "0.875rem",
                    fontWeight: 500,
                    color: active
                      ? "var(--color-on-primary-container)"
                      : "var(--color-on-surface-variant)",
                    background: active
                      ? "var(--color-primary-container)"
                      : "transparent",
                    borderRadius: "var(--radius-md)",
                    textDecoration: "none",
                    transition: "all var(--transition-fast)",
                  }}
                >
                  {/* Semantic placeholders for icons */}
                  {item.label === "Dashboard" && (
                     <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={active ? 2 : 1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" /></svg>
                  )}
                  {item.label === "Classes" && (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={active ? 2 : 1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" /></svg>
                  )}
                  {item.label === "Question Bank" && (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={active ? 2 : 1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0 0 12 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75Z" /></svg>
                  )}
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="p-4 mt-auto">
            <div className="flex items-center gap-3 px-3 py-3 mb-2 rounded-md" style={{ background: "var(--color-surface-container)" }}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white" style={{ background: "var(--color-primary)" }}>
                T
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-body-sm font-medium truncate" style={{ color: "var(--color-on-surface)" }}>Teacher</p>
                <Link href="/teacher/profile" className="text-label-md" style={{ color: "var(--color-primary)", textDecoration: "none" }}>View Profile</Link>
              </div>
            </div>
            <form onSubmit={handleLogout}>
              <button
                type="submit"
                className="w-full text-left px-3 py-2 flex items-center gap-3 rounded-md transition-all"
                style={{
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  color: "var(--color-on-surface-variant)",
                }}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
                </svg>
                Log out
              </button>
            </form>
          </div>
        </aside>

        {/* ── Top Navigation (Tablet/Mobile Only) ── */}
        <header
          className="md:hidden glass sticky top-0 z-30 w-full"
        >
          <div className="px-4">
            <div className="flex justify-between h-14 items-center">
              <Link
                href="/teacher/dashboard"
                className="text-display-sm"
                style={{
                  fontFamily: "var(--font-manrope), var(--font-geist-sans), system-ui, sans-serif",
                  fontSize: "1.125rem",
                  fontWeight: 700,
                  color: "var(--color-primary)",
                  letterSpacing: "-0.02em",
                  textDecoration: "none",
                }}
              >
                Shiksha Sathi
              </Link>

              <div className="flex items-center gap-2">
                <CartIcon />
                <button
                  type="button"
                  className="p-2"
                  style={{ color: "var(--color-on-surface-variant)" }}
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                  {mobileMenuOpen ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Nav Dropdown */}
          {mobileMenuOpen && (
            <div
              style={{
                background: "var(--color-surface-container-lowest)",
                borderBottom: "1px solid rgba(176, 179, 173, 0.15)",
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
                    }}
                  >
                    {item.label}
                  </Link>
                ))}
                <Link
                  href="/teacher/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2 px-3"
                  style={{ fontSize: "0.875rem", fontWeight: 500, color: "var(--color-on-surface-variant)", textDecoration: "none" }}
                >
                  Profile
                </Link>
                <form onSubmit={handleLogout}>
                  <button type="submit" className="w-full text-left py-2 px-3" style={{ fontSize: "0.875rem", fontWeight: 500, color: "var(--color-on-surface-variant)" }}>
                    Log out
                  </button>
                </form>
              </div>
            </div>
          )}
        </header>

        {/* ── Main Content ── */}
        <main
          className="flex-1 w-full relative"
          style={{
            maxWidth: "100%",
          }}
        >
          {/* Internal Desktop Max-Width wrapper if needed by child pages, but header sticky cart logic requires relative positioning */}
          <div className="w-full h-full relative" style={{
            maxWidth: "80rem",
            margin: "0 auto",
          }}>
            {/* Display Desktop cart icon as floating action or similar, but the prompt says Cart/Right Tray should be per-page context. 
                For Layout we just render children. */}
            <div className="p-4 md:p-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </AssignmentProvider>
  );
}
