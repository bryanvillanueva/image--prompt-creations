"use client";
import * as React from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Check, Facebook, Instagram, RefreshCw, X } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
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
import { socialApi } from "@/lib/api/social";
import { ApiError } from "@/lib/api/client";
import { qk } from "@/lib/queries/keys";
import { POST_POLL_MS, POST_UI_TIMEOUT_MS } from "@/lib/constants";
import { formatDateTime, parseServerUtc } from "@/lib/format";
import type { ScheduledPost, SocialPlatform } from "@/lib/types";
import { useT } from "@/lib/i18n/I18nProvider";

interface PostCardProps {
  brandId: number;
  post: ScheduledPost;
}

// A post needs live polling while Meta is processing it: `publishing`, or
// `pending` with no future publish_at (immediate posts / scheduled ones whose
// time already arrived).
function isProcessing(post: ScheduledPost): boolean {
  if (post.status === "publishing") return true;
  if (post.status !== "pending") return false;
  if (!post.publish_at) return true;
  return parseServerUtc(post.publish_at).getTime() <= Date.now();
}

const PLATFORM_ICONS: Record<SocialPlatform, React.ComponentType<{ className?: string }>> = {
  instagram: Instagram,
  facebook: Facebook,
};

export function PostCard({ brandId, post: initialPost }: PostCardProps) {
  const { t } = useT();
  const queryClient = useQueryClient();
  const [timedOut, setTimedOut] = React.useState(false);
  const [cancelOpen, setCancelOpen] = React.useState(false);

  const { data } = useQuery({
    queryKey: qk.brands.post(brandId, initialPost.id),
    queryFn: () => socialApi.getPost(brandId, initialPost.id).then((r) => r.data),
    initialData: initialPost,
    enabled: isProcessing(initialPost) && !timedOut,
    refetchInterval: (query) =>
      query.state.data && isProcessing(query.state.data) ? POST_POLL_MS : false,
  });

  const post = data ?? initialPost;
  const processing = isProcessing(post);

  const invalidateList = React.useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["brands", brandId, "posts"] });
  }, [queryClient, brandId]);

  const prevStatus = React.useRef(post.status);
  React.useEffect(() => {
    if (prevStatus.current !== post.status) {
      prevStatus.current = post.status;
      if (!isProcessing(post)) invalidateList();
    }
  }, [post, invalidateList]);

  React.useEffect(() => {
    if (!processing) return;
    const timer = setTimeout(() => setTimedOut(true), POST_UI_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [processing, timedOut]);

  const cancelMutation = useMutation({
    mutationFn: () => socialApi.cancelPost(brandId, post.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.brands.post(brandId, post.id) });
      invalidateList();
      toast.success(t("social.postCancelled"));
      setCancelOpen(false);
    },
    onError: (err) => {
      toast.error(err instanceof ApiError ? err.message : t("common.connectionError"));
    },
  });

  const retryMutation = useMutation({
    mutationFn: () => socialApi.retryPost(brandId, post.id),
    onSuccess: () => {
      setTimedOut(false);
      queryClient.invalidateQueries({ queryKey: qk.brands.post(brandId, post.id) });
      invalidateList();
      toast.success(t("social.retryQueued"));
    },
    onError: (err) => {
      toast.error(err instanceof ApiError ? err.message : t("common.connectionError"));
    },
  });

  const statusBadge =
    post.status === "published" ? (
      <Badge variant="success">{t("social.status.published")}</Badge>
    ) : post.status === "failed" ? (
      <Badge variant="danger">{t("social.status.failed")}</Badge>
    ) : post.status === "partial" ? (
      <Badge variant="warning">{t("social.status.partial")}</Badge>
    ) : post.status === "cancelled" ? (
      <Badge variant="neutral">{t("social.status.cancelled")}</Badge>
    ) : (
      <Badge variant="warning">
        {processing ? t("social.status.publishing") : t("social.status.pending")}
      </Badge>
    );

  const canCancel = post.status === "pending" && !processing;
  const canRetry = post.status === "failed" || post.status === "partial";
  const tokenError = !!post.error_message && post.error_message.includes("#190");

  return (
    <Card>
      <CardBody className="flex gap-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={post.image_url}
          alt=""
          className="h-20 w-20 shrink-0 rounded-lg bg-[var(--color-bg-subtle)] object-cover"
        />

        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            {statusBadge}
            {processing && !timedOut && <Spinner className="h-3.5 w-3.5 text-[var(--color-fg-muted)]" />}
            <span className="text-xs text-[var(--color-fg-muted)]">
              {post.status === "published" && post.published_at
                ? t("social.publishedAt", { date: formatDateTime(post.published_at) })
                : post.status === "pending" && post.publish_at && !processing
                  ? t("social.scheduledFor", { date: formatDateTime(post.publish_at) })
                  : formatDateTime(post.created_at)}
            </span>
          </div>

          {post.caption && (
            <p className="line-clamp-2 text-sm text-[var(--color-fg)]">{post.caption}</p>
          )}

          <div className="flex flex-wrap items-center gap-2">
            {post.platforms.map((p) => {
              const Icon = PLATFORM_ICONS[p];
              const result = post.results?.[p];
              return (
                <span
                  key={p}
                  className="inline-flex items-center gap-1 rounded-full bg-[var(--color-bg-subtle)] px-2 py-0.5 text-xs"
                  title={result && !result.ok ? result.error : undefined}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {p === "instagram" ? "Instagram" : "Facebook"}
                  {result &&
                    (result.ok ? (
                      <Check className="h-3.5 w-3.5 text-[var(--color-success-fg)]" />
                    ) : (
                      <X className="h-3.5 w-3.5 text-[var(--color-danger-fg)]" />
                    ))}
                </span>
              );
            })}
          </div>

          {timedOut && processing && (
            <p className="text-xs text-[var(--color-fg-muted)]">{t("social.processingSlow")}</p>
          )}

          {(post.status === "failed" || post.status === "partial") && post.error_message && (
            <div className="rounded-md bg-[var(--color-danger-bg)] p-2 text-xs text-[var(--color-danger-fg)]">
              {post.error_message}
              {tokenError && (
                <>
                  {" "}
                  <Link href={`/brands/${brandId}`} className="font-medium underline">
                    {t("social.reconnectHint")}
                  </Link>
                </>
              )}
            </div>
          )}

          {(canCancel || canRetry) && (
            <div className="flex items-center gap-2 pt-1">
              {canCancel && (
                <Button size="sm" variant="secondary" onClick={() => setCancelOpen(true)}>
                  {t("common.cancel")}
                </Button>
              )}
              {canRetry && (
                <Button
                  size="sm"
                  variant="secondary"
                  loading={retryMutation.isPending}
                  onClick={() => retryMutation.mutate()}
                >
                  <RefreshCw className="h-4 w-4" />
                  {t("common.retry")}
                </Button>
              )}
            </div>
          )}
        </div>
      </CardBody>

      <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("social.cancelTitle")}</DialogTitle>
            <DialogDescription>{t("social.cancelDescription")}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setCancelOpen(false)}>
              {t("common.back")}
            </Button>
            <Button
              variant="danger"
              loading={cancelMutation.isPending}
              onClick={() => cancelMutation.mutate()}
            >
              {t("social.cancelConfirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
