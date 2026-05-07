"use client";
import * as React from "react";
import * as RAvatar from "@radix-ui/react-avatar";
import { cn } from "@/lib/cn";

interface AvatarProps {
  src?: string | null;
  name?: string | null;
  size?: number;
  className?: string;
}

export function Avatar({ src, name, size = 32, className }: AvatarProps) {
  const initials = (name ?? "?")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join("");
  return (
    <RAvatar.Root
      className={cn(
        "inline-flex items-center justify-center rounded-full bg-[var(--color-bg-subtle)] shadow-ring-light overflow-hidden text-[var(--color-fg-muted)] font-medium",
        className,
      )}
      style={{ width: size, height: size, fontSize: Math.max(10, size / 2.6) }}
    >
      {src ? (
        <RAvatar.Image src={src} alt={name ?? ""} className="h-full w-full object-cover" />
      ) : null}
      <RAvatar.Fallback delayMs={200}>{initials}</RAvatar.Fallback>
    </RAvatar.Root>
  );
}
