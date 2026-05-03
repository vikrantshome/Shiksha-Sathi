"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { Question } from "@/lib/api/types";
import AdminDerivedReviewClient from "@/components/AdminDerivedReviewClient";
import Loader from "@/components/Loader";
import ErrorState from "@/components/ErrorState";

export default function AdminDerivedDashboard() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const board = searchParams.get("board");
  const classLevel = searchParams.get("class");
  const subjectId = searchParams.get("subject");
  const book = searchParams.get("book");
  const chapter = searchParams.get("chapter");
  const status = searchParams.get("status") || "DRAFT";

  const [boards, setBoards] = useState<string[]>([]);
  const [classes, setClasses] = useState<string[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [booksData, setBooksData] = useState<string[]>([]);
  const [chapters, setChapters] = useState<string[]>([]);
  const [derivedQuestions, setDerivedQuestions] = useState<Question[]>([]);

  const fetchData = async () => {
    setLoading(true);
    setError(false);
    try {
        const [boardsData, classesData, subjectsData] = await Promise.all([
          api.questions.getBoards().catch(() => []),
          api.questions.getClasses(board || undefined).catch(() => []),
          api.questions.getSubjects({ board: board || undefined, classLevel: classLevel || undefined }).catch(() => []),
        ]);
        setBoards(boardsData);
        setClasses(classesData);
        setSubjects(subjectsData);

        const books = await api.questions.getBooks({
          board: board || undefined,
          classLevel: classLevel || undefined,
          subject: subjectId || undefined,
        }).catch(() => []);
        setBooksData(books);

        const chaptersData = await api.questions.getChapters({
          board: board || undefined,
          subjectId: subjectId || undefined,
          book: book || undefined,
          classLevel: classLevel || undefined,
        }).catch(() => []);
        setChapters(chaptersData);

        const questions = await api.derived.getDerivedQuestions(status, chapter || undefined).catch(() => []);
        setDerivedQuestions(questions);
      } catch (err) {
        console.error("Failed to load admin derived data:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    fetchData();
  }, [board, classLevel, subjectId, book, chapter, status]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader size="lg" label="Loading admin dashboard..." />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState
        title="Failed to Load Dashboard"
        message="Please check your connection and try again."
        type="network"
        onRetry={fetchData}
      />
    );
  }

  return (
    <div className="container mx-auto p-6 md:p-8">
      <div className="flex items-end justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-on-surface">Derived Content Review</h1>
          <p className="text-on-surface-variant mt-2">Review, and publish derived practice questions.</p>
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