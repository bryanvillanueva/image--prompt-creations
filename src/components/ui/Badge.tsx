import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

const badgeVariants = cva(
  "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium",
  {
    variants: {
      variant: {
        blue: "bg-[var(--color-badge-blue-bg)] text-[var(--color-badge-blue-fg)]",
        neutral: "bg-[var(--color-bg-subtle)] text-[var(--color-fg-muted)] shadow-ring-light",
        success: "bg-[var(--color-success-bg)] text-[var(--color-success-fg)]",
        warning: "bg-[var(--color-warning-bg)] text-[var(--color-warning-fg)]",
        danger: "bg-[var(--color-danger-bg)] text-[var(--color-danger-fg)]",
        dark: "bg-[var(--color-fg)] text-white",
      },
    },
    defaultVariants: { variant: "neutral" },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
