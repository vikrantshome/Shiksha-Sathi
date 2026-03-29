import Link from "next/link";

export default function Home() {
  return (
    <div
      className="flex flex-col min-h-screen"
      style={{ background: "var(--color-surface)" }}
    >
      {/* ── Navbar ── */}
      <header
        className="glass sticky top-0 z-30"
        style={{
          borderBottom: "1px solid rgba(176, 179, 173, 0.15)",
        }}
      >
        <div
          className="max-w-5xl mx-auto flex justify-between items-center"
          style={{ padding: "var(--space-3) var(--space-6)" }}
        >
          <span
            style={{
              fontFamily:
                "var(--font-manrope), var(--font-geist-sans), system-ui, sans-serif",
              fontSize: "1.125rem",
              fontWeight: 700,
              color: "var(--color-primary)",
              letterSpacing: "-0.02em",
            }}
          >
            Shiksha Sathi
          </span>
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="nav-link"
              style={{
                padding: "var(--space-2) var(--space-3)",
                paddingBottom: "var(--space-2)",
              }}
            >
              Teacher Login
            </Link>
            <Link href="/signup" className="btn-primary">
              Get Started Free
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero Section ── */}
      <main
        className="flex-1 flex flex-col items-center justify-center"
        style={{ padding: "var(--space-16) var(--space-6)" }}
      >
        <div className="max-w-3xl text-center">
          {/* Trust Badge */}
          <div
            className="badge"
            style={{
              marginBottom: "var(--space-6)",
              display: "inline-flex",
            }}
          >
            NCERT Aligned · Free for Teachers
          </div>

          <h1
            className="text-display-lg"
            style={{
              fontSize: "clamp(2rem, 5vw, 3rem)",
              lineHeight: 1.15,
              marginBottom: "var(--space-5)",
            }}
          >
            Create, Share & Auto-Grade{" "}
            <br className="hidden sm:block" />
            <span style={{ color: "var(--color-primary)" }}>
              Assignments in Minutes
            </span>
          </h1>

          <p
            className="text-body-lg"
            style={{
              color: "var(--color-on-surface-variant)",
              maxWidth: "36rem",
              margin: "0 auto",
              marginBottom: "var(--space-8)",
              lineHeight: 1.7,
            }}
          >
            Shiksha Sathi is a teacher-first platform for Indian schools.
            Browse NCERT question banks, create homework assignments, share a
            link with students, and get auto-graded results — all in one
            place.
          </p>

          {/* CTAs */}
          <div
            className="flex flex-col sm:flex-row items-center justify-center gap-3"
            style={{ marginBottom: "var(--space-16)" }}
          >
            <Link
              href="/signup"
              className="btn-primary"
              style={{
                padding: "var(--space-3) var(--space-8)",
                fontSize: "1rem",
              }}
            >
              Create Free Account
            </Link>
            <Link
              href="/login"
              className="btn-ghost"
              style={{
                padding: "var(--space-3) var(--space-8)",
                fontSize: "1rem",
              }}
            >
              I already have an account
            </Link>
          </div>

          {/* ── Feature Highlights ── */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 text-left">
            <div className="card-static">
              <div
                className="text-label-sm"
                style={{
                  color: "var(--color-primary)",
                  marginBottom: "var(--space-3)",
                }}
              >
                Question Bank
              </div>
              <p
                className="text-headline-sm"
                style={{ marginBottom: "var(--space-2)" }}
              >
                Browse NCERT Curriculum
              </p>
              <p className="text-body-sm">
                Filter by board, class, subject, book, and chapter. Preview
                answers and explanations before adding to your assignment.
              </p>
            </div>

            <div className="card-static">
              <div
                className="text-label-sm"
                style={{
                  color: "var(--color-primary)",
                  marginBottom: "var(--space-3)",
                }}
              >
                Auto-Grading
              </div>
              <p
                className="text-headline-sm"
                style={{ marginBottom: "var(--space-2)" }}
              >
                Instant Student Feedback
              </p>
              <p className="text-body-sm">
                Students answer via a shared link — no login required. Scores
                and correct answers are shown immediately after submission.
              </p>
            </div>

            <div className="card-static">
              <div
                className="text-label-sm"
                style={{
                  color: "var(--color-primary)",
                  marginBottom: "var(--space-3)",
                }}
              >
                Reports
              </div>
              <p
                className="text-headline-sm"
                style={{ marginBottom: "var(--space-2)" }}
              >
                Track Class Performance
              </p>
              <p className="text-body-sm">
                View student submissions, average scores, and per-question
                performance analysis to identify learning gaps.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* ── Footer ── */}
      <footer
        style={{
          padding: "var(--space-6)",
          textAlign: "center",
          borderTop: "1px solid rgba(176, 179, 173, 0.15)",
        }}
      >
        <p
          className="text-body-sm"
          style={{ color: "var(--color-on-surface-variant)" }}
        >
          Built for Indian teachers · NCERT aligned · Free to use
        </p>
      </footer>
    </div>
  );
}
