"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useTransition } from "react";

export default function QuestionBankFilters({ 
  subjects, 
  chapters,
  boards = [],
  classes = [],
  books = []
}: { 
  subjects: string[], 
  chapters: string[],
  boards?: string[],
  classes?: string[],
  books?: string[]
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentBoard = searchParams.get("board") || "";
  const currentClass = searchParams.get("class") || "";
  const currentSubject = searchParams.get("subject") || "";
  const currentBook = searchParams.get("book") || "";
  const currentChapter = searchParams.get("chapter") || "";
  const currentQuery = searchParams.get("q") || "";
  const currentType = searchParams.get("type") || "ALL";

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value && value !== "ALL") {
        params.set(name, value);
      } else {
        params.delete(name);
      }
      return params.toString();
    },
    [searchParams]
  );

  const handleFilterChange = (name: string, value: string) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      
      if (value && value !== "ALL") {
        params.set(name, value);
      } else {
        params.delete(name);
      }

      // Reset dependent filters
      if (name === "board") {
        params.delete("class");
        params.delete("subject");
        params.delete("book");
        params.delete("chapter");
      } else if (name === "class") {
        params.delete("subject");
        params.delete("book");
        params.delete("chapter");
      } else if (name === "subject") {
        params.delete("book");
        params.delete("chapter");
      } else if (name === "book") {
        params.delete("chapter");
      }

      router.push(`${pathname}?${params.toString()}`);
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {/* Sidebar Browse */}
      <div className="md:col-span-1 space-y-6">
        {/* Board Selection */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <h2 className="font-semibold text-gray-900 mb-3">Board</h2>
          <select 
            value={currentBoard}
            onChange={(e) => handleFilterChange("board", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white"
          >
            <option value="">Select Board</option>
            <option value="NCERT">NCERT / CBSE</option>
            {boards.filter(b => b !== "NCERT").map(board => (
              <option key={board} value={board}>{board}</option>
            ))}
          </select>
        </div>

        {/* Class Selection */}
        {(currentBoard || classes.length > 0) && (
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <h2 className="font-semibold text-gray-900 mb-3">Class</h2>
            <div className="grid grid-cols-3 gap-2">
              {["6", "7", "8", "9", "10", "11", "12"].map(cls => (
                <button 
                  key={cls}
                  onClick={() => handleFilterChange("class", cls)}
                  className={`px-2 py-1 text-sm rounded-md border ${currentClass === cls ? 'bg-blue-50 border-blue-200 text-blue-700 font-medium' : 'border-gray-200 hover:bg-gray-50 text-gray-600'}`}
                >
                  {cls}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Subject Selection */}
        {currentClass && (
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <h2 className="font-semibold text-gray-900 mb-3">Subjects</h2>
            <ul className="space-y-1">
              {subjects.length > 0 ? subjects.map(subject => (
                <li key={subject}>
                  <button 
                    onClick={() => handleFilterChange("subject", subject)}
                    className={`w-full text-left px-3 py-1.5 text-sm rounded-md transition-colors ${currentSubject === subject ? 'bg-blue-50 text-blue-700 font-medium' : 'hover:bg-gray-50 text-gray-700'}`}
                  >
                    {subject}
                  </button>
                </li>
              )) : (
                <p className="text-sm text-gray-400 italic">No subjects found</p>
              )}
            </ul>
          </div>
        )}

        {/* Book Selection (if multiple books for subject) */}
        {currentSubject && books.length > 1 && (
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <h2 className="font-semibold text-gray-900 mb-3">Books</h2>
            <ul className="space-y-1">
              {books.map(book => (
                <li key={book}>
                  <button 
                    onClick={() => handleFilterChange("book", book)}
                    className={`w-full text-left px-3 py-1.5 text-sm rounded-md transition-colors ${currentBook === book ? 'bg-blue-50 text-blue-700 font-medium' : 'hover:bg-gray-50 text-gray-700'}`}
                  >
                    {book}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Chapter Selection */}
        {currentSubject && (
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <h2 className="font-semibold text-gray-900 mb-3">Chapters</h2>
            <ul className="space-y-1 max-h-64 overflow-y-auto">
              {chapters.length > 0 ? chapters.map(chapter => (
                <li key={chapter}>
                  <button 
                    onClick={() => handleFilterChange("chapter", chapter)}
                    className={`w-full text-left px-3 py-1.5 text-sm rounded-md transition-colors ${currentChapter === chapter ? 'bg-blue-50 text-blue-700 font-medium' : 'hover:bg-gray-50 text-gray-700'}`}
                  >
                    {chapter}
                  </button>
                </li>
              )) : (
                <p className="text-sm text-gray-400 italic">No chapters found</p>
              )}
            </ul>
          </div>
        )}
      </div>

      {/* Main Filter Bar for the right column */}
      <div className="md:col-span-3 -mb-2">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col sm:flex-row gap-4">
          <input 
            type="text" 
            placeholder="Search questions or topics..." 
            defaultValue={currentQuery}
            onChange={(e) => {
              // Debounce search input ideally, but for now just push it
              handleFilterChange("q", e.target.value);
            }}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
          <select 
            value={currentType}
            onChange={(e) => handleFilterChange("type", e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white"
          >
            <option value="ALL">All Types</option>
            <option value="MCQ">Multiple Choice</option>
            <option value="TRUE_FALSE">True / False</option>
            <option value="FILL_IN_BLANKS">Fill in Blanks</option>
          </select>
        </div>
        {isPending && <p className="text-sm text-blue-500 mt-2">Loading...</p>}
      </div>
    </div>
  );
}
