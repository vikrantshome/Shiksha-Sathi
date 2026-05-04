import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          `flex h-12 w-full rounded-xl border-2 bg-white px-4 py-3 text-[14px] text-on-surface
          placeholder:text-on-surface-variant/50
          transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
          disabled:cursor-not-allowed disabled:opacity-50
          ${error ? "border-error bg-error-container/30 focus:ring-error/20 focus:border-error" : "border-outline-variant/60 hover:border-primary/40"}`,
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };