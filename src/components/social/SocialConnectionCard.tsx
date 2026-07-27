"use client";
import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CalendarDays, Facebook, Instagram, Link2, Unlink } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { PageSelectorDialog } from "./PageSelectorDialog";
import { useSocialConnection } from "./useSocialConnection";
import { socialApi } from "@/lib/api/social";
import { ApiError } from "@/lib/api/client";
import { qk } from "@/lib/queries/keys";
import { useT } from "@/lib/i18n/I18nProvider";

const ERROR_REASON_KEYS: Record<string, string> = {
  access_denied: "social.errorAccessDenied",
  no_code: "social.errorAccessDenied",
  no_pages: "social.errorNoPages",
  invalid_state: "social.errorInvalidState",
  exchange_failed: "social.errorExchangeFailed",
};

export function SocialConnectionCard({ brandId }: { brandId: number }) {
  const { t } = useT();
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const { connection, metaDisabled, isLoading } = useSocialConnection(brandId);
  const [selectorOpen, setSelectorOpen] = React.useState(false);
  const [disconnectOpen, setDisconnectOpen] = React.useState(false);

  // Consume the OAuth callback query params (?social_connect=...&brand_id=...)
  // that the backend appends when redirecting back, then clean the URL.
  const handledRef = React.useRef(false);
  React.useEffect(() => {
    if (handledRef.current) return;
    const params = new URLSearchParams(window.location.search);
    const result = params.get("social_connect");
    if (!result) return;
    handledRef.current = true;
    const paramBrandId = Number(params.get("brand_id"));
    if (paramBrandId === brandId) {
      if (result === "success") {
        toast.success(t("social.connectSuccess"));
        queryClient.invalidateQueries({ queryKey: qk.brands.social(brandId) });
      } else if (result === "select_page") {
        setSelectorOpen(true);
      } else if (result === "error") {
        const reason = params.get("reason") ?? "";
        toast.error(t(ERROR_REASON_KEYS[reason] ?? "social.errorExchangeFailed"));
      }
    }
    router.replace(pathname, { scroll: false });
  }, [brandId, pathname, queryClient, router, t]);

  const connectMutation = useMutation({
    mutationFn: () => socialApi.getConnectUrl(brandId),
    onSuccess: (res) => {
      // Full-page redirect (no popup); the auth_url expires in 15 min, so it is
      // requested on click, never preloaded.
      window.location.href = res.data.auth_url;
    },
    onError: (err) => {
      toast.error(err instanceof ApiError ? err.message : t("common.connectionError"));
    },
  });

  const disconnectMutation = useMutation({
    mutationFn: () => socialApi.disconnect(brandId),
    onSuccess: () => {
      queryClient.setQueryData(qk.brands.social(brandId), { data: null });
      toast.success(t("social.disconnected"));
      setDisconnectOpen(false);
    },
    onError: (err) => {
      toast.error(err instanceof ApiError ? err.message : t("common.connectionError"));
    },
  });

  if (metaDisabled) return null;

  const connectButton = (label: string) => (
    <Button
      size="sm"
      loading={connectMutation.isPending}
      onClick={() => connectMutation.mutate()}
    >
      <Link2 className="h-4 w-4" />
      {label}
    </Button>
  );

  return (
    <Card>
      <CardBody className="space-y-3">
        <div className="flex items-center gap-2">
          <Instagram className="h-4 w-4 text-[var(--color-fg-muted)]" />
          <h2 className="font-semibold">{t("social.title")}</h2>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-4">
            <Spinner className="text-[var(--color-fg-muted)]" />
          </div>
        ) : !connection ? (
          <>
            <p className="text-sm text-[var(--color-fg-muted)]">{t("social.notConnected")}</p>
            <p className="text-xs text-[var(--color-fg-muted)]">{t("social.requirement")}</p>
            {connectButton(t("social.connect"))}
          </>
        ) : connection.status === "expired" ? (
          <>
            <p className="rounded-md bg-[var(--color-warning-bg)] p-3 text-sm text-[var(--color-warning-fg)]">
              {t("social.expiredBanner")}
            </p>
            {connectButton(t("social.reconnect"))}
          </>
        ) : connection.status === "pending_page" ? (
          <>
            <p className="text-sm text-[var(--color-fg-muted)]">{t("social.pendingPage")}</p>
            <Button size="sm" onClick={() => setSelectorOpen(true)}>
              {t("social.choosePage")}
            </Button>
          </>
        ) : (
          <>
            <div className="space-y-1.5 text-sm">
              <div className="flex items-center gap-2">
                <Facebook className="h-4 w-4 shrink-0 text-[var(--color-fg-muted)]" />
                <span className="truncate font-medium">{connection.page_name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Instagram className="h-4 w-4 shrink-0 text-[var(--color-fg-muted)]" />
                {connection.ig_username ? (
                  <span className="truncate">@{connection.ig_username}</span>
                ) : (
                  <span className="text-[var(--color-fg-muted)]">{t("social.pageNoInstagram")}</span>
                )}
              </div>
            </div>
            {!connection.ig_user_id && (
              <p className="rounded-md bg-[var(--color-warning-bg)] p-3 text-xs text-[var(--color-warning-fg)]">
                {t("social.noInstagramHint")}
              </p>
            )}
            <div className="flex flex-wrap items-center gap-2">
              <Link href={`/brands/${brandId}/posts`}>
                <Button size="sm" variant="secondary">
                  <CalendarDays className="h-4 w-4" />
                  {t("social.viewPosts")}
                </Button>
              </Link>
              <Button size="sm" variant="ghost" onClick={() => setDisconnectOpen(true)}>
                <Unlink className="h-4 w-4" />
                {t("social.disconnect")}
              </Button>
            </div>
          </>
        )}
      </CardBody>

      <PageSelectorDialog brandId={brandId} open={selectorOpen} onOpenChange={setSelectorOpen} />

      <Dialog open={disconnectOpen} onOpenChange={setDisconnectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("social.disconnectTitle")}</DialogTitle>
            <DialogDescription>{t("social.disconnectDescription")}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setDisconnectOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button
              variant="danger"
              loading={disconnectMutation.isPending}
              onClick={() => disconnectMutation.mutate()}
            >
              {t("social.disconnect")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
