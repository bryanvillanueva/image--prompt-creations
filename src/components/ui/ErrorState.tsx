"use client";
import { AlertTriangle } from "lucide-react";
import { Button } from "./Button";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = "Algo salió mal",
  message = "No pudimos cargar la información. Inténtalo de nuevo.",
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6 rounded-xl bg-white shadow-card">
      <AlertTriangle className="h-8 w-8 mb-4 text-[var(--color-danger-fg)]" />
      <h3 className="text-h3 mb-2">{title}</h3>
      <p className="text-[var(--color-fg-muted)] max-w-md mb-4">{message}</p>
      {onRetry && (
        <Button variant="secondary" onClick={onRetry}>
          Reintentar
        </Button>
      )}
    </div>
  );
}
