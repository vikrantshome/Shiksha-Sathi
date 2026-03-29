import { api } from "@/lib/api";
import { Question } from "@/lib/api/types";
import QuestionBankFilters, { QuestionBankSearch } from "@/components/QuestionBankFilters";
import QuestionCard from "@/components/QuestionCard";
import AssignmentTray from "@/components/AssignmentTray";

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
    <div className="pb-24 lg:pb-8">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-display-sm">Question Bank</h1>
        <p className="text-body-md text-on-surface-variant mt-1">
          Browse NCERT and local questions for your assignments.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Rail: Taxonomy */}
        <div className="lg:col-span-3">
          <div className="sticky top-6">
            <QuestionBankFilters
              subjects={subjects}
              chapters={chapters}
              boards={boards}
              classes={classes}
              books={booksData}
            />
          </div>
        </div>

        {/* Center: Search & Results */}
        <div className="lg:col-span-6 flex flex-col">
          <QuestionBankSearch />
          
          {emptyState ? (
            /* Progressive empty state */
            <div className="bg-surface-container-lowest p-12 rounded-xl text-center border-2 border-dashed border-outline-variant flex flex-col items-center justify-center min-h-[400px]">
              <div className="w-16 h-16 bg-surface-container rounded-full flex items-center justify-center mb-4 text-on-surface-variant">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-headline-sm text-on-surface mb-2">
                {emptyState.title}
              </p>
              <p className="text-body-md text-on-surface-variant max-w-sm">
                {emptyState.description}
              </p>
            </div>
          ) : (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-title-lg font-medium">
                  {chapter || "Search"} Results
                </h2>
                <span className="text-label-md bg-surface-container-high px-3 py-1.5 rounded-full text-on-surface-variant">
                  {displayedQuestions.length} question{displayedQuestions.length !== 1 ? "s" : ""}
                </span>
              </div>

              {displayedQuestions.length === 0 ? (
                <div className="bg-surface-container-lowest p-12 rounded-xl text-center border border-dashed border-outline-variant">
                  <p className="text-body-md text-on-surface-variant">
                    No questions found matching your criteria.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {displayedQuestions.map((question) => (
                    <QuestionCard key={question.id} question={question} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Rail: Assignment Tray */}
        <div className="lg:col-span-3">
          <AssignmentTray />
        </div>
      </div>
    </div>
  );
}
