"use client";

import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface SelectProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  error?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

const Select = ({
  value,
  onValueChange,
  placeholder = "Select an option",
  error,
  disabled,
  icon,
  children,
}: SelectProps) => {
  return (
    <SelectPrimitive.Root value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectPrimitive.Trigger
        className={cn(
          `relative flex h-12 w-full items-center rounded-xl border-2 bg-white px-4 py-3 text-[14px]
          text-left transition-all duration-200 cursor-pointer
          focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
          disabled:cursor-not-allowed disabled:opacity-50
          ${error ? "border-error bg-error-container/30 focus:ring-error/20 focus:border-error" : "border-outline-variant/60 hover:border-primary/40"}`,
          icon ? "pl-10" : ""
        )}
      >
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/60">
            {icon}
          </div>
        )}
        <SelectPrimitive.Value placeholder={placeholder} className={cn("flex-1 truncate", !value && "text-on-surface-variant/60")} />
        <SelectPrimitive.Icon>
          <ChevronDown className="w-5 h-5 text-on-surface-variant/60" />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>

      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          className="relative z-50 min-w-[8rem] overflow-hidden rounded-xl bg-white shadow-xl border border-outline-variant/20 animate-fade-in"
          position="popper"
          sideOffset={4}
        >
          <SelectPrimitive.Viewport className="max-h-60 overflow-y-auto p-1">
            {children}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
};

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex w-full cursor-pointer select-none items-center rounded-lg py-2.5 pl-10 pr-4 text-[14px] text-on-surface outline-none transition-colors",
      "hover:bg-primary-container/30",
      "focus:bg-primary-container/30",
      "data-[selected=true]:bg-primary-container data-[selected=true]:text-on-primary-container data-[selected=true]:font-semibold",
      className
    )}
    {...props}
  >
    <span className="absolute left-3 flex h-4 w-4 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <Check className="w-4 h-4 text-primary" />
      </SelectPrimitive.ItemIndicator>
    </span>
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
));
SelectItem.displayName = SelectPrimitive.Item.displayName;

export { Select, SelectItem };