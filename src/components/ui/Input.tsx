"use client";
import * as React from "react";
import { cn } from "@/lib/cn";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, invalid, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "h-9 w-full rounded-md px-3 text-sm outline-none transition-shadow",
          invalid ? "shadow-[rgba(185,28,28,0.4)_0_0_0_1px]" : "shadow-ring-light",
          "focus:shadow-[var(--color-focus)_0_0_0_2px]",
          className,
        )}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";
