"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import Loader from "@/components/Loader";

/* ─────────────────────────────────────────────────────────
   Question Bank Taxonomy Filters — Stitch-Directed
   Design Source: doc/stitch_shiksha_sathi_ui_refresh/question_bank
   Implements: vertical taxonomy rail with progressive
   disclosure (Board → Class → Subject → Book → Chapter),
   active state with right-rounded highlight.
   ───────────────────────────────────────────────────────── */

/* ── Taxonomy Step Icons ── */
const IconBoard = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
  </svg>
);

const IconClass = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
    <path d="M6 12v5c3 3 9 3 12 0v-5" />
  </svg>
);

const IconSubject = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
  </svg>
);

const IconBook = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </svg>
);

const IconChapter = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" />
    <line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" />
    <line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
  </svg>
);

interface TaxonomyStepProps {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}

const TaxonomyStep = ({ icon, label, active, onClick }: TaxonomyStepProps) => (
  <button
    type="button"
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 text-sm text-left border border-transparent cursor-pointer transition-all duration-200 ${
      active
        ? "bg-[var(--color-primary-container)]/24 text-primary font-medium rounded-lg border-primary/8 shadow-[0_4px_12px_rgba(48,51,47,0.04)]"
        : "bg-transparent text-on-surface-variant font-normal rounded-lg hover:bg-surface-container-high"
    }`}
  >
    {icon}
    <span>{label}</span>
  </button>
);

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
  const subjectParam = searchParams.get("subject") || "";
  const bookParam = searchParams.get("book") || "";
  const chapterParam = searchParams.get("chapter") || "";
  const currentSubject = subjects.includes(subjectParam) ? subjectParam : "";
  const currentBook = books.includes(bookParam) ? bookParam : "";
  const currentChapter = chapters.includes(chapterParam) ? chapterParam : "";
  const classOptions = ["6", "7", "8", "9", "10", "11", "12"];
  const hasActiveFilters = Boolean(
    currentBoard || currentClass || currentSubject || currentBook || currentChapter
  );
  const isSelectionComplete = Boolean(
    currentBoard && currentClass && currentSubject && currentChapter
  );
  const [isMobileExpanded, setIsMobileExpanded] = useState(!isSelectionComplete);
  const mobileSummary = [
    currentBoard,
    currentClass ? `Class ${currentClass}` : "",
    currentSubject,
    currentChapter,
  ].filter(Boolean);

  /* eslint-disable */
  useEffect(() => {
    if (isSelectionComplete) {
      setIsMobileExpanded(false);
      return;
    }

    if (!hasActiveFilters) {
      setIsMobileExpanded(true);
    }
  }, [hasActiveFilters, isSelectionComplete]);
  /* eslint-enable */

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

  const handleResetFilters = () => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("board");
      params.delete("class");
      params.delete("subject");
      params.delete("book");
      params.delete("chapter");
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Loading indicator */}
      {isPending && (
        <div className="px-4 py-2">
          <Loader size="sm" label="Applying filters..." />
        </div>
      )}

      <div className="md:hidden rounded-lg border border-[var(--color-outline-variant)]/12 bg-[var(--color-surface-container-lowest)] shadow-[0_8px_24px_rgba(27,28,26,0.06)] p-4">
        <div className="flex items-start justify-between gap-3">
          <button
            type="button"
            onClick={() => setIsMobileExpanded((current) => !current)}
            className="flex flex-1 items-start gap-3 p-0 text-left bg-transparent border-none cursor-pointer"
          >
            <div>
              <p className="m-0 text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-on-surface-variant">
                Filters
              </p>
              <p className="m-0 text-sm text-on-surface">
                {isSelectionComplete ? "Scope selected" : "Choose scope"}
              </p>
              {!isMobileExpanded && mobileSummary.length > 0 && !isSelectionComplete && (
                <p className="m-0 mt-1 text-xs leading-5 text-on-surface-variant">
                  {mobileSummary.join(" • ")}
                </p>
              )}
            </div>
            <span className="mt-1 inline-flex h-7 w-7 items-center justify-center rounded-full bg-surface-container-low text-on-surface-variant">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`transition-transform duration-200 ${isMobileExpanded ? "rotate-180" : ""}`}
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </span>
          </button>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="p-0 text-xs font-medium bg-transparent border-none cursor-pointer text-primary shrink-0"
            >
              Reset
            </button>
          )}
        </div>

        {!isMobileExpanded && isSelectionComplete && (
          <div className="mt-3 flex flex-wrap gap-2">
            {mobileSummary.map((item) => (
              <span
                key={item}
                className="inline-flex items-center rounded-full bg-[var(--color-primary-container)] px-2.5 py-1 text-[0.6875rem] font-medium text-[var(--color-on-primary-container)]"
              >
                {item}
              </span>
            ))}
          </div>
        )}

        {isMobileExpanded && (
          <div className="mt-3 grid grid-cols-1 gap-3">
            <label className="flex flex-col gap-1">
            <span className="text-[0.6875rem] font-medium uppercase tracking-[0.06em] text-on-surface-variant">
              Board
            </span>
            <select
              value={currentBoard}
              onChange={(e) => handleFilterChange("board", e.target.value)}
              className="w-full min-h-11 rounded-md border border-[var(--color-outline-variant)]/15 bg-[var(--color-surface-container-low)] px-3 text-sm text-on-surface outline-none transition-colors focus:border-primary"
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
            </label>

            {(currentBoard || classes.length > 0) && (
              <label className="flex flex-col gap-1">
              <span className="text-[0.6875rem] font-medium uppercase tracking-[0.06em] text-on-surface-variant">
                Class
              </span>
              <select
                value={currentClass}
                onChange={(e) => handleFilterChange("class", e.target.value)}
                className="w-full min-h-11 rounded-md border border-[var(--color-outline-variant)]/15 bg-[var(--color-surface-container-low)] px-3 text-sm text-on-surface outline-none transition-colors focus:border-primary"
              >
                <option value="">Select Class</option>
                {classOptions.map((cls) => (
                  <option key={cls} value={cls}>
                    Class {cls}
                  </option>
                ))}
              </select>
              </label>
            )}

            {currentClass && (
              <label className="flex flex-col gap-1">
              <span className="text-[0.6875rem] font-medium uppercase tracking-[0.06em] text-on-surface-variant">
                Subject
              </span>
              <select
                value={currentSubject}
                onChange={(e) => handleFilterChange("subject", e.target.value)}
                className="w-full min-h-11 rounded-md border border-[var(--color-outline-variant)]/15 bg-[var(--color-surface-container-low)] px-3 text-sm text-on-surface outline-none transition-colors focus:border-primary"
              >
                <option value="">Select Subject</option>
                {subjects.map((subject) => (
                  <option key={subject} value={subject}>
                    {subject}
                  </option>
                ))}
              </select>
              </label>
            )}

            {currentSubject && books.length > 1 && (
              <label className="flex flex-col gap-1">
              <span className="text-[0.6875rem] font-medium uppercase tracking-[0.06em] text-on-surface-variant">
                Book
              </span>
              <select
                value={currentBook}
                onChange={(e) => handleFilterChange("book", e.target.value)}
                className="w-full min-h-11 rounded-md border border-[var(--color-outline-variant)]/15 bg-[var(--color-surface-container-low)] px-3 text-sm text-on-surface outline-none transition-colors focus:border-primary"
              >
                <option value="">Select Book</option>
                {books.map((bookItem) => (
                  <option key={bookItem} value={bookItem}>
                    {bookItem}
                  </option>
                ))}
              </select>
              </label>
            )}

            {currentSubject && (
              <label className="flex flex-col gap-1">
              <span className="text-[0.6875rem] font-medium uppercase tracking-[0.06em] text-on-surface-variant">
                Chapter
              </span>
              <select
                value={currentChapter}
                onChange={(e) => handleFilterChange("chapter", e.target.value)}
                disabled={chapters.length === 0}
                className="w-full min-h-11 rounded-md border border-[var(--color-outline-variant)]/15 bg-[var(--color-surface-container-low)] px-3 text-sm text-on-surface outline-none transition-colors focus:border-primary disabled:cursor-not-allowed disabled:opacity-60"
              >
                <option value="">
                  {chapters.length > 0 ? "Select Chapter" : "No Chapters Available"}
                </option>
                {chapters.map((ch) => (
                  <option key={ch} value={ch}>
                    {ch}
                  </option>
                ))}
              </select>
              </label>
            )}
          </div>
        )}
      </div>

      <div className="hidden md:flex md:flex-col md:gap-3 md:rounded-lg md:border md:border-[var(--color-outline-variant)]/12 md:bg-[var(--color-surface-container-lowest)] md:p-3 md:shadow-[0_8px_24px_rgba(27,28,26,0.05)]">
        <div className="flex items-start justify-between gap-3 px-1 pb-2 border-b border-[var(--color-outline-variant)]/10">
          <div>
            <p className="m-0 text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-on-surface-variant">
              Filters
            </p>
            <p className="m-0 text-sm text-on-surface">Browse by syllabus scope</p>
          </div>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="p-0 text-xs font-medium bg-transparent border-none cursor-pointer shrink-0 text-primary"
            >
              Reset
            </button>
          )}
        </div>

        {/* ── Board Select ── */}
        <div className="mb-2">
          <TaxonomyStep
            icon={<IconBoard />}
            label={currentBoard || "Board Select"}
            active={!!currentBoard}
            onClick={() => {}}
          />
          <div className="px-4">
            <select
              value={currentBoard}
              onChange={(e) => handleFilterChange("board", e.target.value)}
              className="w-full py-2 px-3 text-[0.8125rem] bg-surface-container-low border-0 border-b border-[var(--color-outline-variant)]/20 text-on-surface rounded-sm outline-none cursor-pointer transition-colors focus:border-primary"
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
        </div>

        {/* ── Class (6-12) ── */}
        {(currentBoard || classes.length > 0) && (
          <div className="mb-2">
            <TaxonomyStep
              icon={<IconClass />}
              label={currentClass ? `Class ${currentClass}` : "Class (6-12)"}
              active={!!currentClass}
              onClick={() => {}}
            />
            <div className="grid grid-cols-5 gap-1 px-2 py-2">
              {classOptions.map((cls) => (
                <button
                  key={cls}
                  type="button"
                  onClick={() => handleFilterChange("class", cls)}
                  className={` text-[0.75rem] text-center border cursor-pointer transition-all duration-150 ${
                    currentClass === cls
                      ? "font-semibold rounded-md bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)] border-[var(--color-primary)]/20 shadow-[0_2px_6px_rgba(44,95,110,0.06)]"
                      : "font-normal rounded-md border-transparent bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high"
                  }`}
                >
                  {cls}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Subject ── */}
        {currentClass && (
          <div className="mb-2">
            <TaxonomyStep
              icon={<IconSubject />}
              label={currentSubject || "Subject"}
              active={!!currentSubject}
              onClick={() => {}}
            />
            <div className="flex flex-wrap gap-1 px-2 py-2">
              {subjects.length > 0 ? (
                subjects.map((subject) => (
                  <button
                    key={subject}
                    type="button"
                    onClick={() => handleFilterChange("subject", subject)}
                    className={`inline-flex items-center justify-center px-2.5 py-1.5 text-[0.75rem] border cursor-pointer transition-all duration-150 ${
                      currentSubject === subject
                        ? "font-medium rounded-md bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)] border-[var(--color-primary)]/20 shadow-[0_2px_6px_rgba(44,95,110,0.06)]"
                        : "font-normal rounded-md border-transparent bg-surface-container-lowest text-on-surface hover:bg-surface-container-high"
                    }`}
                  >
                    {subject}
                  </button>
                ))
              ) : (
                <p className="text-[0.8125rem] italic text-on-surface-variant px-3 py-2 m-0">
                  No subjects found
                </p>
              )}
            </div>
          </div>
        )}

        {/* ── Book Series ── */}
        {currentSubject && books.length > 1 && (
          <div className="mb-2">
            <TaxonomyStep
              icon={<IconBook />}
              label={currentBook || "Book Series"}
              active={!!currentBook}
              onClick={() => {}}
            />
            <div className="px-2">
              {books.map((bookItem) => (
              <button
                key={bookItem}
                type="button"
                onClick={() => handleFilterChange("book", bookItem)}
                className={`block w-full text-left px-3 py-2.5 text-[0.8125rem] border border-transparent rounded-md cursor-pointer transition-all duration-150 ${
                  currentBook === bookItem
                    ? "font-medium bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)] border-[var(--color-primary)]/20"
                    : "font-normal bg-surface-container-lowest text-on-surface hover:bg-surface-container-high"
                }`}
              >
                {bookItem}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Chapter List ── */}
        {currentSubject && (
          <div>
            <TaxonomyStep
              icon={<IconChapter />}
              label={currentChapter || (chapters.length > 0 ? "Select Chapter" : "Select Book First")}
              active={!!currentChapter}
              onClick={() => {}}
            />
            <div className="px-2 max-h-64 overflow-y-auto scroll-smooth [&::-webkit-scrollbar]:w-[4px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-outline-variant/20 [&::-webkit-scrollbar-thumb]:rounded-full">
              {chapters.length > 0 ? (
                chapters.map((ch) => (
                <button
                  key={ch}
                  type="button"
                  onClick={() => handleFilterChange("chapter", ch)}
                  className={`block w-full text-left px-3 py-2.5 text-[0.8125rem] border border-transparent rounded-md cursor-pointer transition-all duration-150 ${
                    currentChapter === ch
                      ? "font-medium bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)] border-[var(--color-primary)]/20"
                      : "font-normal bg-surface-container-lowest text-on-surface hover:bg-surface-container-high"
                  }`}
                >
                  {ch}
                  </button>
                ))
              ) : (
                <p className="text-[0.8125rem] italic text-on-surface-variant px-3 py-2 m-0">
                  {currentBook ? "No chapters found" : "Select a book to see chapters"}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   Question Bank Search Bar — Stitch-Directed
   Implements: full-width search input with icon and
   pill-style type filter buttons (All Types | MCQ | True/False | Fill Blanks)
   ───────────────────────────────────────────────────────── */
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

  const typeFilters = [
    { label: "All Types", value: "ALL" },
    { label: "MCQ", value: "MCQ" },
    { label: "True/False", value: "TRUE_FALSE" },
    { label: "Fill Blanks", value: "FILL_IN_BLANKS" },
  ];

  return (
    <div className="flex flex-col gap-4 mb-6">
      <div className="flex flex-wrap items-center gap-4">
        {/* Search Input */}
        <div className="relative flex-1 min-w-48">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="absolute -translate-y-1/2 pointer-events-none left-4 top-1/2 text-on-surface-variant"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            type="text"
            placeholder="Search by topic, keyword or chapter..."
            defaultValue={currentQuery}
            onChange={(e) => handleFilterChange("q", e.target.value)}
            className="w-full py-3 pl-12 pr-4 text-sm transition-colors duration-200 border-0 border-b outline-none bg-surface-container-low border-outline-variant/20 text-on-surface focus:border-b-2 focus:border-primary placeholder:text-on-surface-variant"
          />
        </div>

        {/* Type Filter Pills */}
        <div className="flex items-center gap-1 p-1 rounded-sm bg-surface-container-low">
          {typeFilters.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => handleFilterChange("type", f.value)}
              className={`py-1.5 px-4 text-xs border-none rounded-sm cursor-pointer transition-all duration-150 whitespace-nowrap ${
                currentType === f.value
                  ? "font-semibold bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)] shadow-[0_2px_6px_rgba(44,95,110,0.06)]"
                  : "font-normal bg-transparent text-on-surface-variant hover:text-on-surface"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Loading */}
        {isPending && (
          <div className="flex items-center gap-2">
            <Loader size="sm" label="Loading…" />
          </div>
        )}
      </div>
    </div>
  );
}
