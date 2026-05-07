"use client";
import { AlertTriangle } from "lucide-react";
import { Button } from "./Button";
import { useT } from "@/lib/i18n/I18nProvider";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ title, message, onRetry }: ErrorStateProps) {
  const { t } = useT();
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6 rounded-xl bg-white shadow-card">
      <AlertTriangle className="h-8 w-8 mb-4 text-[var(--color-danger-fg)]" />
      <h3 className="text-h3 mb-2">{title ?? t("states.errorTitle")}</h3>
      <p className="text-[var(--color-fg-muted)] max-w-md mb-4">{message ?? t("states.errorMessage")}</p>
      {onRetry && (
        <Button variant="secondary" onClick={onRetry}>
          {t("common.retry")}
        </Button>
      )}
    </div>
  );
}
