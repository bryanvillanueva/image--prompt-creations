"use client";
import * as React from "react";
import { Check, Copy } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/Button";
import { promptsApi } from "@/lib/api/prompts";
import { qk } from "@/lib/queries/keys";
import type { Prompt } from "@/lib/types";
import { toast } from "sonner";
import { useT } from "@/lib/i18n/I18nProvider";

export function CopyPromptButton({ prompt }: { prompt: Prompt }) {
  const [copied, setCopied] = React.useState(false);
  const qc = useQueryClient();
  const { t } = useT();

  const mutation = useMutation({
    mutationFn: () => promptsApi.copy(prompt.slug),
    onSuccess: (res) => {
      qc.setQueryData(qk.prompts.bySlug(prompt.slug), (old: { data: Prompt } | undefined) =>
        old ? { ...old, data: { ...old.data, copied_count: res.data.copied_count } } : old,
      );
    },
  });

  const onClick = async () => {
    try {
      await navigator.clipboard.writeText(prompt.prompt_text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
      mutation.mutate();
    } catch {
      toast.error(t("promptDetail.copyError"));
    }
  };

  return (
    <Button onClick={onClick} variant="primary" size="md">
      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      {copied ? t("common.copied") : t("promptDetail.copyButton")}
    </Button>
  );
}
