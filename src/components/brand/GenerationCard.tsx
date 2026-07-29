"use client";
import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ChevronDown, ChevronUp, ImageOff, RefreshCw, Share2, ThumbsDown, ThumbsUp } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { Label } from "@/components/ui/Label";
import { Spinner } from "@/components/ui/Spinner";
import { Textarea } from "@/components/ui/Textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { GenerationImage } from "@/components/brand/GenerationImage";
import { GenerationProgress } from "@/components/brand/GenerationProgress";
import { PublishPostDialog } from "@/components/social/PublishPostDialog";
import { useSocialConnection } from "@/components/social/useSocialConnection";
import { brandsApi } from "@/lib/api/brands";
import { ApiError } from "@/lib/api/client";
import { qk } from "@/lib/queries/keys";
import {
  GENERATION_POLL_FAST_AFTER_MS,
  GENERATION_POLL_FAST_MS,
  GENERATION_POLL_MS,
  GENERATION_UI_TIMEOUT_MS,
} from "@/lib/constants";
import { formatRelativeDate } from "@/lib/format";
import type { BrandGeneration, FeedbackRating } from "@/lib/types";
import { cn } from "@/lib/cn";
import { useT } from "@/lib/i18n/I18nProvider";

interface GenerationCardProps {
  brandId: number;
  generation: BrandGeneration;
  /** Collapsed cards render as a compact thumbnail row until clicked. */
  defaultExpanded?: boolean;
  /** Brand primary colors, used to tint the in-progress placeholder. */
  accentColors?: string[] | null;
}

const isActiveStatus = (s: string) => s === "pending" || s === "processing";

const startedMs = (gen: BrandGeneration) => {
  const ts = Date.parse(gen.started_at ?? gen.created_at);
  return Number.isFinite(ts) ? ts : Date.now();
};

