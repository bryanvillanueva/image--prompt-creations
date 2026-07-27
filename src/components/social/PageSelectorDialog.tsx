"use client";
import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Facebook, Instagram } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/ErrorState";
import { Spinner } from "@/components/ui/Spinner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { socialApi } from "@/lib/api/social";
import { ApiError } from "@/lib/api/client";
import { qk } from "@/lib/queries/keys";
import { cn } from "@/lib/cn";
import { useT } from "@/lib/i18n/I18nProvider";

interface PageSelectorDialogProps {
  brandId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PageSelectorDialog({ brandId, open, onOpenChange }: PageSelectorDialogProps) {
  const { t } = useT();
  const queryClient = useQueryClient();

  const pagesQuery = useQuery({
    queryKey: qk.brands.socialPages(brandId),
    queryFn: () => socialApi.listPages(brandId),
    enabled: open,
    staleTime: 0,
  });

  const selectMutation = useMutation({
    mutationFn: (pageId: string) => socialApi.selectPage(brandId, pageId),
    onSuccess: (res) => {
      queryClient.setQueryData(qk.brands.social(brandId), res);
      toast.success(t("social.pageSelected"));
      onOpenChange(false);
    },
    onError: (err) => {
      toast.error(err instanceof ApiError ? err.message : t("common.connectionError"));
    },
  });

  // 502 = Meta rejected the stored token → the connection is effectively expired.
  const tokenExpired = pagesQuery.error instanceof ApiError && pagesQuery.error.status === 502;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("social.pageSelectorTitle")}</DialogTitle>
          <DialogDescription>{t("social.pageSelectorDescription")}</DialogDescription>
        </DialogHeader>

        {pagesQuery.isLoading ? (
          <div className="flex justify-center py-8">
            <Spinner className="text-[var(--color-fg-muted)]" />
          </div>
        ) : tokenExpired ? (
          <p className="rounded-md bg-[var(--color-warning-bg)] p-3 text-sm text-[var(--color-warning-fg)]">
            {t("social.expiredBanner")}
          </p>
        ) : pagesQuery.error ? (
          <ErrorState onRetry={() => pagesQuery.refetch()} />
        ) : (
          <div className="space-y-2">
            {(pagesQuery.data?.data ?? []).map((page) => (
              <button
                key={page.id}
                type="button"
                disabled={selectMutation.isPending}
                onClick={() => selectMutation.mutate(page.id)}
                className={cn(
                  "flex w-full items-center justify-between gap-3 rounded-lg p-3 text-left shadow-ring-light transition-colors",
                  "hover:bg-[var(--color-bg-subtle)] disabled:opacity-60",
                )}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 text-sm font-medium">
                    <Facebook className="h-4 w-4 shrink-0 text-[var(--color-fg-muted)]" />
                    <span className="truncate">{page.name}</span>
                  </div>
                  <div className="mt-0.5 flex items-center gap-1.5 text-xs text-[var(--color-fg-muted)]">
                    <Instagram className="h-3.5 w-3.5 shrink-0" />
                    {page.ig_username ? `@${page.ig_username}` : t("social.pageNoInstagram")}
                  </div>
                </div>
                {selectMutation.isPending && selectMutation.variables === page.id ? (
                  <Spinner className="h-4 w-4 shrink-0 text-[var(--color-fg-muted)]" />
                ) : (
                  <Button size="sm" variant="secondary" tabIndex={-1} className="pointer-events-none shrink-0">
                    {t("social.pageChoose")}
                  </Button>
                )}
              </button>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
