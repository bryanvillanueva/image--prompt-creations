"use client";
import * as React from "react";
import { Globe } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";
import { useT } from "@/lib/i18n/I18nProvider";
import type { Locale } from "@/lib/i18n/messages";
import { cn } from "@/lib/cn";

interface Props {
  className?: string;
  variant?: "compact" | "inline";
}

export function LanguageSwitcher({ className, variant = "compact" }: Props) {
  const { locale, setLocale, t } = useT();
  const items: { value: Locale; label: string }[] = [
    { value: "es", label: t("locale.es") },
    { value: "en", label: t("locale.en") },
  ];

  if (variant === "inline") {
    return (
      <div className={cn("inline-flex rounded-md shadow-ring-light p-0.5 bg-white", className)}>
        {items.map((it) => (
          <button
            key={it.value}
            type="button"
            onClick={() => setLocale(it.value)}
            className={cn(
              "px-2.5 py-1 text-xs font-medium rounded-sm uppercase",
              locale === it.value
                ? "bg-[var(--color-fg)] text-white"
                : "text-[var(--color-fg-muted)] hover:text-[var(--color-fg)]",
            )}
            aria-pressed={locale === it.value}
          >
            {it.value}
          </button>
        ))}
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={t("locale.switchTo")}
          className={cn(
            "inline-flex h-9 items-center gap-1 rounded-md px-2 text-sm hover:bg-[var(--color-bg-subtle)]",
            className,
          )}
        >
          <Globe className="h-4 w-4" />
          <span className="uppercase text-xs font-semibold">{locale}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {items.map((it) => (
          <DropdownMenuItem
            key={it.value}
            onSelect={() => setLocale(it.value)}
            className={cn(locale === it.value && "font-medium")}
          >
            {it.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
