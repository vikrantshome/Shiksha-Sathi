"use client";

import { useState, useId, forwardRef, ForwardRefRenderFunction, InputHTMLAttributes } from "react";

interface MaterialTextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  label: string;
  value?: string;
  onChange?: (value: string) => void;
  helperText?: string;
  error?: string;
  suffix?: string;
  prefix?: string;
}

const MaterialTextField: ForwardRefRenderFunction<HTMLInputElement, MaterialTextFieldProps> = ({
  label,
  value = "",
  onChange,
  helperText,
  error,
  suffix,
  prefix,
  type = "text",
  placeholder,
  required,
  disabled,
  min,
  max,
  className,
  ...restProps
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  const hasValue = value.length > 0;
  const id = useId();
  const showFloatingLabel = isFocused || hasValue;

  return (
    <div className={`relative w-full ${className || ""}`}>
      {/* Input Container */}
      <div
        className={`
          relative rounded-xl border-2 transition-all duration-200 overflow-hidden
          ${error 
            ? "border-error bg-error-container/30" 
            : isFocused 
            ? "border-primary bg-primary-container/20 shadow-md ring-2 ring-primary/10" 
            : "border-outline-variant/60 bg-surface-container-low hover:border-primary/40"
          }
          ${disabled ? "bg-surface-container opacity-50 cursor-not-allowed" : ""}
        `}
      >
        {/* Prefix Icon */}
        {prefix && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/60">
            {prefix}
          </div>
        )}

        {/* Floating Label */}
        <label
          htmlFor={id}
          className={`
            absolute transition-all duration-200 pointer-events-none z-10
            ${prefix ? "left-10" : "left-4"}
            ${showFloatingLabel
              ? `-top-1 text-[11px] font-semibold ${error ? "text-error" : "text-primary"} bg-surface-container-low px-1.5 py-0.5 rounded-md`
              : "top-1/2 -translate-y-1/2 text-[14px] text-on-surface-variant/70"
            }
          `}
        >
          {label}
          {required && <span className="text-error ml-0.5">*</span>}
        </label>

        {/* Input */}
        <input
          ref={ref}
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={isFocused ? placeholder : ""}
          disabled={disabled}
          required={required}
          min={min}
          max={max}
          className={`
            w-full ${prefix ? "pl-10" : "pl-4"} pr-4 pt-5 pb-2 bg-transparent outline-none
            text-[14px] leading-tight text-on-surface
            placeholder:text-on-surface-variant/40
            disabled:cursor-not-allowed
          `}
          {...restProps}
        />

        {/* Suffix (e.g., "seconds") */}
        {suffix && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[12px] text-on-surface-variant/60 font-medium">
            {suffix}
          </span>
        )}
      </div>

      {/* Helper Text / Error */}
      <div className={`mt-1.5 min-h-[20px] flex items-center gap-1.5 text-[12px] leading-tight ${error ? "text-error" : "text-on-surface-variant/60"}`}>
        {error && (
          <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )}
        <span className="ml-0.5">{error || helperText}</span>
      </div>
    </div>
  );
};

export default forwardRef(MaterialTextField);