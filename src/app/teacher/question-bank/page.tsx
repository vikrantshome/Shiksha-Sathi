import { api } from "@/lib/api";
import { Question } from "@/lib/api/types";
import QuestionBankFilters, { QuestionBankSearch } from "@/components/QuestionBankFilters";
import QuestionCard from "@/components/QuestionCard";
import AssignmentTray from "@/components/AssignmentTray";
import QuizTray from "@/components/QuizTray";
import { QuizProvider } from "@/components/QuizContext";

export const dynamic = "force-dynamic";

const EmptyStateIcon = () => (
  <svg
    width="32"
    height="32"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="text-outline-variant"
  >
    <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
  </svg>
);

/* ─────────────────────────────────────────────────────────
   Question Bank Page — Stitch-Directed Redesign
   Design Source: doc/stitch_shiksha_sathi_ui_refresh/question_bank_browse_select
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
  const context = resolvedParams.context || "assignment"; // default to assignment for backward compatibility
  
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
  const chapterNumberParam =
    typeof resolvedParams.chapterNumber === "string"
      ? resolvedParams.chapterNumber
      : null;
  const chapterTitleParam =
    typeof resolvedParams.chapterTitle === "string"
      ? resolvedParams.chapterTitle
      : null;
  const q =
    typeof resolvedParams.q === "string"
      ? resolvedParams.q.toLowerCase()
      : null;
  const type =
    typeof resolvedParams.type === "string" ? resolvedParams.type : "ALL";

  // Server-side DB fetching and filtering via Spring Boot API
  const [boards, classes, subjects] = await Promise.all([
    api.questions.getBoards(),
    api.questions.getClasses(board || undefined),
    api.questions.getSubjects({
      board: board || undefined,
      classLevel: classLevel || undefined,
    }),
  ]);

  const selectedSubject =
    subjectId && subjects.includes(subjectId) ? subjectId : null;

  const booksData = await api.questions.getBooks({
    board: board || undefined,
    classLevel: classLevel || undefined,
    subject: selectedSubject || undefined,
  });

  const selectedBook = book && booksData.includes(book) ? book : null;

  const chaptersMeta = await api.questions.getChaptersMeta({
    board: board || undefined,
    classLevel: classLevel || undefined,
    subjectId: selectedSubject || undefined,
    book: selectedBook || undefined,
    visibleOnly: true,
  });

  const parsedChapterNumberFromLegacy =
    chapter && /chapter\s*(\d+)/i.test(chapter)
      ? Number(chapter.match(/chapter\s*(\d+)/i)?.[1])
      : null;
  const parsedChapterTitleFromLegacy =
    chapter && /chapter\s*\d+\s*:\s*(.+)$/i.test(chapter)
      ? (chapter.match(/chapter\s*\d+\s*:\s*(.+)$/i)?.[1] || "").trim()
      : null;

  const chapterNumberCandidate =
    chapterNumberParam && !Number.isNaN(Number(chapterNumberParam))
      ? Number(chapterNumberParam)
      : parsedChapterNumberFromLegacy;
  const chapterTitleCandidate =
    chapterTitleParam || parsedChapterTitleFromLegacy;

  const selectedChapterNumber =
    chapterNumberCandidate &&
    chaptersMeta.some((c) => c.chapterNumber === chapterNumberCandidate)
      ? chapterNumberCandidate
      : null;

  const selectedChapterMeta =
    selectedChapterNumber !== null
      ? chaptersMeta.find(
          (c) =>
            c.chapterNumber === selectedChapterNumber &&
            chapterTitleCandidate &&
            (c.chapterTitle || "").toLowerCase() ===
              chapterTitleCandidate.toLowerCase()
        ) ||
        chaptersMeta.find((c) => c.chapterNumber === selectedChapterNumber)
      : null;

  const selectedChapterTitleForQuery =
    selectedChapterMeta?.chapterTitle || chapterTitleCandidate || null;

  let selectedChapterLabel: string | undefined = undefined;
  if (selectedChapterNumber !== null) {
    const foundChapter = chaptersMeta.find(
      (c) =>
        c.chapterNumber === selectedChapterNumber &&
        chapterTitleCandidate &&
        (c.chapterTitle || "").toLowerCase() ===
          chapterTitleCandidate.toLowerCase()
    );
    selectedChapterLabel =
      foundChapter?.label ||
      chaptersMeta.find((c) => c.chapterNumber === selectedChapterNumber)?.label ||
      `Chapter ${selectedChapterNumber}`;
  }

  // Fetch only if chapter is selected, or if user is searching globally
  let displayedQuestions: Question[] = [];
  if (selectedChapterNumber !== null || q) {
    displayedQuestions = await api.questions.search({
      board,
      classLevel,
      subjectId: selectedSubject,
      book: selectedBook,
      chapterNumber: selectedChapterNumber,
      chapterTitle: selectedChapterTitleForQuery,
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
        description: "Select a board from the left to start browsing.",
        icon: "board",
      };
    }
    if (!classLevel && !q) {
      return {
        title: "Select a Class",
        description: "Select a class to continue.",
        icon: "class",
      };
    }
    if (!selectedSubject && !q) {
      return {
        title: "Choose a Subject",
        description: "Select a subject to explore available chapters.",
        icon: "subject",
      };
    }
    if (selectedChapterNumber === null && !q) {
      return {
        title: "Pick a Chapter",
        description: "Select a chapter to view questions.",
        icon: "chapter",
      };
    }
    return null;
  };

  const emptyState = getEmptyState();
  const breadcrumb = [board, classLevel ? `Class ${classLevel}` : null, selectedSubject, selectedChapterLabel]
    .filter(Boolean)
    .join(" / ");
  const heading = "Question Repository";
  return (
    <QuizProvider>
      <div className="pb-20 md:pb-24">
        {/* ═══ Page Header ═══ */}
        <div className="flex items-end justify-between gap-4 mb-4 md:mb-6 flex-wrap">
          <div className="grid gap-1.5 md:gap-2">
            {breadcrumb && (
              <p className="text-label-sm text-on-surface-variant m-0">
                {breadcrumb}
              </p>
            )}
            <h1 className="font-headline text-[clamp(1.75rem,3vw,2.5rem)] font-extrabold tracking-[-0.04em] text-primary m-0">
              {heading}
            </h1>
            {selectedChapterLabel && (
              <p className="m-0 text-sm md:text-[0.9375rem] text-on-surface-variant max-w-3xl">
                Browsing chapter-specific questions for <span className="font-medium text-on-surface">{selectedChapterLabel}</span>.
              </p>
            )}
          </div>
          {!emptyState && (
            <span className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-surface-container-low text-xs font-bold text-on-surface-variant">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              {displayedQuestions.length} curated result
              {displayedQuestions.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {/* ═══ Search + Type Filter Bar ═══ */}
        <QuestionBankSearch />

        {/* ═══ 3-Panel Workspace Grid ═══ */}
        <div className="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-[14rem_1fr_16rem] lg:gap-8">
          {/* Left Rail: Taxonomy Navigation — full-width on tablet, column on desktop */}
          <div className="md:col-span-2 lg:col-span-1 order-1">
            <div className="sticky top-6">
              <QuestionBankFilters
                subjects={subjects}
                chapters={chaptersMeta}
                boards={boards}
                classes={classes}
                books={booksData}
              />
            </div>
          </div>

          {/* Center: Question Results */}
          <div className="order-2">
            {emptyState ? (
              /* Progressive Empty State — Stitch Direction */
              <div className="flex flex-col items-center justify-center min-h-64 md:min-h-96 text-center p-8 md:p-12">
                <div className="w-14 h-14 md:w-16 md:h-16 bg-surface-container-low rounded-full flex items-center justify-center mb-4 md:mb-6">
                  <EmptyStateIcon />
                </div>
                <h3 className="font-headline text-lg font-bold text-on-surface mb-2">
                  {emptyState.title}
                </h3>
                <p className="text-sm text-on-surface-variant max-w-xs leading-relaxed">
                  {emptyState.description}
                </p>
              </div>
            ) : (
              <div>
                {displayedQuestions.length === 0 ? (
                  <div className="text-center p-8 md:p-12 text-on-surface-variant text-sm">
                    No questions found matching your criteria.
                  </div>
                ) : (
                  <div className="flex flex-col gap-4 md:gap-5">
                    {displayedQuestions.map((question) => (
                      <QuestionCard key={question.id} question={question} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Rail: Selection Tray */}
          <div className="order-3">
            {context === "quiz" ? <QuizTray /> : <AssignmentTray />}
          </div>
        </div>
      </div>
    </QuizProvider>
  );
}