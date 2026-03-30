import Link from "next/link";
import { ReactNode } from "react";

interface AuthShellProps {
  eyebrow: string;
  title: string;
  description: string;
  alternatePrompt: string;
  alternateHref: string;
  alternateLabel: string;
  children: ReactNode;
  legalNote?: ReactNode;
}

export default function AuthShell({
  eyebrow,
  title,
  description,
  alternatePrompt,
  alternateHref,
  alternateLabel,
  children,
  legalNote,
}: AuthShellProps) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--color-surface)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 40,
          background: "rgba(250, 249, 245, 0.84)",
          backdropFilter: "blur(24px)",
          boxShadow: "0 12px 32px rgba(48, 51, 47, 0.04)",
        }}
      >
        <div
          style={{
            height: "5rem",
            display: "flex",
            alignItems: "center",
            padding: "0 var(--space-6)",
          }}
        >
          <Link
            href="/"
            style={{
              fontFamily: "var(--font-manrope), system-ui, sans-serif",
              fontSize: "1.5rem",
              fontWeight: 700,
              letterSpacing: "-0.02em",
              color: "var(--color-primary)",
              textDecoration: "none",
            }}
          >
            Shiksha Sathi
          </Link>
        </div>
      </header>

      <main
        className="auth-shell-main"
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "var(--space-8) var(--space-6) var(--space-12)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at top right, var(--color-secondary-container) 0%, transparent 40%), radial-gradient(circle at bottom left, var(--color-surface-container) 0%, transparent 30%)",
            pointerEvents: "none",
          }}
        />

        <div className="auth-shell-accent">
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
            <div style={{ width: "3rem", height: "1px", background: "var(--color-primary)" }} />
            <p
              style={{
                fontSize: "0.75rem",
                fontWeight: 600,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "rgba(93, 96, 91, 0.72)",
                lineHeight: 1.9,
                margin: 0,
              }}
            >
              Curating the future
              <br />
              of classroom craft.
            </p>
          </div>
        </div>

        <section
          className="auth-shell-card"
          style={{
            width: "100%",
            maxWidth: "40rem",
            background: "var(--color-surface-container-low)",
            padding: "var(--space-8)",
            borderRadius: "var(--radius-lg)",
            boxShadow: "0 12px 32px rgba(48, 51, 47, 0.04)",
            position: "relative",
            overflow: "hidden",
            zIndex: 1,
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              width: "8rem",
              height: "8rem",
              background: "rgba(214, 229, 236, 0.4)",
              filter: "blur(36px)",
              transform: "translate(30%, -30%)",
              pointerEvents: "none",
            }}
          />

          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{ marginBottom: "var(--space-8)" }}>
              <span
                style={{
                  display: "block",
                  fontSize: "0.625rem",
                  fontWeight: 700,
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  color: "var(--color-on-surface-variant)",
                  marginBottom: "var(--space-2)",
                }}
              >
                {eyebrow}
              </span>
              <h1
                style={{
                  fontFamily: "var(--font-manrope), system-ui, sans-serif",
                  fontSize: "clamp(2rem, 4vw, 2.5rem)",
                  fontWeight: 700,
                  letterSpacing: "-0.03em",
                  color: "var(--color-primary)",
                  margin: 0,
                }}
              >
                {title}
              </h1>
              <p
                style={{
                  fontSize: "1rem",
                  color: "var(--color-on-surface-variant)",
                  marginTop: "var(--space-3)",
                  lineHeight: 1.7,
                  maxWidth: "30rem",
                }}
              >
                {description}
              </p>
            </div>

            {children}

            {legalNote ? (
              <div
                style={{
                  marginTop: "var(--space-6)",
                  fontSize: "0.6875rem",
                  color: "rgba(93, 96, 91, 0.78)",
                  lineHeight: 1.7,
                }}
              >
                {legalNote}
              </div>
            ) : null}

            <div
              style={{
                marginTop: "var(--space-6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "var(--space-2)",
                flexWrap: "wrap",
              }}
            >
              <span style={{ fontSize: "0.875rem", color: "var(--color-on-surface-variant)" }}>
                {alternatePrompt}
              </span>
              <Link
                href={alternateHref}
                style={{
                  fontSize: "0.875rem",
                  fontWeight: 700,
                  color: "var(--color-primary)",
                  textDecoration: "none",
                }}
              >
                {alternateLabel}
              </Link>
            </div>
          </div>
        </section>

        <style>{`
          .auth-shell-accent {
            display: none;
          }
          @media (min-width: 1280px) {
            .auth-shell-main {
              justify-content: center !important;
            }
            .auth-shell-accent {
              display: block;
              position: absolute;
              left: 3rem;
              bottom: 3rem;
              opacity: 0.78;
            }
          }
          @media (min-width: 768px) {
            .auth-shell-card {
              padding: var(--space-12) !important;
            }
          }
        `}</style>
      </main>
    </div>
  );
}
