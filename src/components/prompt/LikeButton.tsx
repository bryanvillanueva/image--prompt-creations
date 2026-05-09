"use client";
import * as React from "react";
import { Heart } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { promptsApi } from "@/lib/api/prompts";
import { ApiError } from "@/lib/api/client";
import { qk } from "@/lib/queries/keys";
import { useAuth } from "@/lib/auth/AuthContext";
import { formatNumber } from "@/lib/format";
import type { Prompt } from "@/lib/types";

type LikeAction = "like" | "unlike";

export function LikeButton({ prompt }: { prompt: Prompt }) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const qc = useQueryClient();
  const [liked, setLiked] = React.useState(prompt.is_liked ?? false);
  const [count, setCount] = React.useState(prompt.likes_count);

  React.useEffect(() => setCount(prompt.likes_count), [prompt.likes_count]);
  React.useEffect(() => {
    if (typeof prompt.is_liked === "boolean") setLiked(prompt.is_liked);
  }, [prompt.is_liked]);

  const syncFromServer = (likesCount: number) => {
    setCount(likesCount);
    qc.setQueryData(qk.prompts.bySlug(prompt.slug), (old: { data: Prompt } | undefined) =>
      old ? { ...old, data: { ...old.data, likes_count: likesCount } } : old,
    );
  };

  const mutation = useMutation({
    mutationFn: (action: LikeAction) =>
      action === "like" ? promptsApi.like(prompt.id) : promptsApi.unlike(prompt.id),
    onMutate: (action: LikeAction) => {
      const willLike = action === "like";
      setLiked(willLike);
      setCount((c) => c + (willLike ? 1 : -1));
      qc.setQueryData(qk.prompts.bySlug(prompt.slug), (old: { data: Prompt } | undefined) =>
        old
          ? { ...old, data: { ...old.data, likes_count: old.data.likes_count + (willLike ? 1 : -1) } }
          : old,
      );
      return { willLike };
    },
    onSuccess: (res, _action, ctx) => {
      if (!res?.data?.ok) {
        if (ctx?.willLike) {
          setLiked(false);
          setCount((c) => c - 1);
        } else {
          setLiked(true);
          setCount((c) => c + 1);
        }
        toast.error("No se pudo aplicar el cambio en el servidor");
        return;
      }
      if (typeof res.data.likes_count === "number") {
        syncFromServer(res.data.likes_count);
      }
    },
    onError: (err, _action, ctx) => {
      if (ctx?.willLike) {
        setLiked(false);
        setCount((c) => c - 1);
      } else {
        setLiked(true);
        setCount((c) => c + 1);
      }
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
        mutation.mutate(liked ? "unlike" : "like");
      }}
    >
      <Heart className={`h-4 w-4 ${liked ? "fill-current text-[var(--color-danger-fg)]" : ""}`} />
      {formatNumber(count)}
    </Button>
  );
}
