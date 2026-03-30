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
    style={{
      width: "100%",
      display: "flex",
      alignItems: "center",
      gap: "var(--space-3)",
      padding: "var(--space-3) var(--space-4)",
      background: active
        ? "var(--color-surface-container-lowest)"
        : "transparent",
      color: active
        ? "var(--color-primary)"
        : "var(--color-on-surface-variant)",
      fontWeight: active ? 500 : 400,
      fontSize: "0.875rem",
      border: "none",
      borderRadius: active ? "0 var(--radius-lg) var(--radius-lg) 0" : "0",
      cursor: "pointer",
      transition: "all 200ms ease-out",
      textAlign: "left",
    }}
    className="taxonomy-step"
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
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-1)",
      }}
    >
      {/* Loading indicator */}
      {isPending && (
        <div
          style={{
            fontSize: "0.75rem",
            color: "var(--color-primary)",
            fontWeight: 500,
            padding: "var(--space-2) var(--space-4)",
          }}
        >
          Loading…
        </div>
      )}

      {/* ── Board Select ── */}
      <div style={{ marginBottom: "var(--space-2)" }}>
        <TaxonomyStep
          icon={<IconBoard />}
          label={currentBoard || "Board Select"}
          active={!!currentBoard}
          onClick={() => {
            /* Toggle or cycle — for now, present as select */
          }}
        />
        {/* Board dropdown inline */}
        <div style={{ padding: "0 var(--space-4)" }}>
          <select
            value={currentBoard}
            onChange={(e) => handleFilterChange("board", e.target.value)}
            style={{
              width: "100%",
              padding: "var(--space-2) var(--space-3)",
              fontSize: "0.8125rem",
              background: "var(--color-surface-container-low)",
              border: "none",
              borderBottom: "1px solid rgba(176, 179, 173, 0.2)",
              color: "var(--color-on-surface)",
              borderRadius: "var(--radius-sm)",
              outline: "none",
              cursor: "pointer",
            }}
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
        <div style={{ marginBottom: "var(--space-2)" }}>
          <TaxonomyStep
            icon={<IconClass />}
            label={currentClass ? `Class ${currentClass}` : "Class (6-12)"}
            active={!!currentClass}
            onClick={() => {}}
          />
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "var(--space-1)",
              padding: "var(--space-1) var(--space-4)",
            }}
          >
            {["6", "7", "8", "9", "10", "11", "12"].map((cls) => (
              <button
                key={cls}
                type="button"
                onClick={() => handleFilterChange("class", cls)}
                style={{
                  padding: "var(--space-1-5) 0",
                  fontSize: "0.8125rem",
                  fontWeight: currentClass === cls ? 600 : 400,
                  background:
                    currentClass === cls
                      ? "var(--color-primary-container)"
                      : "var(--color-surface-container-lowest)",
                  color:
                    currentClass === cls
                      ? "var(--color-on-primary-container)"
                      : "var(--color-on-surface-variant)",
                  border: "none",
                  borderRadius: "var(--radius-sm)",
                  cursor: "pointer",
                  transition: "all 150ms ease-out",
                  textAlign: "center",
                }}
              >
                {cls}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Subject ── */}
      {currentClass && (
        <div style={{ marginBottom: "var(--space-2)" }}>
          <TaxonomyStep
            icon={<IconSubject />}
            label={currentSubject || "Subject"}
            active={!!currentSubject}
            onClick={() => {}}
          />
          <div style={{ padding: "0 var(--space-2)" }}>
            {subjects.length > 0 ? (
              subjects.map((subject) => (
                <button
                  key={subject}
                  type="button"
                  onClick={() => handleFilterChange("subject", subject)}
                  style={{
                    display: "block",
                    width: "100%",
                    textAlign: "left",
                    padding: "var(--space-2) var(--space-3)",
                    fontSize: "0.8125rem",
                    fontWeight: currentSubject === subject ? 500 : 400,
                    background:
                      currentSubject === subject
                        ? "var(--color-primary-container)"
                        : "transparent",
                    color:
                      currentSubject === subject
                        ? "var(--color-on-primary-container)"
                        : "var(--color-on-surface)",
                    border: "none",
                    borderRadius: "var(--radius-sm)",
                    cursor: "pointer",
                    transition: "all 150ms ease-out",
                  }}
                  className="taxonomy-option"
                >
                  {subject}
                </button>
              ))
            ) : (
              <p
                style={{
                  fontSize: "0.8125rem",
                  fontStyle: "italic",
                  color: "var(--color-on-surface-variant)",
                  padding: "var(--space-2) var(--space-3)",
                  margin: 0,
                }}
              >
                No subjects found
              </p>
            )}
          </div>
        </div>
      )}

      {/* ── Book Series ── */}
      {currentSubject && books.length > 1 && (
        <div style={{ marginBottom: "var(--space-2)" }}>
          <TaxonomyStep
            icon={<IconBook />}
            label={currentBook || "Book Series"}
            active={!!currentBook}
            onClick={() => {}}
          />
          <div style={{ padding: "0 var(--space-2)" }}>
            {books.map((bookItem) => (
              <button
                key={bookItem}
                type="button"
                onClick={() => handleFilterChange("book", bookItem)}
                style={{
                  display: "block",
                  width: "100%",
                  textAlign: "left",
                  padding: "var(--space-2) var(--space-3)",
                  fontSize: "0.8125rem",
                  fontWeight: currentBook === bookItem ? 500 : 400,
                  background:
                    currentBook === bookItem
                      ? "var(--color-primary-container)"
                      : "transparent",
                  color:
                    currentBook === bookItem
                      ? "var(--color-on-primary-container)"
                      : "var(--color-on-surface)",
                  border: "none",
                  borderRadius: "var(--radius-sm)",
                  cursor: "pointer",
                  transition: "all 150ms ease-out",
                }}
                className="taxonomy-option"
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
            label={currentChapter || "Chapter List"}
            active={!!currentChapter}
            onClick={() => {}}
          />
          <div
            style={{
              padding: "0 var(--space-2)",
              maxHeight: "16rem",
              overflowY: "auto",
            }}
            className="custom-scrollbar"
          >
            {chapters.length > 0 ? (
              chapters.map((ch) => (
                <button
                  key={ch}
                  type="button"
                  onClick={() => handleFilterChange("chapter", ch)}
                  style={{
                    display: "block",
                    width: "100%",
                    textAlign: "left",
                    padding: "var(--space-2) var(--space-3)",
                    fontSize: "0.8125rem",
                    fontWeight: currentChapter === ch ? 500 : 400,
                    background:
                      currentChapter === ch
                        ? "var(--color-primary-container)"
                        : "transparent",
                    color:
                      currentChapter === ch
                        ? "var(--color-on-primary-container)"
                        : "var(--color-on-surface)",
                    border: "none",
                    borderRadius: "var(--radius-sm)",
                    cursor: "pointer",
                    transition: "all 150ms ease-out",
                  }}
                  className="taxonomy-option"
                >
                  {ch}
                </button>
              ))
            ) : (
              <p
                style={{
                  fontSize: "0.8125rem",
                  fontStyle: "italic",
                  color: "var(--color-on-surface-variant)",
                  padding: "var(--space-2) var(--space-3)",
                  margin: 0,
                }}
              >
                No chapters found
              </p>
            )}
          </div>
        </div>
      )}

      {/* ═══ Responsive Styles ═══ */}
      <style>{`
        .taxonomy-step:hover {
          background: var(--color-surface-container) !important;
        }
        .taxonomy-option:hover {
          background: var(--color-surface-container-high) !important;
        }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(176, 179, 173, 0.2);
          border-radius: 10px;
        }
      `}</style>
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
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-4)",
        marginBottom: "var(--space-6)",
      }}
      className="qb-search-cluster"
    >
      <div
        style={{
          display: "flex",
          gap: "var(--space-4)",
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        {/* Search Input */}
        <div style={{ flex: 1, position: "relative", minWidth: "12rem" }}>
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              position: "absolute",
              left: "var(--space-4)",
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--color-on-surface-variant)",
              pointerEvents: "none",
            }}
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            type="text"
            placeholder="Search by topic, keyword or chapter..."
            defaultValue={currentQuery}
            onChange={(e) => handleFilterChange("q", e.target.value)}
            style={{
              width: "100%",
              paddingLeft: "var(--space-12)",
              paddingRight: "var(--space-4)",
              paddingTop: "var(--space-3)",
              paddingBottom: "var(--space-3)",
              background: "var(--color-surface-container-low)",
              border: "none",
              borderBottom: "1px solid rgba(176, 179, 173, 0.2)",
              fontSize: "0.875rem",
              color: "var(--color-on-surface)",
              outline: "none",
              transition: "border-color 200ms ease-out",
            }}
            className="qb-search-input"
          />
        </div>

        {/* Type Filter Pills */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            background: "var(--color-surface-container-low)",
            padding: "var(--space-1)",
            borderRadius: "var(--radius-sm)",
            gap: "var(--space-1)",
          }}
        >
          {typeFilters.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => handleFilterChange("type", f.value)}
              style={{
                padding: "var(--space-1-5) var(--space-4)",
                fontSize: "0.75rem",
                fontWeight: currentType === f.value ? 600 : 400,
                background:
                  currentType === f.value
                    ? "var(--color-surface-container-lowest)"
                    : "transparent",
                color:
                  currentType === f.value
                    ? "var(--color-primary)"
                    : "var(--color-on-surface-variant)",
                border: "none",
                borderRadius: "var(--radius-sm)",
                cursor: "pointer",
                transition: "all 150ms ease-out",
                boxShadow:
                  currentType === f.value
                    ? "0 1px 4px rgba(48, 51, 47, 0.06)"
                    : "none",
                whiteSpace: "nowrap",
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Loading */}
        {isPending && (
          <span
            style={{
              fontSize: "0.75rem",
              color: "var(--color-primary)",
              fontWeight: 500,
            }}
          >
            Loading…
          </span>
        )}
      </div>

      <style>{`
        .qb-search-input:focus {
          border-bottom-color: var(--color-primary) !important;
        }
      `}</style>
    </div>
  );
}
