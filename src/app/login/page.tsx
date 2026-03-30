"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { setCookie } from "cookies-next";
import { auth } from "@/lib/api/auth";
import AuthShell from "@/components/AuthShell";

const fieldLabelStyle = {
  display: "block",
  fontSize: "0.75rem",
  fontWeight: 600,
  textTransform: "uppercase" as const,
  letterSpacing: "0.05em",
  color: "var(--color-on-surface-variant)",
  marginBottom: "var(--space-2)",
};

const fieldStyle = {
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

export default function LoginPage() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const response = await auth.login({ email, password });

      setCookie("auth-token", response.token, {
        maxAge: 30 * 24 * 60 * 60,
        path: "/",
      });

      if (response.role === "TEACHER") {
        router.push("/teacher/dashboard");
      } else {
        router.push("/");
      }
    } catch (err: unknown) {
      const apiError = err as { message?: string };
      setError(apiError.message || "Invalid credentials. Please try again.");
      setIsPending(false);
      return;
    }

    setIsPending(false);
  };

  return (
    <AuthShell
      eyebrow="Welcome Back"
      title="Return to Your Studio"
      description="Sign in to your Shiksha Sathi workspace to create assignments, monitor submissions, and keep your classroom rhythm on track."
      alternatePrompt="Need a teacher account?"
      alternateHref="/signup"
      alternateLabel="Create one now"
      legalNote={
        <>
          By continuing, you agree to Shiksha Sathi&apos;s{" "}
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
          <label htmlFor="login-email" style={fieldLabelStyle}>
            Email Address
          </label>
          <input
            id="login-email"
            type="email"
            name="email"
            required
            placeholder="teacher@school.com"
            style={fieldStyle}
            className="auth-field"
          />
        </div>

        <div>
          <label htmlFor="login-password" style={fieldLabelStyle}>
            Password
          </label>
          <input
            id="login-password"
            type="password"
            name="password"
            required
            placeholder="••••••••"
            style={fieldStyle}
            className="auth-field"
          />
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
          {isPending ? "Signing In…" : "Sign In to Workspace"}
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
      `}</style>
    </AuthShell>
  );
}
