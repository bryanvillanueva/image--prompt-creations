"use client";
import { cn } from "@/lib/cn";
import { useT } from "@/lib/i18n/I18nProvider";

export function Spinner({ className }: { className?: string }) {
  const { t } = useT();
  return (
    <span
      role="status"
      aria-label={t("common.loading")}
      className={cn(
        "inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent",
        className,
      )}
    />
  );
}
