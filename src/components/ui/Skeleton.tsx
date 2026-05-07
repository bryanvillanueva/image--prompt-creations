import { cn } from "@/lib/cn";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-[var(--color-bg-subtle)] shadow-ring-light",
        className,
      )}
    />
  );
}
