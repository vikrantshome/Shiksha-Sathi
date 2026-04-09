"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { schools } from "@/lib/api/schools";
import type { School } from "@/lib/api/schools";
import Loader from "@/components/Loader";

/* ─────────────────────────────────────────────────────────
   SearchableSchoolDropdown — M3 Autocomplete School Picker
   Features:
     - Debounced (300ms) search input
     - Dropdown of matching schools from API (max 5)
     - "School not listed? Add new school" option at bottom
     - Clicking "Add new" transforms to free-text input
     - M3 styled to match identity forms
   ───────────────────────────────────────────────────────── */

interface SearchableSchoolDropdownProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function SearchableSchoolDropdown({
  value,
  onChange,
  placeholder = "e.g. Delhi Public School",
}: SearchableSchoolDropdownProps) {
  const [query, setQuery] = useState(value);
  const [results, setResults] = useState<School[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const justSelectedRef = useRef(false); // Skip search after selection

  // Debounced search
  const searchSchools = useCallback(async (q: string) => {
    if (q.length < 2) {
      setResults([]);
      return;
    }
    setIsLoading(true);
    try {
      const found = await schools.search(q);
      setResults(found);
      setIsOpen(true); // Keep dropdown open — "Add new" option handles zero results
    } catch {
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (isAdding) return;
    if (justSelectedRef.current) { justSelectedRef.current = false; return; }

    debounceRef.current = setTimeout(() => {
      searchSchools(query);
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, isAdding, searchSchools]);

  // Sync value prop to query (but skip when we just selected from dropdown)
  useEffect(() => {
    if (isAdding) return;
    if (justSelectedRef.current) { justSelectedRef.current = false; return; }
    setQuery(value);
  }, [value, isAdding]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectSchool = (school: School) => {
    justSelectedRef.current = true;
    onChange(school.name);
    setIsOpen(false);
    setIsAdding(false);
    setQuery(school.name); // Set last so effect fires after state updates
  };

  const handleAddNewClick = () => {
    setIsAdding(true);
    setIsOpen(false);
    setQuery("");
    onChange("");
    inputRef.current?.focus();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setQuery(v);
    if (isAdding) {
      onChange(v);
    }
  };

  const handleInputBlur = () => {
    // Don't close immediately — let click handlers run first
    setTimeout(() => {
      if (!isAdding) {
        setIsOpen(false);
      }
    }, 150);
  };

  const handleInputFocus = () => {
    if (!isAdding && query.length >= 2 && results.length > 0) {
      setIsOpen(true);
    }
  };

  // ── Adding new school mode ──
  if (isAdding) {
    return (
      <div className="relative group">
        <label className="block text-[0.75rem] font-medium uppercase tracking-[0.05em] mb-2 transition-colors" style={{ color: "var(--color-on-surface-variant)" }}>
          School / Institute Name
        </label>
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            placeholder="Enter school name"
            className="flex-1 px-0 py-3 text-base transition-all border-t-0 border-b border-l-0 border-r-0 bg-transparent focus:ring-0 font-body"
            style={{ borderColor: "var(--color-outline-variant)", color: "var(--color-on-surface)" }}
            onFocus={(e) => e.target.style.borderColor = "var(--color-primary)"}
            onBlur={(e) => e.target.style.borderColor = "var(--color-outline-variant)"}
          />
          <button
            type="button"
            onClick={() => {
              setIsAdding(false);
              setQuery("");
              onChange("");
            }}
            className="shrink-0 text-[0.6875rem] font-bold uppercase tracking-wider cursor-pointer bg-transparent border-none transition-colors"
            style={{ color: "var(--color-primary)" }}
          >
            ✕
          </button>
        </div>
      </div>
    );
  }

  // ── Normal autocomplete mode ──
  return (
    <div ref={containerRef} className="relative group">
      <label className="block text-[0.75rem] font-medium uppercase tracking-[0.05em] mb-2 transition-colors" style={{ color: "var(--color-on-surface-variant)" }}>
        School / Institute Name
      </label>
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
        placeholder={placeholder}
        autoComplete="off"
        className="w-full px-0 py-3 text-base transition-all border-t-0 border-b border-l-0 border-r-0 bg-transparent focus:ring-0 font-body"
        style={{
          borderColor: isOpen ? "var(--color-primary)" : "var(--color-outline-variant)",
          color: "var(--color-on-surface)",
        }}
      />

      {/* Dropdown */}
      {isOpen && (query.length >= 2 || isLoading) && (
        <div
          className="absolute z-50 w-full mt-1 rounded-xl overflow-hidden shadow-lg"
          style={{ background: "var(--color-surface-container-lowest)", border: "1px solid var(--color-outline-variant)" }}
        >
          {isLoading && (
            <div className="px-4 py-4 text-sm flex items-center gap-3">
              <Loader size="sm" label="Searching..." />
            </div>
          )}

          {results.map((school) => (
            <button
              key={school.id}
              type="button"
              onMouseDown={(e) => { e.preventDefault(); handleSelectSchool(school); }}
              className="w-full text-left px-4 py-3 text-sm transition-colors"
              style={{ color: "var(--color-on-surface)" }}
              onMouseEnter={(e) => e.currentTarget.style.background = "var(--color-primary-container)"}
              onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
            >
              {school.name}
              {(school.city || school.state) && (
                <span className="block text-xs" style={{ color: "var(--color-on-surface-variant)" }}>
                  {[school.city, school.state].filter(Boolean).join(", ")}
                </span>
              )}
            </button>
          ))}

          {/* Add new school option */}
          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); handleAddNewClick(); }}
            className="w-full text-left px-4 py-3 text-sm transition-colors flex items-center gap-2 border-t"
            style={{
              color: "var(--color-primary)",
              borderTopColor: "var(--color-outline-variant)",
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = "var(--color-primary-container)"}
            onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><path d="M12 8v8" /><path d="M8 12h8" />
            </svg>
            School not listed? Add new school
          </button>
        </div>
      )}
    </div>
  );
}
