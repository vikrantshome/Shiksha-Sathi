"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useTransition } from "react";

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
    className={`w-full flex items-center gap-3 px-4 py-3 text-sm text-left border-none cursor-pointer transition-all duration-200 ${
      active
        ? "bg-surface-container-lowest text-primary font-medium rounded-r-lg"
        : "bg-transparent text-on-surface-variant font-normal hover:bg-surface-container"
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
    <div className="flex flex-col gap-1">
      {/* Loading indicator */}
      {isPending && (
        <div className="text-xs text-primary font-medium px-4 py-2">
          Loading…
        </div>
      )}

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
            className="w-full py-2 px-3 text-[0.8125rem] bg-surface-container-low border-0 border-b border-outline-variant/20 text-on-surface rounded-sm outline-none cursor-pointer transition-colors focus:border-primary"
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
          <div className="grid grid-cols-4 gap-1 px-4 py-1">
            {["6", "7", "8", "9", "10", "11", "12"].map((cls) => (
              <button
                key={cls}
                type="button"
                onClick={() => handleFilterChange("class", cls)}
                className={`py-1.5 text-[0.8125rem] text-center border-none rounded-sm cursor-pointer transition-all duration-150 ${
                  currentClass === cls
                    ? "font-semibold bg-primary-container text-on-primary-container"
                    : "font-normal bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-high"
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
          <div className="px-2">
            {subjects.length > 0 ? (
              subjects.map((subject) => (
                <button
                  key={subject}
                  type="button"
                  onClick={() => handleFilterChange("subject", subject)}
                  className={`block w-full text-left px-3 py-2 text-[0.8125rem] border-none rounded-sm cursor-pointer transition-all duration-150 ${
                    currentSubject === subject
                      ? "font-medium bg-primary-container text-on-primary-container"
                      : "font-normal bg-transparent text-on-surface hover:bg-surface-container-high"
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
                className={`block w-full text-left px-3 py-2 text-[0.8125rem] border-none rounded-sm cursor-pointer transition-all duration-150 ${
                  currentBook === bookItem
                    ? "font-medium bg-primary-container text-on-primary-container"
                    : "font-normal bg-transparent text-on-surface hover:bg-surface-container-high"
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
                  className={`block w-full text-left px-3 py-2 text-[0.8125rem] border-none rounded-sm cursor-pointer transition-all duration-150 ${
                    currentChapter === ch
                      ? "font-medium bg-primary-container text-on-primary-container"
                      : "font-normal bg-transparent text-on-surface hover:bg-surface-container-high"
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
      <div className="flex gap-4 items-center flex-wrap">
        {/* Search Input */}
        <div className="flex-1 relative min-w-48">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            type="text"
            placeholder="Search by topic, keyword or chapter..."
            defaultValue={currentQuery}
            onChange={(e) => handleFilterChange("q", e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-surface-container-low border-0 border-b border-outline-variant/20 text-sm text-on-surface outline-none transition-colors duration-200 focus:border-b-2 focus:border-primary placeholder:text-on-surface-variant"
          />
        </div>

        {/* Type Filter Pills */}
        <div className="flex items-center bg-surface-container-low p-1 rounded-sm gap-1">
          {typeFilters.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => handleFilterChange("type", f.value)}
              className={`py-1.5 px-4 text-xs border-none rounded-sm cursor-pointer transition-all duration-150 whitespace-nowrap ${
                currentType === f.value
                  ? "font-semibold bg-surface-container-lowest text-primary shadow-sm"
                  : "font-normal bg-transparent text-on-surface-variant hover:text-on-surface"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Loading */}
        {isPending && (
          <span className="text-xs text-primary font-medium">Loading…</span>
        )}
      </div>
    </div>
  );
}
