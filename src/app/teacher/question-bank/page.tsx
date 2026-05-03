"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { Question, ChapterMeta } from "@/lib/api/types";
import QuestionBankFilters, { QuestionBankSearch } from "@/components/QuestionBankFilters";
import QuestionCard from "@/components/QuestionCard";
import AssignmentTray from "@/components/AssignmentTray";
import QuizTray from "@/components/QuizTray";
import { QuizProvider } from "@/components/QuizContext";
import Loader from "@/components/Loader";

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
   Question Bank Page — Client Component (was SSR)
   Moved to client-side data fetching to reduce backend load
   ───────────────────────────────────────────────────────── */

export default function QuestionBankPage() {
  const searchParams = useSearchParams();
  const context = searchParams.get("context") || "assignment";

  const [loading, setLoading] = useState(true);
  const [boards, setBoards] = useState<string[]>([]);
  const [classes, setClasses] = useState<string[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [booksData, setBooksData] = useState<string[]>([]);
  const [chaptersMeta, setChaptersMeta] = useState<ChapterMeta[]>([]);
  const [displayedQuestions, setDisplayedQuestions] = useState<Question[]>([]);

  const board = searchParams.get("board");
  const classLevel = searchParams.get("class");
  const subjectId = searchParams.get("subject");
  const book = searchParams.get("book");
  const chapter = searchParams.get("chapter");
  const chapterNumberParam = searchParams.get("chapterNumber");
  const chapterTitleParam = searchParams.get("chapterTitle");
  const q = searchParams.get("q")?.toLowerCase() || null;
  const type = searchParams.get("type") || "ALL";

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [boardsData, classesData, subjectsData] = await Promise.all([
          api.questions.getBoards(),
          api.questions.getClasses(board || undefined),
          api.questions.getSubjects({
            board: board || undefined,
            classLevel: classLevel || undefined,
          }),
        ]);

        setBoards(boardsData);
        setClasses(classesData);

        const selectedSubject = subjectId && subjectsData.includes(subjectId) ? subjectId : null;
        setSubjects(subjectsData);

        if (selectedSubject || board || classLevel) {
          const books = await api.questions.getBooks({
            board: board || undefined,
            classLevel: classLevel || undefined,
            subject: selectedSubject || undefined,
          });
          setBooksData(books);

          const selectedBook = book && books.includes(book)
            ? book
            : books.length > 0
              ? books[0]
              : null;

          if (selectedBook) {
            const chapters = await api.questions.getChaptersMeta({
              board: board || undefined,
              classLevel: classLevel || undefined,
              subjectId: selectedSubject || undefined,
              book: selectedBook,
              visibleOnly: true,
            });
            setChaptersMeta(chapters);
          }
        }

        const selectedSubjectFinal = subjectId && subjectsData.includes(subjectId) ? subjectId : null;
        const parsedChapterNumberFromLegacy = chapter && /chapter\s*(\d+)/i.test(chapter)
          ? Number(chapter.match(/chapter\s*(\d+)/i)?.[1])
          : null;
        const parsedChapterTitleFromLegacy = chapter && /chapter\s*\d+\s*:\s*(.+)$/i.test(chapter)
          ? (chapter.match(/chapter\s*\d+\s*:\s*(.+)$/i)?.[1] || "").trim()
          : null;
        const chapterNumberCandidate = chapterNumberParam && !Number.isNaN(Number(chapterNumberParam))
          ? Number(chapterNumberParam)
          : parsedChapterNumberFromLegacy;
        const chapterTitleCandidate = chapterTitleParam || parsedChapterTitleFromLegacy;

        if (chapterNumberCandidate || q) {
          const questions = await api.questions.search({
            board,
            classLevel,
            subjectId: selectedSubjectFinal,
            book: book || undefined,
            chapterNumber: chapterNumberCandidate,
            chapterTitle: chapterTitleCandidate,
            q,
            type,
            visibleOnly: true,
          });

          let filtered = questions;
          if (context === "quiz") {
            filtered = questions.filter((q) => q.type === "MCQ" || q.type === "TRUE_FALSE");
          }
          setDisplayedQuestions(filtered);
        } else {
          setDisplayedQuestions([]);
        }
      } catch (err) {
        console.error("Failed to load question bank:", err);
        setDisplayedQuestions([]);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [board, classLevel, subjectId, book, chapter, chapterNumberParam, chapterTitleParam, q, type, context]);

  const getEmptyState = () => {
    if (!board && !q) {
      return { title: "Select a Board to Begin", description: "Select a board from the left to start browsing.", icon: "board" };
    }
    if (!classLevel && !q) {
      return { title: "Select a Class", description: "Select a class to continue.", icon: "class" };
    }
    if (!subjectId && !q) {
      return { title: "Choose a Subject", description: "Select a subject to explore available chapters.", icon: "subject" };
    }
    if (!chapter && !q) {
      return { title: "Pick a Chapter", description: "Select a chapter to view questions.", icon: "chapter" };
    }
    return null;
  };

  const emptyState = getEmptyState();
  const chapterMeta = chaptersMeta.find((c) => c.chapterNumber === Number(chapterNumberParam) || c.chapterTitle === chapter);
  const chapterLabel = chapterMeta?.label || (chapter ? `Chapter ${chapter}` : null);
  const breadcrumb = [board, classLevel ? `Class ${classLevel}` : null, subjectId, chapterLabel]
    .filter(Boolean)
    .join(" / ");
  const heading = "Question Repository";

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader size="lg" label="Loading question bank..." />
      </div>
    );
  }

  return (
    <QuizProvider>
      <div className="pb-20 md:pb-24">
        {/* ═══ Page Header ═══ */}
        <div className="flex items-end justify-between gap-4 mb-4 md:mb-6 flex-wrap">
          <div className="grid gap-1.5 md:gap-2">
            {breadcrumb && (
              <p className="text-label-sm text-on-surface-variant m-0">{breadcrumb}</p>
            )}
            <h1 className="font-headline text-[clamp(1.75rem,3vw,2.5rem)] font-extrabold tracking-[-0.04em] text-primary m-0">
              {heading}
            </h1>
            {chapterLabel && (
              <p className="m-0 text-sm md:text-[0.9375rem] text-on-surface-variant max-w-3xl">
                Browsing chapter-specific questions for <span className="font-medium text-on-surface">{chapterLabel}</span>.
              </p>
            )}
          </div>
          {!emptyState && (
            <span className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-surface-container-low text-xs font-bold text-on-surface-variant">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              {displayedQuestions.length} curated result{displayedQuestions.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {/* ═══ Search + Type Filter Bar ═══ */}
        <QuestionBankSearch />

        {/* ═══ 3-Panel Workspace Grid ═══ */}
        <div className="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-[14rem_1fr_16rem] lg:gap-8">
          {/* Left Rail: Taxonomy Navigation */}
          <div className="md:col-span-2 lg:col-span-1 order-1">
            <div className="sticky top-4 md:top-6">
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
              <div className="flex flex-col items-center justify-center min-h-64 md:min-h-96 text-center p-8 md:p-12">
                <div className="w-14 h-14 md:w-16 md:h-16 bg-surface-container-low rounded-full flex items-center justify-center mb-4 md:mb-6">
                  <EmptyStateIcon />
                </div>
                <h3 className="font-headline text-lg font-bold text-on-surface mb-2">{emptyState.title}</h3>
                <p className="text-sm text-on-surface-variant max-w-xs leading-relaxed">{emptyState.description}</p>
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
                      <QuestionCard key={question.id} question={question} mode={context === "quiz" ? "quiz" : "assignment"} />
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