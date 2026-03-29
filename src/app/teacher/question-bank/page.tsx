import { api } from "@/lib/api";
import { Question } from "@/lib/api/types";
import QuestionBankFilters, { QuestionBankSearch } from "@/components/QuestionBankFilters";
import QuestionCard from "@/components/QuestionCard";
import AssignmentTray from "@/components/AssignmentTray";

export const dynamic = "force-dynamic";

/* ─────────────────────────────────────────────────────────
   Question Bank Page — Stitch-Directed Redesign
   Design Source: doc/stitch_shiksha_sathi_ui_refresh/question_bank
   Implements: "Question Repository" layout with 3-panel workspace,
   taxonomy left rail in sidebar, center search+results, right
   assignment tray. All styled with Digital Atelier design tokens.
   ───────────────────────────────────────────────────────── */

export default async function QuestionBankPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await searchParams;
  const board =
    typeof resolvedParams.board === "string" ? resolvedParams.board : null;
  const classLevel =
    typeof resolvedParams.class === "string" ? resolvedParams.class : null;
  const subjectId =
    typeof resolvedParams.subject === "string"
      ? resolvedParams.subject
      : null;
  const book =
    typeof resolvedParams.book === "string" ? resolvedParams.book : null;
  const chapter =
    typeof resolvedParams.chapter === "string"
      ? resolvedParams.chapter
      : null;
  const q =
    typeof resolvedParams.q === "string"
      ? resolvedParams.q.toLowerCase()
      : null;
  const type =
    typeof resolvedParams.type === "string" ? resolvedParams.type : "ALL";

  // Server-side DB fetching and filtering via Spring Boot API
  const [boards, classes, subjects, booksData] = await Promise.all([
    api.questions.getBoards(),
    api.questions.getClasses(board || undefined),
    api.questions.getSubjects(),
    api.questions.getBooks({
      board: board || undefined,
      classLevel: classLevel || undefined,
      subject: subjectId || undefined,
    }),
  ]);

  const chapters = await api.questions.getChapters(
    subjectId || undefined,
    book || undefined
  );

  // Fetch only if chapter is selected, or if user is searching globally
  let displayedQuestions: Question[] = [];
  if (chapter || q) {
    displayedQuestions = await api.questions.search({
      board,
      classLevel,
      subjectId,
      book,
      chapter,
      q,
      type,
      visibleOnly: true,
    });
  }

  // Determine empty state message and icon
  const getEmptyState = () => {
    if (!board && !q) {
      return {
        title: "Select a Board to Begin",
        description:
          "Choose your board and grade from the left panel to explore curated academic content.",
        icon: "board",
      };
    }
    if (!classLevel && !q) {
      return {
        title: "Select a Class",
        description: "Pick a class level to narrow down your curriculum.",
        icon: "class",
      };
    }
    if (!subjectId && !q) {
      return {
        title: "Choose a Subject",
        description: "Select a subject to explore available chapters.",
        icon: "subject",
      };
    }
    if (!chapter && !q) {
      return {
        title: "Pick a Chapter",
        description: "Select a chapter to view questions.",
        icon: "chapter",
      };
    }
    return null;
  };

  const emptyState = getEmptyState();

  const EmptyIcon = () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--color-outline-variant)" }}>
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
    </svg>
  );

  return (
    <div style={{ paddingBottom: "6rem" }}>
      {/* ═══ Page Header ═══ */}
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          marginBottom: "var(--space-6)",
        }}
      >
        <h1
          style={{
            fontFamily: "var(--font-manrope), system-ui, sans-serif",
            fontSize: "1.5rem",
            fontWeight: 700,
            letterSpacing: "-0.03em",
            color: "var(--color-on-surface)",
            margin: 0,
          }}
        >
          Question Repository
        </h1>
        {!emptyState && (
          <span
            style={{
              fontSize: "0.6875rem",
              fontWeight: 700,
              color: "var(--color-on-surface-variant)",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
            }}
          >
            Showing {displayedQuestions.length} result
            {displayedQuestions.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* ═══ Search + Type Filter Bar ═══ */}
      <QuestionBankSearch />

      {/* ═══ 3-Panel Workspace Grid ═══ */}
      <div className="qb-workspace-grid">
        {/* Left Rail: Taxonomy Navigation */}
        <div className="qb-taxonomy-rail">
          <div
            style={{
              position: "sticky",
              top: "var(--space-6)",
            }}
          >
            <QuestionBankFilters
              subjects={subjects}
              chapters={chapters}
              boards={boards}
              classes={classes}
              books={booksData}
            />
          </div>
        </div>

        {/* Center: Question Results */}
        <div className="qb-results-panel">
          {emptyState ? (
            /* Progressive Empty State — Stitch Direction */
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "24rem",
                textAlign: "center",
                padding: "var(--space-12)",
              }}
            >
              <div
                style={{
                  width: "4rem",
                  height: "4rem",
                  background: "var(--color-surface-container-low)",
                  borderRadius: "var(--radius-full)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "var(--space-6)",
                }}
              >
                <EmptyIcon />
              </div>
              <h3
                style={{
                  fontFamily: "var(--font-manrope), system-ui, sans-serif",
                  fontSize: "1.125rem",
                  fontWeight: 700,
                  color: "var(--color-on-surface)",
                  margin: "0 0 var(--space-2)",
                }}
              >
                {emptyState.title}
              </h3>
              <p
                style={{
                  fontSize: "0.875rem",
                  color: "var(--color-on-surface-variant)",
                  maxWidth: "20rem",
                  lineHeight: 1.5,
                  margin: 0,
                }}
              >
                {emptyState.description}
              </p>
            </div>
          ) : (
            <div>
              {displayedQuestions.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "var(--space-12)",
                    color: "var(--color-on-surface-variant)",
                    fontSize: "0.875rem",
                  }}
                >
                  No questions found matching your criteria.
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
                  {displayedQuestions.map((question) => (
                    <QuestionCard key={question.id} question={question} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Rail: Assignment Tray */}
        <div className="qb-assignment-rail">
          <AssignmentTray />
        </div>
      </div>

      {/* ═══ Responsive Grid Styles ═══ */}
      <style>{`
        .qb-workspace-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: var(--space-6);
        }

        /* Taxonomy rail */
        .qb-taxonomy-rail {
          order: 1;
        }

        /* Results panel */
        .qb-results-panel {
          order: 2;
        }

        /* Assignment rail */
        .qb-assignment-rail {
          order: 3;
        }

        /* Tablet: 2 columns, taxonomy stacks above */
        @media (min-width: 768px) {
          .qb-workspace-grid {
            grid-template-columns: 1fr 1fr;
          }
          .qb-taxonomy-rail {
            grid-column: 1 / -1;
            order: 1;
          }
          .qb-results-panel {
            order: 2;
          }
          .qb-assignment-rail {
            order: 3;
          }
        }

        /* Desktop: Full 3-panel layout */
        @media (min-width: 1024px) {
          .qb-workspace-grid {
            grid-template-columns: 14rem 1fr 16rem;
            gap: var(--space-8);
          }
          .qb-taxonomy-rail {
            grid-column: auto;
            order: 1;
          }
          .qb-results-panel {
            order: 2;
          }
          .qb-assignment-rail {
            order: 3;
          }
        }
      `}</style>
    </div>
  );
}
