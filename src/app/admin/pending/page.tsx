"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { Spinner } from "@/components/ui/Spinner";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";
import { PromptModerationCard } from "@/components/admin/PromptModerationCard";
import { adminApi } from "@/lib/api/admin";
import { qk } from "@/lib/queries/keys";
import type { PromptStatus } from "@/lib/types";

const TABS: { value: "all" | PromptStatus; label: string }[] = [
  { value: "all", label: "Pendientes + bloqueados" },
  { value: "pending", label: "Pendientes" },
  { value: "blocked", label: "Bloqueados" },
  { value: "approved", label: "Aprobados" },
  { value: "rejected", label: "Rechazados" },
  { value: "hidden", label: "Ocultos" },
];

export default function PendingPage() {
  const [tab, setTab] = useState<"all" | PromptStatus>("all");

  const status = tab === "all" ? undefined : tab;
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: qk.admin.pending({ status }),
    queryFn: () => adminApi.promptsPending({ status, limit: 30 }),
  });
  const items = data?.data ?? [];

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-h2">Cola de revisión</h2>
        <p className="text-body text-[var(--color-fg-muted)]">Aprueba, rechaza, bloquea u oculta contenido.</p>
      </div>
      <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
        <TabsList>
          {TABS.map((t) => (
            <TabsTrigger key={t.value} value={t.value}>{t.label}</TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      {isLoading ? (
        <div className="flex justify-center py-24"><Spinner className="text-[var(--color-fg-muted)]" /></div>
      ) : error ? (
        <ErrorState onRetry={() => refetch()} />
      ) : items.length === 0 ? (
        <EmptyState title="Cola vacía" description="No hay prompts en este estado." />
      ) : (
        <div className="space-y-4">
          {items.map((p) => <PromptModerationCard key={p.id} prompt={p} />)}
        </div>
      )}
    </div>
  );
}
