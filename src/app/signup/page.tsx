"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { setCookie } from "cookies-next";
import { auth } from "@/lib/api/auth";
import AuthShell from "@/components/AuthShell";

const labelStyle = {
  display: "block",
  fontSize: "0.75rem",
  fontWeight: 600,
  textTransform: "uppercase" as const,
  letterSpacing: "0.05em",
  color: "var(--color-on-surface-variant)",
  marginBottom: "var(--space-2)",
};

const inputStyle = {
  width: "100%",
  background: "var(--color-surface-container-highest)",
  border: "none",
  borderBottom: "1px solid var(--color-outline-variant)",
  padding: "var(--space-3) 0",
  color: "var(--color-on-surface)",
  fontSize: "1rem",
  outline: "none",
  transition: "border-color 200ms ease-out",
};

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
        role: "TEACHER",
      });

      setCookie("auth-token", response.token, {
        maxAge: 30 * 24 * 60 * 60,
        path: "/",
      });

      router.push("/teacher/dashboard");
    } catch (err: unknown) {
      const apiError = err as { message?: string };
      setError(apiError.message || "We could not create your account right now.");
      setIsPending(false);
      return;
    }

    setIsPending(false);
  };

  return (
    <AuthShell
      eyebrow="Join the Community"
      title="Begin Your Journey"
      description="Create your teacher workspace to publish assignments, guide student practice, and keep your classroom operations in one calm academic system."
      alternatePrompt="Already an educator here?"
      alternateHref="/login"
      alternateLabel="Log in instead"
      legalNote={
        <>
          By creating an account, you agree to Shiksha Sathi&apos;s{" "}
          <a href="#" style={{ color: "var(--color-primary)", textDecoration: "underline" }}>
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="#" style={{ color: "var(--color-primary)", textDecoration: "underline" }}>
            Privacy Policy
          </a>
          .
        </>
      }
    >
      {error ? (
        <div
          style={{
            marginBottom: "var(--space-6)",
            padding: "var(--space-4)",
            background: "rgba(168, 56, 54, 0.08)",
            color: "var(--color-error)",
            fontSize: "0.875rem",
            borderRadius: "var(--radius-md)",
          }}
        >
          {error}
        </div>
      ) : null}

      <form onSubmit={handleSubmit} style={{ display: "grid", gap: "var(--space-8)" }}>
        <div>
          <label htmlFor="signup-name" style={labelStyle}>
            Full Name
          </label>
          <input
            id="signup-name"
            type="text"
            name="name"
            required
            placeholder="E.g. Dr. Ananya Sharma"
            style={inputStyle}
            className="auth-field"
          />
        </div>

        <div>
          <label htmlFor="signup-email" style={labelStyle}>
            Email Address
          </label>
          <input
            id="signup-email"
            type="email"
            name="email"
            required
            placeholder="teacher@school.com"
            style={inputStyle}
            className="auth-field"
          />
        </div>

        <div className="auth-two-column-grid" style={{ display: "grid", gap: "var(--space-8)" }}>
          <div>
            <label htmlFor="signup-phone" style={labelStyle}>
              Phone Number
            </label>
            <input
              id="signup-phone"
              type="tel"
              name="phone"
              required
              placeholder="+91 98765 43210"
              style={inputStyle}
              className="auth-field"
            />
          </div>

          <div>
            <label htmlFor="signup-password" style={labelStyle}>
              Password
            </label>
            <input
              id="signup-password"
              type="password"
              name="password"
              required
              placeholder="••••••••"
              style={inputStyle}
              className="auth-field"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="auth-submit"
          style={{
            width: "100%",
            padding: "var(--space-4) var(--space-6)",
            background:
              "linear-gradient(145deg, var(--color-primary), var(--color-primary-dim))",
            color: "var(--color-on-primary)",
            border: "none",
            borderRadius: "var(--radius-lg)",
            fontSize: "0.875rem",
            fontWeight: 700,
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            cursor: isPending ? "wait" : "pointer",
            boxShadow: "var(--shadow-md)",
            transition: "transform 120ms ease-out, opacity 120ms ease-out",
            opacity: isPending ? 0.75 : 1,
          }}
        >
          {isPending ? "Creating Account…" : "Create Teacher Account"}
        </button>
      </form>

      <style>{`
        .auth-field:focus {
          border-bottom-color: var(--color-primary) !important;
        }
        .auth-submit:hover {
          opacity: 0.92;
          transform: translateY(-1px);
        }
        .auth-submit:active {
          transform: scale(0.98);
        }
        @media (min-width: 768px) {
          .auth-two-column-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }
      `}</style>
    </AuthShell>
  );
}
