"use client";

import { useState, useRef, useEffect, useId } from "react";

interface SelectOption {
  value: string;
  label: string;
}

interface MaterialSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  helperText?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
}

export default function MaterialSelect({
  label,
  value,
  onChange,
  options,
  placeholder = "Select an option",
  helperText,
  error,
  required,
  disabled,
  icon,
}: MaterialSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const id = useId();
  const selectedOption = options.find((opt) => opt.value === value);
  const hasValue = value.length > 0;
  const showFloatingLabel = isOpen || isFocused || hasValue;

  // Close on outside click & handle keyboard
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
        setIsFocused(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        setIsOpen(false);
        setIsFocused(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div className="relative w-full" ref={ref}>
      {/* Select Trigger */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => !isOpen && setIsFocused(false)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-labelledby={`${id}-label`}
        className={`
          relative w-full flex items-center ${icon ? "pl-10" : "pl-4"} pr-10 py-3 rounded-xl border-2 text-left
          transition-all duration-200 cursor-pointer min-h-[48px]
          ${error ? "border-error bg-error-container/30" : ""}
          ${isOpen ? "border-primary bg-primary-container/20 shadow-md" : "border-outline-variant/60 bg-white hover:border-primary/40"}
          ${disabled ? "bg-surface-container opacity-50 cursor-not-allowed" : ""}
        `}
      >
        <span className={`text-[14px] truncate ${hasValue ? "text-on-surface font-medium" : "text-on-surface-variant/60"}`}>
          {hasValue ? selectedOption?.label : placeholder}
        </span>
      </button>

      {/* Chevron - Absolute positioned */}
      <svg
        className={`absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none transition-transform duration-200 ${isOpen ? "rotate-180 text-primary" : "text-on-surface-variant"}`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
      </svg>

      {/* Prefix Icon */}
      {icon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/60">
          {icon}
        </div>
      )}

      {/* Floating Label */}
      <label
        id={`${id}-label`}
        className={`
          absolute transition-all duration-200 pointer-events-none z-10 bg-white px-1
          ${icon ? "left-9" : "left-3"}
          ${showFloatingLabel
            ? `-top-2 text-[11px] font-semibold ${error ? "text-error" : "text-primary"}`
            : "top-1/2 -translate-y-1/2 text-[14px] text-on-surface-variant/60"
          }
        `}
      >
        {label}
        {required && <span className="text-error ml-0.5">*</span>}
      </label>

      {/* Dropdown Options */}
      {isOpen && (
        <div
          role="listbox"
          className="absolute z-50 w-full mt-1 py-1 bg-white rounded-xl shadow-xl border border-outline-variant/20 animate-fade-in max-h-60 overflow-y-auto"
        >
          {options.map((option, i) => (
            <button
              key={option.value}
              type="button"
              role="option"
              aria-selected={option.value === value}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
                setIsFocused(false);
              }}
              className={`
                w-full px-4 py-2.5 text-left text-[14px] transition-colors flex items-center gap-3
                hover:bg-primary-container/30
                ${option.value === value ? "bg-primary-container text-on-primary-container font-semibold" : "text-on-surface"}
              `}
            >
              {option.value === value && (
                <svg className="w-4 h-4 text-primary shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
              <span className="truncate">{option.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Helper Text / Error */}
      <div className={`mt-1.5 min-h-[20px] flex items-center gap-1.5 text-[12px] leading-tight ${error ? "text-error" : "text-on-surface-variant/60"}`}>
        {error && (
          <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )}
        <span>{error || helperText}</span>
      </div>
    </div>
  );
}