"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useTransition } from "react";

export default function QuestionBankFilters({
  subjects,
  chapters,
  boards = [],
  classes = [],
  books = [],
}: {
  subjects: string[];
  chapters: string[];
  boards?: string[];
  classes?: string[];
  books?: string[];
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
    <div className="flex flex-col gap-4">
      {/* Board Selection */}
      <div className="bg-surface-container-low p-4 rounded-md border border-outline-variant">
        <h2 className="text-label-sm text-on-surface-variant mb-3">
          Board
        </h2>
        <select
          value={currentBoard}
          onChange={(e) => handleFilterChange("board", e.target.value)}
          className="select-academic w-full"
        >
          <option value="">Select Board</option>
          <option value="NCERT">NCERT / CBSE</option>
          {boards
            .filter((b) => b !== "NCERT")
            .map((board) => (
              <option key={board} value={board}>
                {board}
              </option>
            ))}
        </select>
      </div>

      {/* Class Selection */}
      {(currentBoard || classes.length > 0) && (
        <div className="bg-surface-container-low p-4 rounded-md border border-outline-variant">
          <h2 className="text-label-sm text-on-surface-variant mb-3">
            Class
          </h2>
          <div className="grid grid-cols-4 gap-1.5">
            {["6", "7", "8", "9", "10", "11", "12"].map((cls) => (
              <button
                key={cls}
                onClick={() => handleFilterChange("class", cls)}
                className={`py-1.5 px-2 text-[0.8125rem] rounded-sm transition-colors border-none cursor-pointer ${
                  currentClass === cls
                    ? "bg-primary-container text-on-primary-container font-semibold"
                    : "bg-surface-container-lowest text-on-surface-variant font-normal hover:bg-surface-container-high"
                }`}
              >
                {cls}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Subject Selection */}
      {currentClass && (
        <div className="bg-surface-container-low p-4 rounded-md border border-outline-variant">
          <h2 className="text-label-sm text-on-surface-variant mb-3">
            Subjects
          </h2>
          <ul className="list-none p-0 m-0 space-y-1">
            {subjects.length > 0 ? (
              subjects.map((subject) => (
                <li key={subject}>
                  <button
                    onClick={() => handleFilterChange("subject", subject)}
                    className={`w-full text-left py-2 px-3 text-[0.8125rem] rounded-sm transition-colors border-none cursor-pointer ${
                      currentSubject === subject
                        ? "bg-primary-container text-on-primary-container font-medium"
                        : "bg-transparent text-on-surface hover:bg-surface-container-high font-normal"
                    }`}
                  >
                    {subject}
                  </button>
                </li>
              ))
            ) : (
              <p className="text-body-sm italic text-on-surface-variant">
                No subjects found
              </p>
            )}
          </ul>
        </div>
      )}

      {/* Book Selection (if multiple books) */}
      {currentSubject && books.length > 1 && (
        <div className="bg-surface-container-low p-4 rounded-md border border-outline-variant">
          <h2 className="text-label-sm text-on-surface-variant mb-3">
            Books
          </h2>
          <ul className="list-none p-0 m-0 space-y-1">
            {books.map((book) => (
              <li key={book}>
                <button
                  onClick={() => handleFilterChange("book", book)}
                  className={`w-full text-left py-2 px-3 text-[0.8125rem] rounded-sm transition-colors border-none cursor-pointer ${
                    currentBook === book
                      ? "bg-primary-container text-on-primary-container font-medium"
                      : "bg-transparent text-on-surface hover:bg-surface-container-high font-normal"
                  }`}
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
        <div className="bg-surface-container-low p-4 rounded-md border border-outline-variant">
          <h2 className="text-label-sm text-on-surface-variant mb-3">
            Chapters
          </h2>
          <ul className="list-none p-0 m-0 max-h-64 overflow-y-auto custom-scrollbar pr-1 space-y-1">
            {chapters.length > 0 ? (
              chapters.map((chapter) => (
                <li key={chapter}>
                  <button
                    onClick={() => handleFilterChange("chapter", chapter)}
                    className={`w-full text-left py-2 px-3 text-[0.8125rem] rounded-sm transition-colors border-none cursor-pointer ${
                      currentChapter === chapter
                        ? "bg-primary-container text-on-primary-container font-medium"
                        : "bg-transparent text-on-surface hover:bg-surface-container-high font-normal"
                    }`}
                  >
                    {chapter}
                  </button>
                </li>
              ))
            ) : (
              <p className="text-body-sm italic text-on-surface-variant">
                No chapters found
              </p>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

export function QuestionBankSearch() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentQuery = searchParams.get("q") || "";
  const currentType = searchParams.get("type") || "ALL";

  const handleFilterChange = (name: string, value: string) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());

      if (value && value !== "ALL") {
        params.set(name, value);
      } else {
        params.delete(name);
      }
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3 bg-surface-container-lowest p-3 rounded-md border border-outline-variant mb-6 w-full">
      <input
        type="text"
        placeholder="Search questions or topics..."
        defaultValue={currentQuery}
        onChange={(e) => handleFilterChange("q", e.target.value)}
        className="input-academic flex-1"
      />
      <select
        value={currentType}
        onChange={(e) => handleFilterChange("type", e.target.value)}
        className="select-academic w-full sm:w-auto sm:min-w-[10rem]"
      >
        <option value="ALL">All Types</option>
        <option value="MCQ">Multiple Choice</option>
        <option value="TRUE_FALSE">True / False</option>
        <option value="FILL_IN_BLANKS">Fill in Blanks</option>
      </select>
      {isPending && (
        <div className="flex items-center ml-2 text-primary text-sm font-medium">
          Loading…
        </div>
      )}
    </div>
  );
}
