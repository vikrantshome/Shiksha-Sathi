import { api } from "@/lib/api";
import { Question } from "@/lib/api/types";
import QuestionBankFilters from "@/components/QuestionBankFilters";
import QuestionCard from "@/components/QuestionCard";

export const dynamic = "force-dynamic";

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
  const boards = await api.questions.getBoards();
  const classes = await api.questions.getClasses(board || undefined);
  const subjects = await api.questions.getSubjects();
  const booksData = await api.questions.getBooks({
    board: board || undefined,
    classLevel: classLevel || undefined,
    subject: subjectId || undefined,
  });
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
        title: "Start by selecting a board",
        description:
          "Choose NCERT/CBSE or another curriculum board to browse questions.",
      };
    }
    if (!classLevel && !q) {
      return {
        title: "Select a class",
        description: "Pick a class level to narrow down your curriculum.",
      };
    }
    if (!subjectId && !q) {
      return {
        title: "Choose a subject",
        description: "Select a subject to explore available chapters.",
      };
    }
    if (!chapter && !q) {
      return {
        title: "Pick a chapter",
        description: "Select a chapter to view questions.",
      };
    }
    return null;
  };

  const emptyState = getEmptyState();

  return (
    <div>
      {/* Page Header */}
      <div style={{ marginBottom: "var(--space-6)" }}>
        <h1 className="text-display-sm">Question Bank</h1>
        <p
          className="text-body-md"
          style={{
            color: "var(--color-on-surface-variant)",
            marginTop: "var(--space-1)",
          }}
        >
          Browse NCERT and local questions for your assignments.
        </p>
      </div>

      {/* Filters (includes sidebar + search bar) */}
      <QuestionBankFilters
        subjects={subjects}
        chapters={chapters}
        boards={boards}
        classes={classes}
        books={booksData}
      />

      {/* Content Area */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6" style={{ marginTop: "var(--space-6)" }}>
        {/* Sidebar offset */}
        <div className="hidden md:block md:col-span-1"></div>

        {/* Questions Column */}
        <div className="md:col-span-3">
          {emptyState ? (
            /* Progressive empty state */
            <div
              style={{
                background: "var(--color-surface-container-lowest)",
                padding: "var(--space-12) var(--space-8)",
                borderRadius: "var(--radius-md)",
                textAlign: "center",
                border: "1px dashed var(--color-outline-variant)",
              }}
            >
              <p
                className="text-headline-sm"
                style={{
                  color: "var(--color-on-surface)",
                  marginBottom: "var(--space-2)",
                }}
              >
                {emptyState.title}
              </p>
              <p
                className="text-body-sm"
                style={{ color: "var(--color-on-surface-variant)" }}
              >
                {emptyState.description}
              </p>
            </div>
          ) : (
            <div>
              {/* Results header */}
              <div
                className="flex justify-between items-center"
                style={{ marginBottom: "var(--space-4)" }}
              >
                <h2 className="text-headline-md">
                  {chapter || "Search"} Results
                </h2>
                <span
                  className="text-label-md"
                  style={{ color: "var(--color-on-surface-variant)" }}
                >
                  {displayedQuestions.length} question
                  {displayedQuestions.length !== 1 ? "s" : ""}
                </span>
              </div>

              {displayedQuestions.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "var(--space-8)",
                    background: "var(--color-surface-container-lowest)",
                    borderRadius: "var(--radius-md)",
                    border: "1px dashed var(--color-outline-variant)",
                  }}
                >
                  <p
                    className="text-body-md"
                    style={{ color: "var(--color-on-surface-variant)" }}
                  >
                    No questions found matching your criteria.
                  </p>
                </div>
              ) : (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "var(--space-3)",
                  }}
                >
                  {displayedQuestions.map((question) => (
                    <QuestionCard key={question.id} question={question} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
