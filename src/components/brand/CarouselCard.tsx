"use client";
import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ImageOff,
  RefreshCw,
  Share2,
} from "lucide-react";
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
import { GenerationImage, generationBoxStyle } from "@/components/brand/GenerationImage";
import { PublishPostDialog } from "@/components/social/PublishPostDialog";
import { useSocialConnection } from "@/components/social/useSocialConnection";
import { carouselsApi } from "@/lib/api/carousels";
import { ApiError } from "@/lib/api/client";
import { qk } from "@/lib/queries/keys";
import { CAROUSEL_POLL_MS, CAROUSEL_UI_TIMEOUT_MS } from "@/lib/constants";
import { formatRelativeDate } from "@/lib/format";
import type { BrandCarousel, CarouselSlide, CarouselStatus } from "@/lib/types";
import { cn } from "@/lib/cn";
import { useT } from "@/lib/i18n/I18nProvider";

interface CarouselCardProps {
  brandId: number;
  /** List-endpoint header; slides arrive with the polled detail. */
  carousel: BrandCarousel;
  defaultExpanded?: boolean;
}

const isActiveStatus = (s: CarouselStatus) =>
  s === "pending" || s === "planning" || s === "generating";

const isFinalStatus = (s: CarouselStatus) => !isActiveStatus(s);

