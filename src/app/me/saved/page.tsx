"use client";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Button } from "@/components/ui/Button";
import { MasonryGrid } from "@/components/gallery/MasonryGrid";
import { PromptCard } from "@/components/gallery/PromptCard";
import { meApi } from "@/lib/api/prompts";
import { qk } from "@/lib/queries/keys";

export default function SavedPage() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: qk.me.saved,
    queryFn: () => meApi.saved({ limit: 60 }),
  });

  const items = data?.data ?? [];

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner className="text-[var(--color-fg-muted)]" />
      </div>
    );
  }
  if (error) return <ErrorState onRetry={() => refetch()} />;
  if (items.length === 0) {
    return (
      <EmptyState
        title="Sin prompts guardados"
        description="Guarda prompts que te inspiren para encontrarlos rápido aquí."
        action={
          <Link href="/">
            <Button>Explorar prompts</Button>
          </Link>
        }
      />
    );
  }
  return (
    <MasonryGrid>
      {items.map((p) => (
        <PromptCard key={p.id} prompt={p} />
      ))}
    </MasonryGrid>
  );
}
