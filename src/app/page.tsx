import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-surface">
      {/* ── Navbar ── */}
      <header className="glass sticky top-0 z-30 border-b border-outline-variant/15">
        <div className="max-w-5xl mx-auto flex justify-between items-center px-4 py-3 sm:px-6">
          <span className="font-display text-lg font-bold text-primary tracking-tight">
            Shiksha Sathi
          </span>
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="nav-link px-3 py-2 hidden sm:inline-flex"
            >
              Teacher Login
            </Link>
            <Link href="/login" className="nav-link px-2 py-2 sm:hidden text-sm">
              Login
            </Link>
            <Link href="/signup" className="btn-primary text-sm sm:text-base">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero Section ── */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12 sm:px-6 sm:py-16 md:py-20">
        <div className="max-w-3xl text-center">
          {/* Trust Badge */}
          <div className="badge mb-6 inline-flex">
            NCERT Aligned · Free for Teachers
          </div>

          <h1 className="text-display-lg mb-5" style={{ fontSize: "clamp(2rem, 5vw, 3rem)", lineHeight: 1.15 }}>
            Create, Share &amp; Auto-Grade{" "}
            <br className="hidden sm:block" />
            <span className="text-primary">
              Assignments in Minutes
            </span>
          </h1>

          <p className="text-body-lg text-on-surface-variant max-w-xl mx-auto mb-8 leading-relaxed">
            Shiksha Sathi is a teacher-first platform for Indian schools.
            Browse NCERT question banks, create homework assignments, share a
            link with students, and get auto-graded results — all in one
            place.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-12 sm:mb-16">
            <Link
              href="/signup"
              className="btn-primary px-8 py-3 text-base"
            >
              Create Free Account
            </Link>
            <Link
              href="/login"
              className="btn-ghost px-8 py-3 text-base"
            >
              I already have an account
            </Link>
          </div>

          {/* ── Feature Highlights ── */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 text-left">
            <div className="card-static">
              <div className="text-label-sm text-primary mb-3">
                Question Bank
              </div>
              <p className="text-headline-sm mb-2">
                Browse NCERT Curriculum
              </p>
              <p className="text-body-sm">
                Filter by board, class, subject, book, and chapter. Preview
                answers and explanations before adding to your assignment.
              </p>
            </div>

            <div className="card-static">
              <div className="text-label-sm text-primary mb-3">
                Auto-Grading
              </div>
              <p className="text-headline-sm mb-2">
                Instant Student Feedback
              </p>
              <p className="text-body-sm">
                Students answer via a shared link — no login required. Scores
                and correct answers are shown immediately after submission.
              </p>
            </div>

            <div className="card-static">
              <div className="text-label-sm text-primary mb-3">
                Reports
              </div>
              <p className="text-headline-sm mb-2">
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
      <footer className="py-6 text-center border-t border-outline-variant/15">
        <p className="text-body-sm text-on-surface-variant">
          Built for Indian teachers · NCERT aligned · Free to use
        </p>
      </footer>
    </div>
  );
}
