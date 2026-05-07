"use client";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { PromptForm } from "@/components/prompt/PromptForm";

export default function NewPromptPage() {
  return (
    <AuthGuard>
      <div className="space-y-2 mb-6">
        <h1 className="text-h1">Subir prompt</h1>
        <p className="text-body-lg text-[var(--color-fg-muted)] max-w-2xl">
          Comparte un prompt con su imagen resultado. La comunidad podrá copiarlo,
          guardarlo y aprender de tu trabajo.
        </p>
      </div>
      <PromptForm />
    </AuthGuard>
  );
}
