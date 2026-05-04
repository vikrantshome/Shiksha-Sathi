"use client";

import { useState, useId } from "react";

interface MaterialCheckboxProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  description?: string;
}

export default function MaterialCheckbox({
  label,
  checked,
  onChange,
  disabled,
  description,
}: MaterialCheckboxProps) {
  const [isPressed, setIsPressed] = useState(false);
  const id = useId();

  const handleClick = () => {
    if (disabled) return;
    setIsPressed(true);
    onChange(!checked);
    setTimeout(() => setIsPressed(false), 200);
  };

  return (
    <label
      htmlFor={id}
      className={`
        relative flex items-start gap-3 cursor-pointer select-none min-h-[48px]
        ${disabled ? "opacity-50 cursor-not-allowed" : ""}
      `}
    >
      {/* Checkbox Container */}
      <div
        role="checkbox"
        aria-checked={checked}
        aria-disabled={disabled}
        onClick={handleClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleClick();
          }
        }}
        className={`
          relative w-5 h-5 mt-0.5 rounded-md border-2 transition-all duration-200 flex items-center justify-center shrink-0
          ${checked ? "bg-primary border-primary" : "border-outline-variant/60 hover:border-primary"}
          ${isPressed ? "scale-95" : "scale-100"}
          ${disabled ? "opacity-50" : ""}
        `}
      >
        {/* Check Icon */}
        {checked && (
          <svg
            className="w-3.5 h-3.5 text-on-primary animate-bounce-in"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>

      {/* Label & Description */}
      <div className="flex-1">
        <span className={`text-[14px] font-medium ${checked ? "text-on-surface" : "text-on-surface-variant"}`}>
          {label}
        </span>
        {description && (
          <p className="mt-0.5 text-[12px] text-on-surface-variant/60 leading-relaxed">
            {description}
          </p>
        )}
      </div>
    </label>
  );
}