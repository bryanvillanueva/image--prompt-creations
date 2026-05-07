"use client";
import * as React from "react";
import { cn } from "@/lib/cn";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  invalid?: boolean;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, invalid, children, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={cn(
          "h-9 w-full rounded-md bg-white px-3 pr-8 text-sm outline-none transition-shadow appearance-none",
          "bg-[url('data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22%23666%22%3E%3Cpath%20d%3D%22M5.23%207.21a.75.75%200%200%201%201.06.02L10%2011.06l3.71-3.83a.75.75%200%201%201%201.08%201.04l-4.25%204.39a.75.75%200%200%201-1.08%200L5.21%208.27a.75.75%200%200%201%20.02-1.06z%22/%3E%3C/svg%3E')] bg-no-repeat bg-[right_0.5rem_center] bg-[length:1rem_1rem]",
          invalid ? "shadow-[rgba(185,28,28,0.4)_0_0_0_1px]" : "shadow-ring-light",
          "focus:shadow-[var(--color-focus)_0_0_0_2px]",
          className,
        )}
        {...props}
      >
        {children}
      </select>
    );
  },
);
Select.displayName = "Select";
