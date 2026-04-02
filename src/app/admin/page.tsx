import { api } from "@/lib/api";
import { Question } from "@/lib/api/types";
import AdminDerivedReviewClient from "@/components/AdminDerivedReviewClient";

export const dynamic = "force-dynamic";

export default async function AdminDerivedDashboard({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await searchParams;
  const board = typeof resolvedParams.board === "string" ? resolvedParams.board : null;
  const classLevel = typeof resolvedParams.class === "string" ? resolvedParams.class : null;
  const subjectId = typeof resolvedParams.subject === "string" ? resolvedParams.subject : null;
  const book = typeof resolvedParams.book === "string" ? resolvedParams.book : null;
  const chapter = typeof resolvedParams.chapter === "string" ? resolvedParams.chapter : null;

  const status = typeof resolvedParams.status === "string" ? resolvedParams.status : "DRAFT";

  // Taxonomy
  const [boards, classes, subjects] = await Promise.all([
    api.questions.getBoards(),
    api.questions.getClasses(board || undefined),
    api.questions.getSubjects({ board: board || undefined, classLevel: classLevel || undefined }),
  ]);

  const booksData = await api.questions.getBooks({
    board: board || undefined,
    classLevel: classLevel || undefined,
    subject: subjectId || undefined,
  });

  const chapters = await api.questions.getChapters(
    subjectId || undefined,
    book || undefined,
    classLevel || undefined
  );

  // Derived Questions List
  let derivedQuestions: Question[] = [];
  if (chapter) {
    derivedQuestions = await api.derived.getDerivedQuestions(status, chapter);
  }

  return (
    <div className="container mx-auto p-6 md:p-8">
      <div className="flex items-end justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard: Derived Content</h1>
          <p className="text-gray-500 mt-2">Generate, review, and publish derived practice questions.</p>
        </div>
      </div>
      
      <AdminDerivedReviewClient 
        boards={boards}
        classes={classes}
        subjects={subjects}
        books={booksData}
        chapters={chapters}
        initialBoard={board}
        initialClassLevel={classLevel}
        initialSubjectId={subjectId}
        initialBook={book}
        initialChapter={chapter}
        initialStatus={status}
        initialQuestions={derivedQuestions}
      />
    </div>
  );
}
