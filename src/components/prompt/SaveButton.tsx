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

type SaveAction = "save" | "unsave";

export function SaveButton({ prompt }: { prompt: Prompt }) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const qc = useQueryClient();
  const { t } = useT();
  const [saved, setSaved] = React.useState(prompt.is_saved ?? false);

  React.useEffect(() => {
    if (typeof prompt.is_saved === "boolean") setSaved(prompt.is_saved);
  }, [prompt.is_saved]);

  const syncFromServer = (savesCount: number) => {
    qc.setQueryData(qk.prompts.bySlug(prompt.slug), (old: { data: Prompt } | undefined) =>
      old ? { ...old, data: { ...old.data, saves_count: savesCount } } : old,
    );
  };

  const mutation = useMutation({
    mutationFn: (action: SaveAction) =>
      action === "save" ? promptsApi.save(prompt.id) : promptsApi.unsave(prompt.id),
    onMutate: (action: SaveAction) => {
      const willSave = action === "save";
      setSaved(willSave);
      qc.setQueryData(qk.prompts.bySlug(prompt.slug), (old: { data: Prompt } | undefined) =>
        old
          ? { ...old, data: { ...old.data, saves_count: old.data.saves_count + (willSave ? 1 : -1) } }
          : old,
      );
      return { willSave };
    },
    onSuccess: (res, _action, ctx) => {
      if (!res?.data?.ok) {
        setSaved(!ctx?.willSave);
        toast.error("No se pudo aplicar el cambio en el servidor");
        return;
      }
      if (typeof res.data.saves_count === "number") {
        syncFromServer(res.data.saves_count);
      }
      qc.invalidateQueries({ queryKey: qk.me.saved });
      toast.success(ctx?.willSave ? t("promptDetail.saveAdded") : t("promptDetail.saveRemoved"));
    },
    onError: (err, _action, ctx) => {
      setSaved(!ctx?.willSave);
      if (err instanceof ApiError && err.status === 401) {
        router.push(`/login?next=${encodeURIComponent(`/prompts/${prompt.slug}`)}`);
      } else if (err instanceof ApiError) {
        toast.error(err.message);
      }
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
        mutation.mutate(saved ? "unsave" : "save");
      }}
    >
      <Bookmark className={`h-4 w-4 ${saved ? "fill-current" : ""}`} />
      {saved ? t("promptDetail.savedButton") : t("promptDetail.saveButton")}
    </Button>
  );
}
