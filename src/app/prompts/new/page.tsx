"use client";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { PromptForm } from "@/components/prompt/PromptForm";
import { useT } from "@/lib/i18n/I18nProvider";

export default function NewPromptPage() {
  const { t } = useT();
  return (
    <AuthGuard>
      <div className="space-y-2 mb-6">
        <h1 className="text-h1">{t("newPrompt.title")}</h1>
        <p className="text-body-lg text-[var(--color-fg-muted)] max-w-2xl">
          {t("newPrompt.lead")}
        </p>
      </div>
      <PromptForm />
    </AuthGuard>
  );
}
