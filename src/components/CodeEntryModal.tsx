"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";

interface CodeEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (code: string) => void;
  title: string;
  description?: string;
  placeholder?: string;
}

export default function CodeEntryModal({
  isOpen,
  onClose,
  onSubmit,
  title,
  description = "Enter the 6-character code provided by your teacher.",
  placeholder = "e.g. A3K9X7"
}: CodeEntryModalProps) {
  const [code, setCode] = useState("");

  useEffect(() => {
    if (isOpen) {
      setCode("");
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim()) {
      onSubmit(code.trim().toUpperCase());
      onClose();
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[var(--color-surface)]/40 backdrop-blur-sm animate-in fade-in duration-200 px-4">
      <div 
        className="w-full max-w-sm rounded-[var(--radius-lg)] bg-[var(--color-surface-container-lowest)] shadow-[var(--shadow-xl)] border border-[var(--color-outline-variant)] overflow-hidden animate-in zoom-in-95 duration-200"
      >
        <div className="p-6">
          <h2 className="text-xl font-bold tracking-tight text-[var(--color-on-surface)] mb-2">
            {title}
          </h2>
          <p className="text-sm text-[var(--color-on-surface-variant)] mb-6">
            {description}
          </p>

          <form onSubmit={handleSubmit}>
            <div className="relative group mb-8">
              <label 
                htmlFor="code-entry" 
                className="absolute left-4 top-2 text-[0.65rem] font-bold uppercase tracking-wider opacity-60 text-[var(--color-primary)] transition-opacity group-focus-within:opacity-100"
              >
                Code
              </label>
              <input
                id="code-entry"
                type="text"
                autoFocus
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder={placeholder}
                className="w-full bg-[var(--color-surface-container-low)] pt-7 pb-3 px-4 text-base focus:ring-0 border-b-2 border-[var(--color-outline-variant)] placeholder:opacity-30 transition-colors rounded-t-lg text-[var(--color-on-surface)] outline-none"
                style={{
                  borderBottomColor: code ? "var(--color-primary)" : "var(--color-outline-variant)"
                }}
                onFocus={(e) => e.target.style.borderBottomColor = "var(--color-primary)"}
                onBlur={(e) => e.target.style.borderBottomColor = code ? "var(--color-primary)" : "var(--color-outline-variant)"}
              />
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 text-sm font-semibold rounded-lg transition-colors text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-container-highest)] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!code.trim()}
                className="px-5 py-2.5 text-sm font-semibold rounded-lg transition-all shadow-[var(--shadow-sm)] disabled:opacity-50 disabled:cursor-not-allowed bg-[var(--color-primary)] text-[var(--color-on-primary)] hover:brightness-110 active:scale-95 cursor-pointer"
              >
                Continue
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );

  if (typeof document !== "undefined") {
    return createPortal(modalContent, document.body);
  }
  return null;
}
