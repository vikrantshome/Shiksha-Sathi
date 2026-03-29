"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { setCookie } from "cookies-next";
import { auth } from "@/lib/api/auth";

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

      // Store token securely in cookies
      setCookie("auth-token", response.token, {
        maxAge: 30 * 24 * 60 * 60, // 30 days
        path: "/",
      });

      // Redirect based on role
      if (response.role === "TEACHER") {
        router.push("/teacher");
      } else {
        router.push("/dashboard");
      }
    } catch (err: unknown) {
      const error = err as { message?: string };
      setError(error.message || "Invalid credentials");
      setIsPending(false);
    }
  };

  return (
    <div
      className="flex items-center justify-center min-h-screen px-4"
      style={{ background: "var(--color-surface)" }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "24rem",
          padding: "var(--space-8)",
          background: "var(--color-surface-container-lowest)",
          borderRadius: "var(--radius-md)",
        }}
      >
        {/* Brand + Header */}
        <div style={{ textAlign: "center", marginBottom: "var(--space-8)" }}>
          <Link
            href="/"
            style={{
              fontFamily:
                "var(--font-manrope), var(--font-geist-sans), system-ui, sans-serif",
              fontSize: "1.125rem",
              fontWeight: 700,
              color: "var(--color-primary)",
              letterSpacing: "-0.02em",
              textDecoration: "none",
              display: "block",
              marginBottom: "var(--space-4)",
            }}
          >
            Shiksha Sathi
          </Link>
          <h1 className="text-headline-md">Welcome Back</h1>
          <p
            className="text-body-sm"
            style={{
              color: "var(--color-on-surface-variant)",
              marginTop: "var(--space-1)",
            }}
          >
            Log in to your teacher account
          </p>
        </div>

        {/* Error */}
        {error && (
          <div
            style={{
              marginBottom: "var(--space-5)",
              padding: "var(--space-3)",
              background: "var(--color-error-container)",
              color: "var(--color-error)",
              borderRadius: "var(--radius-sm)",
              fontSize: "0.8125rem",
            }}
          >
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-5)",
          }}
        >
          <div>
            <label
              className="text-label-md"
              style={{
                display: "block",
                color: "var(--color-on-surface-variant)",
                marginBottom: "var(--space-1-5)",
              }}
            >
              Email Address
            </label>
            <input
              type="email"
              name="email"
              required
              className="input-academic"
              placeholder="teacher@school.com"
            />
          </div>

          <div>
            <label
              className="text-label-md"
              style={{
                display: "block",
                color: "var(--color-on-surface-variant)",
                marginBottom: "var(--space-1-5)",
              }}
            >
              Password
            </label>
            <input
              type="password"
              name="password"
              required
              className="input-academic"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="btn-primary"
            style={{ width: "100%", padding: "var(--space-3)", marginTop: "var(--space-2)" }}
          >
            {isPending ? "Logging in…" : "Log In"}
          </button>
        </form>

        <p
          className="text-body-sm"
          style={{
            textAlign: "center",
            marginTop: "var(--space-6)",
          }}
        >
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            style={{
              color: "var(--color-primary)",
              fontWeight: 500,
              textDecoration: "none",
            }}
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