export function CarouselCard({ brandId, carousel: header, defaultExpanded = true }: CarouselCardProps) {
  const { t } = useT();
  const queryClient = useQueryClient();
  const [expanded, setExpanded] = React.useState(
    () => defaultExpanded || isActiveStatus(header.status),
  );
  const [timedOut, setTimedOut] = React.useState(false);
  const [activeSlide, setActiveSlide] = React.useState(0);
  const [confirmAnchorRetry, setConfirmAnchorRetry] = React.useState(false);
  const [publishOpen, setPublishOpen] = React.useState(false);
  const { metaDisabled } = useSocialConnection(brandId);

  // The list has no slides, so the expanded card always fetches the detail.
  // While the carousel is active it keeps polling; slides are painted as soon
  // as their image_url arrives (slide 1 first, the rest in parallel).
  const detailQuery = useQuery({
    queryKey: qk.brands.carousel(brandId, header.id),
    queryFn: () => carouselsApi.byId(brandId, header.id).then((r) => r.data),
    enabled: expanded && !timedOut,
    refetchInterval: (query) => {
      const current = query.state.data;
      return current && isActiveStatus(current.status) ? CAROUSEL_POLL_MS : false;
    },
  });

  const carousel = detailQuery.data ?? header;
  const isActive = isActiveStatus(carousel.status);
  const slides = React.useMemo(
    () => [...(carousel.slides ?? [])].sort((a, b) => a.position - b.position),
    [carousel.slides],
  );
  const completedCount = slides.filter((s) => s.status === "completed").length;

  const invalidateList = React.useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["brands", brandId, "carousels"] });
  }, [queryClient, brandId]);

  const prevStatus = React.useRef(carousel.status);
  React.useEffect(() => {
    if (prevStatus.current !== carousel.status) {
      prevStatus.current = carousel.status;
      if (isFinalStatus(carousel.status)) invalidateList();
    }
  }, [carousel.status, invalidateList]);

  React.useEffect(() => {
    if (!isActive || !expanded) return;
    const timer = setTimeout(() => setTimedOut(true), CAROUSEL_UI_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [isActive, expanded, timedOut]);

  const invalidateDetail = () => {
    queryClient.invalidateQueries({ queryKey: qk.brands.carousel(brandId, header.id) });
  };

  const retryError = (err: unknown) => {
    if (err instanceof ApiError && err.status === 429) toast.error(err.message);
    else if (err instanceof ApiError && err.status === 409) toast.error(t("carousels.retryConflict"));
    else toast.error(err instanceof ApiError ? err.message : t("common.connectionError"));
  };

  const retryMutation = useMutation({
    mutationFn: () => carouselsApi.retry(brandId, carousel.id),
    onSuccess: () => {
      setTimedOut(false);
      invalidateDetail();
      invalidateList();
      toast.success(t("carousels.retryQueued"));
    },
    onError: retryError,
  });

  const retrySlideMutation = useMutation({
    mutationFn: (position: number) => carouselsApi.retrySlide(brandId, carousel.id, position),
    onSuccess: (_res, position) => {
      setTimedOut(false);
      invalidateDetail();
      invalidateList();
      toast.success(t("carousels.retrySlideQueued", { position }));
    },
    onError: retryError,
  });

  const requestSlideRetry = (position: number) => {
    // Slide 1 anchors the style of the whole set: regenerating it can clash
    // with the rest, so it gets an extra confirmation.
    if (position === 1) setConfirmAnchorRetry(true);
    else retrySlideMutation.mutate(position);
  };

  const cover = slides.find((s) => s.position === 1 && s.image_url)?.image_url ?? null;

  const statusBadge =
    carousel.status === "completed" ? (
      <Badge variant="success">{t("carousels.status.completed")}</Badge>
    ) : carousel.status === "failed" ? (
      <Badge variant="danger">{t("carousels.status.failed")}</Badge>
    ) : carousel.status === "partial" ? (
      <Badge variant="warning">{t("carousels.status.partial")}</Badge>
    ) : (
      <Badge variant="warning">{t(`carousels.status.${carousel.status}`)}</Badge>
    );

  if (!expanded) {
    return (
      <Card>
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="flex w-full items-center gap-3 p-3 text-left transition-colors hover:bg-[var(--color-bg-subtle)]"
        >
          {cover ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={cover}
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
            <p className="truncate text-sm">{carousel.topic}</p>
            <p className="text-xs text-[var(--color-fg-muted)]">
              {t("carousels.slidesCount", { count: carousel.slide_count })} · {carousel.aspect_ratio} ·{" "}
              {formatRelativeDate(carousel.created_at)}
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
            <span>{t("carousels.slidesCount", { count: carousel.slide_count })}</span>
            <span>·</span>
            <span>{carousel.aspect_ratio}</span>
            <span>·</span>
            <span>{formatRelativeDate(carousel.created_at)}</span>
          </div>
          <div className="flex items-center gap-1">
            {(carousel.status === "partial" || carousel.status === "failed") && (
              <Button
                size="sm"
                variant="secondary"
                loading={retryMutation.isPending}
                onClick={() => retryMutation.mutate()}
              >
                <RefreshCw className="h-4 w-4" />
                {t("carousels.retryFailed")}
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

        <p className="text-sm whitespace-pre-wrap">{carousel.topic}</p>

        {detailQuery.isLoading && (
          <div className="flex justify-center py-10">
            <Spinner className="text-[var(--color-fg-muted)]" />
          </div>
        )}

        {isActive && !detailQuery.isLoading && (
          <ActiveProgress
            carousel={carousel}
            slides={slides}
            completedCount={completedCount}
            slow={timedOut}
            onKeepWaiting={() => setTimedOut(false)}
          />
        )}

        {carousel.status === "failed" && carousel.error_message && (
          <div className="rounded-md bg-[var(--color-danger-bg)] p-3 text-sm text-[var(--color-danger-fg)]">
            {carousel.error_message}
          </div>
        )}

        {isFinalStatus(carousel.status) && slides.length > 0 && (
          <SlideViewer
            slides={slides}
            aspectRatio={carousel.aspect_ratio}
            activeIndex={Math.min(activeSlide, slides.length - 1)}
            onSelect={setActiveSlide}
            retryPending={retrySlideMutation.isPending}
            onRetrySlide={requestSlideRetry}
          />
        )}

        {carousel.narrative && isFinalStatus(carousel.status) && (
          <div className="rounded-md bg-[var(--color-bg-subtle)] p-3 text-sm text-[var(--color-fg-muted)]">
            <span className="font-medium text-[var(--color-fg)]">{t("carousels.narrativeTitle")}: </span>
            {carousel.narrative}
          </div>
        )}

        {carousel.status === "completed" && !metaDisabled && cover && (
          <div className="flex justify-end">
            <Button size="sm" variant="secondary" onClick={() => setPublishOpen(true)}>
              <Share2 className="h-4 w-4" />
              {t("social.publishAction")}
            </Button>
          </div>
        )}

        {carousel.status === "completed" && !metaDisabled && cover && (
          <PublishPostDialog
            brandId={brandId}
            carouselId={carousel.id}
            previewUrl={cover}
            slideCount={carousel.slide_count}
            open={publishOpen}
            onOpenChange={setPublishOpen}
          />
        )}
      </CardBody>

      <Dialog open={confirmAnchorRetry} onOpenChange={setConfirmAnchorRetry}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("carousels.retryAnchorTitle")}</DialogTitle>
            <DialogDescription>{t("carousels.retryAnchorDescription")}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setConfirmAnchorRetry(false)}>
              {t("common.cancel")}
            </Button>
            <Button
              variant="danger"
              loading={retrySlideMutation.isPending}
              onClick={() => {
                setConfirmAnchorRetry(false);
                retrySlideMutation.mutate(1);
              }}
            >
              {t("carousels.retryAnchorConfirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

/**
 * In-flight view: status line + a slide grid that fills in incrementally as
 * each image lands, so the user sees progress instead of a spinner.
 */
function ActiveProgress({
  carousel,
  slides,
  completedCount,
  slow,
  onKeepWaiting,
}: {
  carousel: BrandCarousel;
  slides: CarouselSlide[];
  completedCount: number;
  slow: boolean;
  onKeepWaiting: () => void;
}) {
  const { t } = useT();

  const label =
    carousel.status === "pending"
      ? t("carousels.statusPendingHint")
      : carousel.status === "planning"
        ? t("carousels.statusPlanningHint")
        : t("carousels.slidesProgress", { done: completedCount, total: carousel.slide_count });

  const pct =
    carousel.status === "generating"
      ? Math.max(6, Math.round((completedCount / carousel.slide_count) * 100))
      : 4;

  return (
    <div className="space-y-3">
      <div>
        <div className="flex items-center gap-2">
          <Spinner className="h-3.5 w-3.5 text-[var(--color-fg-muted)]" />
          <p className="text-xs text-[var(--color-fg-muted)]">{slow ? t("carousels.slow") : label}</p>
        </div>
        <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-[var(--color-border)]">
          <div
            className="h-full rounded-full bg-[var(--color-fg)] transition-[width] duration-700 ease-out"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {slides.length > 0 && (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {slides.map((slide) => (
            <div
              key={slide.position}
              className="relative overflow-hidden rounded-lg bg-[var(--color-bg-subtle)]"
              style={generationBoxStyle(carousel.aspect_ratio)}
            >
              {slide.image_url ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={slide.image_url} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 p-2 text-center">
                  {slide.status === "processing" ? (
                    <Spinner className="h-4 w-4 text-[var(--color-fg-muted)]" />
                  ) : slide.status === "failed" ? (
                    <ImageOff className="h-4 w-4 text-[var(--color-danger-fg)]" />
                  ) : (
                    <span className="text-xs text-[var(--color-fg-muted)]">{slide.position}</span>
                  )}
                  {slide.headline && (
                    <span className="line-clamp-2 text-[10px] text-[var(--color-fg-muted)]">
                      {slide.headline}
                    </span>
                  )}
                </div>
              )}
              {slide.status === "processing" && !slide.image_url && (
                <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
                  <div className="animate-shimmer h-full w-full bg-gradient-to-r from-transparent via-white/60 to-transparent" />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {slow && (
        <div className="flex justify-center">
          <Button size="sm" variant="secondary" onClick={onKeepWaiting}>
            {t("brands.keepWaiting")}
          </Button>
        </div>
      )}
    </div>
  );
}

/** Navigable carousel for final states: main slide + thumbnail strip. */
function SlideViewer({
  slides,
  aspectRatio,
  activeIndex,
  onSelect,
  retryPending,
  onRetrySlide,
}: {
  slides: CarouselSlide[];
  aspectRatio: string;
  activeIndex: number;
  onSelect: (index: number) => void;
  retryPending: boolean;
  onRetrySlide: (position: number) => void;
}) {
  const { t } = useT();
  const slide = slides[activeIndex];
  if (!slide) return null;

  const prev = () => onSelect((activeIndex - 1 + slides.length) % slides.length);
  const next = () => onSelect((activeIndex + 1) % slides.length);

  return (
    <div className="space-y-2">
      <div className="relative">
        {slide.status === "completed" && slide.image_url ? (
          <GenerationImage
            src={slide.image_url}
            alt={slide.headline ?? t("carousels.slideLabel", { position: slide.position })}
            aspectRatio={aspectRatio}
          />
        ) : (
          <div
            className="mx-auto flex w-full flex-col items-center justify-center gap-2 rounded-xl bg-[var(--color-bg-subtle)] p-4 text-center"
            style={generationBoxStyle(aspectRatio)}
          >
            <ImageOff className="h-6 w-6 text-[var(--color-danger-fg)]" />
            <p className="text-sm text-[var(--color-danger-fg)]">
              {slide.error_message || t("carousels.slideFailed")}
            </p>
          </div>
        )}

        {slides.length > 1 && (
          <>
            <button
              type="button"
              onClick={prev}
              aria-label={t("carousels.prevSlide")}
              className="absolute left-2 top-1/2 -translate-y-1/2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-sm transition-colors hover:bg-black/75"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={next}
              aria-label={t("carousels.nextSlide")}
              className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-sm transition-colors hover:bg-black/75"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <span className="absolute bottom-2 right-2 rounded-full bg-black/55 px-2 py-0.5 text-xs text-white backdrop-blur-sm">
              {activeIndex + 1} / {slides.length}
            </span>
          </>
        )}
      </div>

      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-xs text-[var(--color-fg-muted)]">
            {t("carousels.slideLabel", { position: slide.position })}
            {slide.headline ? ` · ${slide.headline}` : ""}
          </p>
        </div>
        <Button
          size="sm"
          variant="secondary"
          loading={retryPending}
          onClick={() => onRetrySlide(slide.position)}
        >
          <RefreshCw className="h-3.5 w-3.5" />
          {t("carousels.retrySlide")}
        </Button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {slides.map((s, idx) => (
          <button
            key={s.position}
            type="button"
            onClick={() => onSelect(idx)}
            aria-label={t("carousels.slideLabel", { position: s.position })}
            aria-current={idx === activeIndex}
            className={cn(
              "relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-[var(--color-bg-subtle)] transition-shadow",
              idx === activeIndex ? "shadow-[var(--color-fg)_0_0_0_2px]" : "shadow-ring-light",
            )}
          >
            {s.image_url ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={s.image_url} alt="" loading="lazy" className="h-full w-full object-cover" />
            ) : (
              <span className="flex h-full w-full items-center justify-center">
                <ImageOff className="h-4 w-4 text-[var(--color-danger-fg)]" />
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