export function GenerationCard({
  brandId,
  generation,
  defaultExpanded = true,
  accentColors,
}: GenerationCardProps) {
  const { t } = useT();
  const queryClient = useQueryClient();
  // Active generations always start expanded so the user sees the progress.
  const [expanded, setExpanded] = React.useState(
    () => defaultExpanded || isActiveStatus(generation.status),
  );
  const [timedOut, setTimedOut] = React.useState(false);
  const [promptOpen, setPromptOpen] = React.useState(false);
  const [feedbackRating, setFeedbackRating] = React.useState<FeedbackRating | null>(null);
  const [feedbackComment, setFeedbackComment] = React.useState("");
  const [publishOpen, setPublishOpen] = React.useState(false);
  const { metaDisabled } = useSocialConnection(brandId);

  const { data } = useQuery({
    queryKey: qk.brands.generation(brandId, generation.id),
    queryFn: () => brandsApi.getGeneration(brandId, generation.id).then((r) => r.data),
    initialData: generation,
    enabled: isActiveStatus(generation.status) && !timedOut,
    // Poll faster once the job enters its usual completion window, so a finished
    // image doesn't sit on the server waiting for the next slow tick.
    refetchInterval: (query) => {
      const current = query.state.data;
      if (!current || !isActiveStatus(current.status)) return false;
      const elapsed = Date.now() - startedMs(current);
      return elapsed >= GENERATION_POLL_FAST_AFTER_MS ? GENERATION_POLL_FAST_MS : GENERATION_POLL_MS;
    },
  });

  const gen = data ?? generation;
  const isActive = isActiveStatus(gen.status);

  const invalidateHistory = React.useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["brands", brandId, "generations"] });
  }, [queryClient, brandId]);

  // Refresh the history list once the job settles so pagination/status stay in sync.
  const prevStatus = React.useRef(gen.status);
  React.useEffect(() => {
    if (prevStatus.current !== gen.status) {
      prevStatus.current = gen.status;
      if (!isActiveStatus(gen.status)) invalidateHistory();
    }
  }, [gen.status, invalidateHistory]);

  React.useEffect(() => {
    if (!isActive) return;
    const timer = setTimeout(() => setTimedOut(true), GENERATION_UI_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [isActive, timedOut]);

  const feedbackMutation = useMutation({
    mutationFn: (input: { rating: FeedbackRating; comment?: string }) =>
      brandsApi.sendFeedback(brandId, gen.id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.brands.generation(brandId, gen.id) });
      invalidateHistory();
      toast.success(t("brands.feedbackSent"));
      setFeedbackRating(null);
      setFeedbackComment("");
    },
    onError: (err) => {
      toast.error(err instanceof ApiError ? err.message : t("common.connectionError"));
    },
  });

  const retryMutation = useMutation({
    mutationFn: () => brandsApi.retryGeneration(brandId, gen.id),
    onSuccess: () => {
      setTimedOut(false);
      queryClient.invalidateQueries({ queryKey: qk.brands.generation(brandId, gen.id) });
      invalidateHistory();
      toast.success(t("brands.retryQueued"));
    },
    onError: (err) => {
      if (err instanceof ApiError && err.status === 429) toast.error(t("brands.dailyLimit"));
      else toast.error(err instanceof ApiError ? err.message : t("common.connectionError"));
    },
  });

  const statusBadge =
    gen.status === "completed" ? (
      <Badge variant="success">{t("brands.status.completed")}</Badge>
    ) : gen.status === "failed" ? (
      <Badge variant="danger">{t("brands.status.failed")}</Badge>
    ) : (
      <Badge variant="warning">{t(`brands.status.${gen.status}`)}</Badge>
    );

  if (!expanded) {
    return (
      <Card>
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="flex w-full items-center gap-3 p-3 text-left transition-colors hover:bg-[var(--color-bg-subtle)]"
        >
          {gen.status === "completed" && gen.image_url ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={gen.image_url}
              alt=""
              loading="lazy"
              className="h-12 w-12 shrink-0 rounded-lg bg-[var(--color-bg-subtle)] object-cover"
            />
          ) : (
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[var(--color-bg-subtle)]">
              {isActive ? (
                <Spinner className="h-4 w-4 text-[var(--color-fg-muted)]" />
              ) : (
                <ImageOff className="h-4 w-4 text-[var(--color-fg-muted)]" />
              )}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm">{gen.instruction}</p>
            <p className="text-xs text-[var(--color-fg-muted)]">
              {gen.aspect_ratio} · {formatRelativeDate(gen.created_at)}
            </p>
          </div>
          {statusBadge}
          <ChevronDown className="h-4 w-4 shrink-0 text-[var(--color-fg-muted)]" />
        </button>
      </Card>
    );
  }

  return (
    <Card>
      <CardBody className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs text-[var(--color-fg-muted)]">
            {statusBadge}
            <span>{gen.aspect_ratio}</span>
            <span>·</span>
            <span>{formatRelativeDate(gen.created_at)}</span>
          </div>
          <div className="flex items-center gap-1">
            {gen.status === "failed" && (
              <Button size="sm" variant="secondary" loading={retryMutation.isPending} onClick={() => retryMutation.mutate()}>
                <RefreshCw className="h-4 w-4" />
                {t("common.retry")}
              </Button>
            )}
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8"
              aria-label={t("common.collapse")}
              onClick={() => setExpanded(false)}
            >
              <ChevronUp className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <p className="text-sm whitespace-pre-wrap">{gen.instruction}</p>

        {isActive && (
          <>
            <GenerationProgress
              aspectRatio={gen.aspect_ratio}
              startedAt={gen.started_at ?? gen.created_at}
              accentColors={accentColors}
              slow={timedOut}
            />
            {timedOut && (
              <div className="flex justify-center">
                <Button size="sm" variant="secondary" onClick={() => setTimedOut(false)}>
                  {t("brands.keepWaiting")}
                </Button>
              </div>
            )}
          </>
        )}

        {gen.status === "failed" && gen.error_message && (
          <div className="rounded-md bg-[var(--color-danger-bg)] p-3 text-sm text-[var(--color-danger-fg)]">
            {gen.error_message}
          </div>
        )}

        {gen.status === "completed" && gen.image_url && (
          <>
            <GenerationImage
              src={gen.image_url}
              alt={gen.instruction.slice(0, 120)}
              aspectRatio={gen.aspect_ratio}
            />

            {gen.agent_notes && (
              <div className="rounded-md bg-[var(--color-bg-subtle)] p-3 text-sm text-[var(--color-fg-muted)]">
                <span className="font-medium text-[var(--color-fg)]">{t("brands.agentNotes")}: </span>
                {gen.agent_notes}
              </div>
            )}

            {gen.composed_prompt && (
              <div>
                <button
                  type="button"
                  onClick={() => setPromptOpen((v) => !v)}
                  className="inline-flex items-center gap-1 text-xs font-medium text-[var(--color-fg-muted)] hover:text-[var(--color-fg)]"
                >
                  <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", promptOpen && "rotate-180")} />
                  {t("brands.composedPrompt")}
                </button>
                {promptOpen && (
                  <pre className="mt-2 whitespace-pre-wrap rounded-md bg-[var(--color-bg-subtle)] p-3 text-xs font-mono">
                    {gen.composed_prompt}
                  </pre>
                )}
              </div>
            )}

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant={gen.feedback_rating === "like" ? "primary" : "secondary"}
                onClick={() => { setFeedbackRating("like"); setFeedbackComment(gen.feedback_comment ?? ""); }}
              >
                <ThumbsUp className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant={gen.feedback_rating === "dislike" ? "primary" : "secondary"}
                onClick={() => { setFeedbackRating("dislike"); setFeedbackComment(gen.feedback_comment ?? ""); }}
              >
                <ThumbsDown className="h-4 w-4" />
              </Button>
              {gen.feedback_rating && (
                <span className="text-xs text-[var(--color-fg-muted)]">{t("brands.feedbackRecorded")}</span>
              )}
              {!metaDisabled && (
                <Button size="sm" variant="secondary" className="ml-auto" onClick={() => setPublishOpen(true)}>
                  <Share2 className="h-4 w-4" />
                  {t("social.publishAction")}
                </Button>
              )}
            </div>

            {!metaDisabled && (
              <PublishPostDialog
                brandId={brandId}
                generationId={gen.id}
                previewUrl={gen.image_url}
                open={publishOpen}
                onOpenChange={setPublishOpen}
              />
            )}
          </>
        )}
      </CardBody>

      <Dialog open={!!feedbackRating} onOpenChange={(open) => !open && setFeedbackRating(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {feedbackRating === "like" ? t("brands.feedbackLikeTitle") : t("brands.feedbackDislikeTitle")}
            </DialogTitle>
            <DialogDescription>{t("brands.feedbackDescription")}</DialogDescription>
          </DialogHeader>
          <div>
            <Label htmlFor={`fb_comment_${gen.id}`}>{t("brands.feedbackCommentLabel")}</Label>
            <Textarea
              id={`fb_comment_${gen.id}`}
              rows={3}
              maxLength={1000}
              placeholder={t("brands.feedbackCommentPlaceholder")}
              value={feedbackComment}
              onChange={(e) => setFeedbackComment(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setFeedbackRating(null)}>
              {t("common.cancel")}
            </Button>
            <Button
              loading={feedbackMutation.isPending}
              onClick={() =>
                feedbackRating &&
                feedbackMutation.mutate({
                  rating: feedbackRating,
                  comment: feedbackComment.trim() || undefined,
                })
              }
            >
              {t("common.send")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
