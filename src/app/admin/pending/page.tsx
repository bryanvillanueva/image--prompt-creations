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
import { useT } from "@/lib/i18n/I18nProvider";

const TABS: { value: "all" | PromptStatus; labelKey: string }[] = [
  { value: "all", labelKey: "admin.tabAll" },
  { value: "pending", labelKey: "admin.tabPending" },
  { value: "blocked", labelKey: "admin.tabBlocked" },
  { value: "approved", labelKey: "admin.tabApproved" },
  { value: "rejected", labelKey: "admin.tabRejected" },
  { value: "hidden", labelKey: "admin.tabHidden" },
];

export default function PendingPage() {
  const [tab, setTab] = useState<"all" | PromptStatus>("all");
  const { t } = useT();

  const status = tab === "all" ? undefined : tab;
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: qk.admin.pending({ status }),
    queryFn: () => adminApi.promptsPending({ status, limit: 30 }),
  });
  const items = data?.data ?? [];

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-h2">{t("admin.pendingTitle")}</h2>
        <p className="text-body text-[var(--color-fg-muted)]">{t("admin.pendingLead")}</p>
      </div>
      <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
        <TabsList>
          {TABS.map((tg) => (
            <TabsTrigger key={tg.value} value={tg.value}>{t(tg.labelKey)}</TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      {isLoading ? (
        <div className="flex justify-center py-24"><Spinner className="text-[var(--color-fg-muted)]" /></div>
      ) : error ? (
        <ErrorState onRetry={() => refetch()} />
      ) : items.length === 0 ? (
        <EmptyState title={t("admin.queueEmptyTitle")} description={t("admin.queueEmptyDescription")} />
      ) : (
        <div className="space-y-4">
          {items.map((p) => <PromptModerationCard key={p.id} prompt={p} />)}
        </div>
      )}
    </div>
  );
}
