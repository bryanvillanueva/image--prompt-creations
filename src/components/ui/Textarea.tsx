"use client";
import * as React from "react";
import { cn } from "@/lib/cn";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, invalid, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          "min-h-24 w-full rounded-md px-3 py-2 text-sm outline-none transition-shadow",
          invalid ? "shadow-[rgba(185,28,28,0.4)_0_0_0_1px]" : "shadow-ring-light",
          "focus:shadow-[var(--color-focus)_0_0_0_2px]",
          className,
        )}
        {...props}
      />
    );
  },
);
Textarea.displayName = "Textarea";
