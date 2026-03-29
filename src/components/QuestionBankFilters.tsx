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
      {/* ── Sidebar Filters ── */}
      <div className="md:col-span-1 space-y-1">
        {/* Board Selection */}
        <div
          style={{
            background: "var(--color-surface-container-low)",
            padding: "var(--space-4)",
            borderRadius: "var(--radius-md)",
          }}
        >
          <h2 className="text-label-sm" style={{ color: "var(--color-on-surface-variant)", marginBottom: "var(--space-3)" }}>
            Board
          </h2>
          <select
            value={currentBoard}
            onChange={(e) => handleFilterChange("board", e.target.value)}
            className="select-academic"
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
          <div
            style={{
              background: "var(--color-surface-container-low)",
              padding: "var(--space-4)",
              borderRadius: "var(--radius-md)",
            }}
          >
            <h2 className="text-label-sm" style={{ color: "var(--color-on-surface-variant)", marginBottom: "var(--space-3)" }}>
              Class
            </h2>
            <div className="grid grid-cols-4 gap-1.5">
              {["6", "7", "8", "9", "10", "11", "12"].map((cls) => (
                <button
                  key={cls}
                  onClick={() => handleFilterChange("class", cls)}
                  style={{
                    padding: "var(--space-1-5) var(--space-2)",
                    fontSize: "0.8125rem",
                    fontWeight: currentClass === cls ? 600 : 400,
                    borderRadius: "var(--radius-sm)",
                    border: "none",
                    cursor: "pointer",
                    transition: "all var(--transition-fast)",
                    background:
                      currentClass === cls
                        ? "var(--color-primary-container)"
                        : "var(--color-surface-container-lowest)",
                    color:
                      currentClass === cls
                        ? "var(--color-on-primary-container)"
                        : "var(--color-on-surface-variant)",
                  }}
                >
                  {cls}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Subject Selection */}
        {currentClass && (
          <div
            style={{
              background: "var(--color-surface-container-low)",
              padding: "var(--space-4)",
              borderRadius: "var(--radius-md)",
            }}
          >
            <h2 className="text-label-sm" style={{ color: "var(--color-on-surface-variant)", marginBottom: "var(--space-3)" }}>
              Subjects
            </h2>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {subjects.length > 0 ? (
                subjects.map((subject) => (
                  <li key={subject}>
                    <button
                      onClick={() =>
                        handleFilterChange("subject", subject)
                      }
                      style={{
                        width: "100%",
                        textAlign: "left",
                        padding: "var(--space-2) var(--space-3)",
                        fontSize: "0.8125rem",
                        fontWeight:
                          currentSubject === subject ? 500 : 400,
                        borderRadius: "var(--radius-sm)",
                        border: "none",
                        cursor: "pointer",
                        transition: "all var(--transition-fast)",
                        background:
                          currentSubject === subject
                            ? "var(--color-primary-container)"
                            : "transparent",
                        color:
                          currentSubject === subject
                            ? "var(--color-on-primary-container)"
                            : "var(--color-on-surface)",
                      }}
                    >
                      {subject}
                    </button>
                  </li>
                ))
              ) : (
                <p className="text-body-sm" style={{ fontStyle: "italic" }}>
                  No subjects found
                </p>
              )}
            </ul>
          </div>
        )}

        {/* Book Selection (if multiple books) */}
        {currentSubject && books.length > 1 && (
          <div
            style={{
              background: "var(--color-surface-container-low)",
              padding: "var(--space-4)",
              borderRadius: "var(--radius-md)",
            }}
          >
            <h2 className="text-label-sm" style={{ color: "var(--color-on-surface-variant)", marginBottom: "var(--space-3)" }}>
              Books
            </h2>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {books.map((book) => (
                <li key={book}>
                  <button
                    onClick={() => handleFilterChange("book", book)}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      padding: "var(--space-2) var(--space-3)",
                      fontSize: "0.8125rem",
                      fontWeight: currentBook === book ? 500 : 400,
                      borderRadius: "var(--radius-sm)",
                      border: "none",
                      cursor: "pointer",
                      transition: "all var(--transition-fast)",
                      background:
                        currentBook === book
                          ? "var(--color-primary-container)"
                          : "transparent",
                      color:
                        currentBook === book
                          ? "var(--color-on-primary-container)"
                          : "var(--color-on-surface)",
                    }}
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
          <div
            style={{
              background: "var(--color-surface-container-low)",
              padding: "var(--space-4)",
              borderRadius: "var(--radius-md)",
            }}
          >
            <h2 className="text-label-sm" style={{ color: "var(--color-on-surface-variant)", marginBottom: "var(--space-3)" }}>
              Chapters
            </h2>
            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: 0,
                maxHeight: "16rem",
                overflowY: "auto",
              }}
            >
              {chapters.length > 0 ? (
                chapters.map((chapter) => (
                  <li key={chapter}>
                    <button
                      onClick={() =>
                        handleFilterChange("chapter", chapter)
                      }
                      style={{
                        width: "100%",
                        textAlign: "left",
                        padding: "var(--space-2) var(--space-3)",
                        fontSize: "0.8125rem",
                        fontWeight:
                          currentChapter === chapter ? 500 : 400,
                        borderRadius: "var(--radius-sm)",
                        border: "none",
                        cursor: "pointer",
                        transition: "all var(--transition-fast)",
                        background:
                          currentChapter === chapter
                            ? "var(--color-primary-container)"
                            : "transparent",
                        color:
                          currentChapter === chapter
                            ? "var(--color-on-primary-container)"
                            : "var(--color-on-surface)",
                      }}
                    >
                      {chapter}
                    </button>
                  </li>
                ))
              ) : (
                <p className="text-body-sm" style={{ fontStyle: "italic" }}>
                  No chapters found
                </p>
              )}
            </ul>
          </div>
        )}
      </div>

      {/* ── Search & Filter Bar (top of content column) ── */}
      <div className="md:col-span-3 -mb-2">
        <div
          className="flex flex-col sm:flex-row gap-3"
          style={{
            background: "var(--color-surface-container-lowest)",
            padding: "var(--space-3) var(--space-4)",
            borderRadius: "var(--radius-md)",
          }}
        >
          <input
            type="text"
            placeholder="Search questions or topics..."
            defaultValue={currentQuery}
            onChange={(e) => {
              handleFilterChange("q", e.target.value);
            }}
            className="input-academic"
            style={{ flex: 1 }}
          />
          <select
            value={currentType}
            onChange={(e) => handleFilterChange("type", e.target.value)}
            className="select-academic"
            style={{ width: "auto", minWidth: "10rem" }}
          >
            <option value="ALL">All Types</option>
            <option value="MCQ">Multiple Choice</option>
            <option value="TRUE_FALSE">True / False</option>
            <option value="FILL_IN_BLANKS">Fill in Blanks</option>
          </select>
        </div>
        {isPending && (
          <p
            className="text-body-sm"
            style={{
              color: "var(--color-primary)",
              marginTop: "var(--space-2)",
            }}
          >
            Loading…
          </p>
        )}
      </div>
    </div>
  );
}
