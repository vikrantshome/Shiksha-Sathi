"use client";

import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface CheckboxProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label: string;
  description?: string;
  disabled?: boolean;
  id?: string;
}

const Checkbox = ({
  checked,
  onCheckedChange,
  label,
  description,
  disabled,
  id,
}: CheckboxProps) => {
  return (
    <div className="flex items-start gap-3 cursor-pointer">
      <CheckboxPrimitive.Root
        id={id}
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        className={cn(
          "mt-0.5 h-5 w-5 shrink-0 rounded-md border-2 transition-all duration-200",
          "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
          checked
            ? "bg-primary border-primary"
            : "border-outline-variant/60 hover:border-primary/40 bg-white"
        )}
      >
        <CheckboxPrimitive.Indicator className="flex items-center justify-center">
          <Check className="w-3.5 h-3.5 text-on-primary" strokeWidth={3} />
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>

      <div className="flex-1">
        <label
          htmlFor={id}
          className={cn(
            "text-[14px] font-medium cursor-pointer",
            checked ? "text-on-surface" : "text-on-surface-variant",
            disabled && "cursor-not-allowed opacity-50"
          )}
        >
          {label}
        </label>
        {description && (
          <p className="mt-0.5 text-[12px] text-on-surface-variant/60 leading-relaxed">
            {description}
          </p>
        )}
      </div>
    </div>
  );
};

export { Checkbox };