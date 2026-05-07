import * as React from "react";
import { cn } from "@/lib/cn";

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

export function EmptyState({ title, description, action, icon, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center py-16 px-6 rounded-xl bg-white shadow-card",
        className,
      )}
    >
      {icon && <div className="mb-4 text-[var(--color-fg-muted)]">{icon}</div>}
      <h3 className="text-h3 mb-2">{title}</h3>
      {description && (
        <p className="text-[var(--color-fg-muted)] max-w-md mb-4">{description}</p>
      )}
      {action}
    </div>
  );
}
