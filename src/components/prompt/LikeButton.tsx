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

export function LikeButton({ prompt }: { prompt: Prompt }) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const qc = useQueryClient();
  const [liked, setLiked] = React.useState(false);
  const [count, setCount] = React.useState(prompt.likes_count);

  React.useEffect(() => setCount(prompt.likes_count), [prompt.likes_count]);

  const mutation = useMutation({
    mutationFn: () => (liked ? promptsApi.unlike(prompt.id) : promptsApi.like(prompt.id)),
    onMutate: async () => {
      const willLike = !liked;
      setLiked(willLike);
      setCount((c) => c + (willLike ? 1 : -1));
      qc.setQueryData(qk.prompts.bySlug(prompt.slug), (old: { data: Prompt } | undefined) =>
        old
          ? { ...old, data: { ...old.data, likes_count: old.data.likes_count + (willLike ? 1 : -1) } }
          : old,
      );
      return { willLike };
    },
    onError: (err, _vars, ctx) => {
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
        mutation.mutate();
      }}
    >
      <Heart className={`h-4 w-4 ${liked ? "fill-current text-[var(--color-danger-fg)]" : ""}`} />
      {formatNumber(count)}
    </Button>
  );
}
