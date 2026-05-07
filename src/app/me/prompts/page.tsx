"use client";
import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Button } from "@/components/ui/Button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { Badge } from "@/components/ui/Badge";
import { MasonryGrid } from "@/components/gallery/MasonryGrid";
import { PromptCard } from "@/components/gallery/PromptCard";
import { ModerationBanner } from "@/components/prompt/ModerationBanner";
import { meApi } from "@/lib/api/prompts";
import { qk } from "@/lib/queries/keys";

const STATUSES = [
  { value: "", label: "Todos" },
  { value: "pending", label: "Pendientes" },
  { value: "approved", label: "Aprobados" },
  { value: "rejected", label: "Rechazados" },
  { value: "blocked", label: "Bloqueados" },
  { value: "hidden", label: "Ocultos" },
] as const;

export default function MyPromptsPage() {
  const [status, setStatus] = useState<string>("");

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: qk.me.prompts({ status: status || undefined }),
    queryFn: () => meApi.prompts({ status: status || undefined, limit: 60 }),
  });

  const items = data?.data ?? [];

  return (
    <div className="space-y-5">
      <Tabs value={status} onValueChange={setStatus}>
        <TabsList>
          {STATUSES.map((s) => (
            <TabsTrigger key={s.value || "all"} value={s.value}>
              {s.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {isLoading ? (
        <div className="flex justify-center py-24">
          <Spinner className="text-[var(--color-fg-muted)]" />
        </div>
      ) : error ? (
        <ErrorState onRetry={() => refetch()} />
      ) : items.length === 0 ? (
        <EmptyState
          title="No tienes prompts aún"
          description="Comparte tu primer prompt con la comunidad."
          action={
            <Link href="/prompts/new">
              <Button>Subir prompt</Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          {items.some((p) => p.status === "pending" || p.status === "blocked" || p.status === "rejected") && status === "" && (
            <p className="text-sm text-[var(--color-fg-muted)]">
              Algunos prompts requieren atención. Revisa los estados abajo.
            </p>
          )}
          <MasonryGrid>
            {items.map((p) => (
              <div key={p.id} className="space-y-2">
                <div className="relative">
                  <PromptCard prompt={p} />
                  <Badge
                    className="absolute top-3 left-3"
                    variant={
                      p.status === "approved" ? "success" :
                      p.status === "pending" ? "warning" :
                      p.status === "rejected" ? "danger" :
                      p.status === "blocked" ? "danger" :
                      "neutral"
                    }
                  >
                    {p.status}
                  </Badge>
                </div>
                {(p.status === "pending" || p.status === "blocked" || p.status === "rejected") && (
                  <ModerationBanner
                    status={p.status}
                    reason={p.moderation_reason}
                    rejectionReason={p.rejection_reason}
                  />
                )}
              </div>
            ))}
          </MasonryGrid>
        </div>
      )}
    </div>
  );
}
