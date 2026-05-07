"use client";
import * as React from "react";
import { Bookmark } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { promptsApi } from "@/lib/api/prompts";
import { ApiError } from "@/lib/api/client";
import { qk } from "@/lib/queries/keys";
import { useAuth } from "@/lib/auth/AuthContext";
import { useT } from "@/lib/i18n/I18nProvider";
import type { Prompt } from "@/lib/types";

export function SaveButton({ prompt }: { prompt: Prompt }) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const qc = useQueryClient();
  const { t } = useT();
  const [saved, setSaved] = React.useState(false);

  const mutation = useMutation({
    mutationFn: () => (saved ? promptsApi.unsave(prompt.id) : promptsApi.save(prompt.id)),
    onMutate: async () => {
      const willSave = !saved;
      setSaved(willSave);
      qc.setQueryData(qk.prompts.bySlug(prompt.slug), (old: { data: Prompt } | undefined) =>
        old
          ? { ...old, data: { ...old.data, saves_count: old.data.saves_count + (willSave ? 1 : -1) } }
          : old,
      );
      return { willSave };
    },
    onError: (err, _vars, ctx) => {
      setSaved(!ctx?.willSave);
      if (err instanceof ApiError && err.status === 401) {
        router.push(`/login?next=${encodeURIComponent(`/prompts/${prompt.slug}`)}`);
      } else if (err instanceof ApiError) {
        toast.error(err.message);
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.me.saved });
      toast.success(saved ? t("promptDetail.saveAdded") : t("promptDetail.saveRemoved"));
    },
  });

  return (
    <Button
      variant="secondary"
      onClick={() => {
        if (!isAuthenticated) {
          router.push(`/login?next=${encodeURIComponent(`/prompts/${prompt.slug}`)}`);
          return;
        }
        mutation.mutate();
      }}
    >
      <Bookmark className={`h-4 w-4 ${saved ? "fill-current" : ""}`} />
      {saved ? t("promptDetail.savedButton") : t("promptDetail.saveButton")}
    </Button>
  );
}
