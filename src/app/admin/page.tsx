import { api } from "@/lib/api";
import { Question } from "@/lib/api/types";
import AdminDerivedReviewClient from "@/components/AdminDerivedReviewClient";
import AdminDerivedProvider from "@/components/AdminDerivedProvider";

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
  let boards: string[] = [];
  let classes: string[] = [];
  let subjects: string[] = [];

  try {
    boards = await api.questions.getBoards().catch(() => []);
  } catch {
    boards = [];
  }

  try {
    classes = await api.questions.getClasses(board || undefined).catch(() => []);
  } catch {
    classes = [];
  }

  try {
    subjects = await api.questions.getSubjects({ board: board || undefined, classLevel: classLevel || undefined }).catch(() => []);
  } catch {
    subjects = [];
  }

  let booksData: string[] = [];
  try {
    booksData = await api.questions.getBooks({
      board: board || undefined,
      classLevel: classLevel || undefined,
      subject: subjectId || undefined,
    }).catch(() => []);
  } catch {
    booksData = [];
  }

  let chapters: string[] = [];
  try {
    chapters = await api.questions.getChapters(
      subjectId || undefined,
      book || undefined,
      classLevel || undefined
    ).catch(() => []);
  } catch {
    chapters = [];
  }

  // Derived Questions List — always fetch, optionally filtered by chapter
  let derivedQuestions: Question[] = [];
  try {
    derivedQuestions = await api.derived.getDerivedQuestions(status, chapter || undefined).catch(() => []);
  } catch {
    derivedQuestions = [];
  }

  return (
    <div className="container mx-auto p-6 md:p-8">
      <div className="flex items-end justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard: Derived Content</h1>
          <p className="text-gray-500 mt-2">Review, and publish derived practice questions.</p>
        </div>
      </div>

      <AdminDerivedProvider>
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
      </AdminDerivedProvider>
    </div>
  );
}
