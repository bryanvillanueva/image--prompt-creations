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
import { useT } from "@/lib/i18n/I18nProvider";

const STATUSES = [
  { value: "", labelKey: "promptStatusFilter.all" },
  { value: "pending", labelKey: "promptStatusFilter.pending" },
  { value: "approved", labelKey: "promptStatusFilter.approved" },
  { value: "rejected", labelKey: "promptStatusFilter.rejected" },
  { value: "blocked", labelKey: "promptStatusFilter.blocked" },
  { value: "hidden", labelKey: "promptStatusFilter.hidden" },
] as const;

export default function MyPromptsPage() {
  const [status, setStatus] = useState<string>("");
  const { t } = useT();

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
              {t(s.labelKey)}
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
          title={t("me.promptsEmptyTitle")}
          description={t("me.promptsEmptyDescription")}
          action={
            <Link href="/prompts/new">
              <Button>{t("me.promptsEmptyAction")}</Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          {items.some((p) => p.status === "pending" || p.status === "blocked" || p.status === "rejected") && status === "" && (
            <p className="text-sm text-[var(--color-fg-muted)]">
              {t("me.promptsAttention")}
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
                    {t(`promptStatus.${p.status}`)}
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
