"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Question } from "@/lib/api/types";
import { api } from "@/lib/api";
import QuestionCard from "./QuestionCard";

interface Props {
  boards: string[];
  classes: string[];
  subjects: string[];
  books: string[];
  chapters: string[];
  initialBoard: string | null;
  initialClassLevel: string | null;
  initialSubjectId: string | null;
  initialBook: string | null;
  initialChapter: string | null;
  initialStatus: string;
  initialQuestions: Question[];
}

export default function AdminDerivedReviewClient({
  boards,
  classes,
  subjects,
  books,
  chapters,
  initialBoard,
  initialClassLevel,
  initialSubjectId,
  initialBook,
  initialChapter,
  initialStatus,
  initialQuestions,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [questions, setQuestions] = useState<Question[]>(initialQuestions);
  const [generating, setGenerating] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    
    if (key !== "chapter" && key !== "status") {
      params.delete("chapter");
      if (key !== "book") params.delete("book");
      if (key !== "subject") params.delete("subject");
      if (key !== "class") params.delete("class");
    }
    
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleGenerate = async () => {
    if (!initialBoard || !initialClassLevel || !initialSubjectId || !initialBook || !initialChapter) return;
    setGenerating(true);
    try {
      await api.derived.generateChapterBatch({
        board: initialBoard,
        classLevel: initialClassLevel,
        subjectId: initialSubjectId,
        book: initialBook,
        chapter: initialChapter,
        questionsPerChapter: 5
      });
      router.refresh();
    } catch (err) {
      console.error("Failed to generate", err);
    } finally {
      setGenerating(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await api.derived.approve(id, "Approved by admin");
      setQuestions(prev => prev.filter(q => q.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleReject = async (id: string) => {
    try {
      await api.derived.reject(id, "Rejected by admin");
      setQuestions(prev => prev.filter(q => q.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handlePublishAll = async () => {
    if (!initialChapter) return;
    setPublishing(true);
    try {
      await api.derived.publishApproved(initialChapter);
      router.refresh();
    } catch (err) {
      console.error(err);
    } finally {
      setPublishing(false);
    }
  };

  useEffect(() => {
    setQuestions(initialQuestions);
  }, [initialQuestions]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-4">Taxonomy</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Board</label>
              <select 
                value={initialBoard || ""} 
                onChange={e => updateFilters("board", e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="">Select Board...</option>
                {boards.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
              <select 
                value={initialClassLevel || ""} 
                onChange={e => updateFilters("class", e.target.value)}
                disabled={!initialBoard}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm disabled:bg-gray-100"
              >
                <option value="">Select Class...</option>
                {classes.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
              <select 
                value={initialSubjectId || ""} 
                onChange={e => updateFilters("subject", e.target.value)}
                disabled={!initialClassLevel}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm disabled:bg-gray-100"
              >
                <option value="">Select Subject...</option>
                {subjects.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Book</label>
              <select 
                value={initialBook || ""} 
                onChange={e => updateFilters("book", e.target.value)}
                disabled={!initialSubjectId}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm disabled:bg-gray-100"
              >
                <option value="">Select Book...</option>
                {books.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Chapter</label>
              <select 
                value={initialChapter || ""} 
                onChange={e => updateFilters("chapter", e.target.value)}
                disabled={!initialBook}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm disabled:bg-gray-100"
              >
                <option value="">Select Chapter...</option>
                {chapters.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
        </div>

        {initialChapter && (
          <div className="bg-indigo-50 p-6 rounded-xl border border-indigo-100">
            <h3 className="font-bold text-indigo-900 mb-2">Generation</h3>
            <p className="text-sm text-indigo-700 mb-4">Generate new derived questions for this chapter.</p>
            <button 
              onClick={handleGenerate}
              disabled={generating}
              className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md font-medium hover:bg-indigo-700 disabled:opacity-50"
            >
              {generating ? "Generating..." : "Generate Batch"}
            </button>
          </div>
        )}
      </div>

      <div className="lg:col-span-3">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6 max-w-md">
          {["DRAFT", "APPROVED", "REJECTED", "PUBLISHED"].map(s => (
            <button
              key={s}
              onClick={() => updateFilters("status", s)}
              className={`flex-1 py-2 px-3 text-sm font-medium rounded-md ${
                initialStatus === s 
                  ? "bg-white text-gray-900 shadow-sm" 
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {initialStatus === "APPROVED" && questions.length > 0 && (
          <div className="mb-6 flex justify-end">
            <button
              onClick={handlePublishAll}
              disabled={publishing}
              className="bg-emerald-600 text-white px-4 py-2 rounded-md font-medium hover:bg-emerald-700 disabled:opacity-50"
            >
              {publishing ? "Publishing..." : `Publish ${questions.length} Approved Questions`}
            </button>
          </div>
        )}

        {!initialChapter ? (
          <div className="text-center py-12 text-gray-500 bg-white rounded-xl border border-gray-200 border-dashed">
            Select a chapter to view or generate derived questions.
          </div>
        ) : questions.length === 0 ? (
          <div className="text-center py-12 text-gray-500 bg-white rounded-xl border border-gray-200 border-dashed">
            No derived questions found for status: {initialStatus}
          </div>
        ) : (
          <div className="space-y-6">
            {questions.map(q => (
              <div key={q.id} className="relative">
                <QuestionCard question={q} />
                
                {initialStatus === "DRAFT" && (
                  <div className="absolute top-4 right-4 flex space-x-2">
                    <button 
                      onClick={() => handleReject(q.id)}
                      className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm font-medium hover:bg-red-200"
                    >
                      Reject
                    </button>
                    <button 
                      onClick={() => handleApprove(q.id)}
                      className="px-3 py-1 bg-green-100 text-green-700 rounded text-sm font-medium hover:bg-green-200"
                    >
                      Approve
                    </button>
                  </div>
                )}
                
                <div className="mt-2 text-xs text-gray-500 flex gap-4">
                  <span><strong>Run ID:</strong> {q.generationRunId || "N/A"}</span>
                  <span><strong>Source:</strong> {q.sourceCanonicalQuestionIds?.join(", ") || "N/A"}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
