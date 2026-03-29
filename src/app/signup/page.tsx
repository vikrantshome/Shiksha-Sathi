"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { setCookie } from "cookies-next";
import { auth } from "@/lib/api/auth";

/* ─────────────────────────────────────────────────────────
   Signup Page — Stitch-Directed Redesign 
   Design Source: doc/stitch_shiksha_sathi_ui_refresh/identity_entry
   Same visual language as Login, with additional fields.
   ───────────────────────────────────────────────────────── */

export default function SignupPage() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const password = formData.get("password") as string;

    try {
      const response = await auth.signup({
        name,
        email,
        phone,
        password,
        role: "TEACHER", // Defaulting to TEACHER for now
      });

      // Store token securely in cookies
      setCookie("auth-token", response.token, {
        maxAge: 30 * 24 * 60 * 60, // 30 days
        path: "/",
      });

      router.push("/teacher");
    } catch (err: unknown) {
      const error = err as { message?: string };
      setError(error.message || "Something went wrong. Please try again.");
      setIsPending(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--color-surface)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Main Canvas */}
      <main
        style={{
          flexGrow: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "var(--space-6)",
          position: "relative",
        }}
      >
        {/* Ambient Background */}
        <div style={{ position: "fixed", top: "-10%", left: "-5%", width: "40%", height: "60%", background: "rgba(198, 232, 248, 0.08)", borderRadius: "50%", filter: "blur(120px)", pointerEvents: "none", zIndex: 0 }} />
        <div style={{ position: "fixed", top: "60%", right: "-10%", width: "35%", height: "50%", background: "rgba(215, 227, 250, 0.15)", borderRadius: "50%", filter: "blur(100px)", pointerEvents: "none", zIndex: 0 }} />

        <div style={{ width: "100%", maxWidth: "28rem", position: "relative", zIndex: 1 }}>
          {/* Card Glow */}
          <div style={{ position: "absolute", inset: "-4px", background: "linear-gradient(to top right, rgba(68, 99, 113, 0.04), transparent)", filter: "blur(16px)", opacity: 0.5 }} />

          {/* Card */}
          <div
            style={{
              position: "relative",
              background: "var(--color-surface-container-lowest)",
              border: "1px solid rgba(176, 179, 173, 0.1)",
              padding: "var(--space-8)",
              boxShadow: "0 12px 32px rgba(48, 51, 47, 0.04)",
            }}
            className="auth-card"
          >
            {/* Editorial Header */}
            <div style={{ marginBottom: "var(--space-10)", textAlign: "center" }}>
              <Link
                href="/"
                style={{
                  fontFamily: "var(--font-manrope), system-ui, sans-serif",
                  fontSize: "1.125rem",
                  fontWeight: 700,
                  color: "var(--color-primary)",
                  letterSpacing: "-0.03em",
                  textDecoration: "none",
                  display: "block",
                  marginBottom: "var(--space-6)",
                }}
              >
                Shiksha Sathi
              </Link>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "3rem",
                  height: "3rem",
                  background: "rgba(198, 232, 248, 0.3)",
                  borderRadius: "50%",
                  marginBottom: "var(--space-6)",
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <h1
                style={{
                  fontFamily: "var(--font-manrope), system-ui, sans-serif",
                  fontSize: "1.5rem",
                  fontWeight: 700,
                  color: "var(--color-on-surface)",
                  letterSpacing: "-0.02em",
                  marginBottom: "var(--space-2)",
                }}
              >
                Create Account
              </h1>
              <p
                style={{
                  color: "var(--color-on-surface-variant)",
                  fontSize: "0.875rem",
                  lineHeight: 1.5,
                  maxWidth: "18rem",
                  margin: "0 auto",
                }}
              >
                Join Shiksha Sathi to create assignments and empower student learning.
              </p>
            </div>

            {/* Error */}
            {error && (
              <div
                style={{
                  marginBottom: "var(--space-5)",
                  padding: "var(--space-3)",
                  background: "rgba(168, 56, 54, 0.06)",
                  color: "var(--color-error)",
                  fontSize: "0.8125rem",
                  textAlign: "center",
                }}
              >
                {error}
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}
            >
              <div>
                <label htmlFor="signup-name" style={{ display: "block", fontSize: "0.6875rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--color-on-surface-variant)", marginBottom: "var(--space-2)" }}>
                  Full Name
                </label>
                <input
                  id="signup-name"
                  type="text"
                  name="name"
                  required
                  placeholder="Dr. Ramesh Sharma"
                  style={{ width: "100%", background: "var(--color-surface-container-low)", border: "none", borderBottom: "1px solid rgba(176, 179, 173, 0.2)", padding: "var(--space-3) 0", color: "var(--color-on-surface)", fontSize: "1rem", outline: "none", transition: "border-color 300ms ease-out" }}
                  className="auth-input"
                />
              </div>

              <div>
                <label htmlFor="signup-email" style={{ display: "block", fontSize: "0.6875rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--color-on-surface-variant)", marginBottom: "var(--space-2)" }}>
                  Email Address
                </label>
                <input
                  id="signup-email"
                  type="email"
                  name="email"
                  required
                  placeholder="teacher@school.com"
                  style={{ width: "100%", background: "var(--color-surface-container-low)", border: "none", borderBottom: "1px solid rgba(176, 179, 173, 0.2)", padding: "var(--space-3) 0", color: "var(--color-on-surface)", fontSize: "1rem", outline: "none", transition: "border-color 300ms ease-out" }}
                  className="auth-input"
                />
              </div>

              <div>
                <label htmlFor="signup-phone" style={{ display: "block", fontSize: "0.6875rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--color-on-surface-variant)", marginBottom: "var(--space-2)" }}>
                  Phone Number
                </label>
                <input
                  id="signup-phone"
                  type="tel"
                  name="phone"
                  required
                  placeholder="+91 9876543210"
                  style={{ width: "100%", background: "var(--color-surface-container-low)", border: "none", borderBottom: "1px solid rgba(176, 179, 173, 0.2)", padding: "var(--space-3) 0", color: "var(--color-on-surface)", fontSize: "1rem", outline: "none", transition: "border-color 300ms ease-out" }}
                  className="auth-input"
                />
              </div>

              <div>
                <label htmlFor="signup-password" style={{ display: "block", fontSize: "0.6875rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--color-on-surface-variant)", marginBottom: "var(--space-2)" }}>
                  Password
                </label>
                <input
                  id="signup-password"
                  type="password"
                  name="password"
                  required
                  placeholder="••••••••"
                  style={{ width: "100%", background: "var(--color-surface-container-low)", border: "none", borderBottom: "1px solid rgba(176, 179, 173, 0.2)", padding: "var(--space-3) 0", color: "var(--color-on-surface)", fontSize: "1rem", outline: "none", transition: "border-color 300ms ease-out" }}
                  className="auth-input"
                />
              </div>

              <div style={{ paddingTop: "var(--space-4)" }}>
                <button
                  type="submit"
                  disabled={isPending}
                  style={{
                    width: "100%",
                    background: "linear-gradient(135deg, var(--color-primary), var(--color-primary-dim))",
                    color: "var(--color-on-primary)",
                    padding: "var(--space-4) var(--space-6)",
                    border: "none",
                    fontWeight: 700,
                    letterSpacing: "0.05em",
                    cursor: isPending ? "wait" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "var(--space-2)",
                    transition: "all 200ms ease-out",
                    boxShadow: "0 4px 12px rgba(68, 99, 113, 0.2)",
                    opacity: isPending ? 0.7 : 1,
                  }}
                  className="auth-submit"
                >
                  <span>{isPending ? "Creating account…" : "Sign Up"}</span>
                  {!isPending && (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                    </svg>
                  )}
                </button>
              </div>
            </form>

            <p
              style={{
                fontSize: "0.875rem",
                textAlign: "center",
                marginTop: "var(--space-8)",
                color: "var(--color-on-surface-variant)",
              }}
            >
              Already have an account?{" "}
              <Link
                href="/login"
                style={{
                  color: "var(--color-primary)",
                  fontWeight: 600,
                  textDecoration: "none",
                }}
              >
                Log in
              </Link>
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer
        style={{
          padding: "var(--space-8)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "var(--space-4)",
        }}
      >
        <div style={{ width: "3rem", height: "2px", background: "rgba(68, 99, 113, 0.2)" }} />
        <p style={{ fontSize: "0.6875rem", color: "var(--color-on-surface-variant)", fontWeight: 500, letterSpacing: "0.15em", textTransform: "uppercase" }}>
          Shiksha Sathi © 2025
        </p>
      </footer>

      <style>{`
        .auth-input:focus { border-bottom-color: var(--color-primary) !important; border-bottom-width: 2px; }
        .auth-submit:hover { box-shadow: 0 8px 20px rgba(68, 99, 113, 0.3) !important; transform: scale(1.01); }
        .auth-submit:active { transform: scale(0.98); }
        @media (min-width: 768px) {
          .auth-card { padding: var(--space-12) !important; }
        }
      `}</style>
    </div>
  );
}
