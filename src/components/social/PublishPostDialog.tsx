"use client";
import * as React from "react";
import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ChevronDown, Facebook, Images, Instagram, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
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
import { useSocialConnection } from "./useSocialConnection";
import { CaptionAssistant, type CaptionTarget } from "./CaptionAssistant";
import { socialApi } from "@/lib/api/social";
import { ApiError } from "@/lib/api/client";
import { CAPTION_MAX } from "@/lib/constants";
import { formatDateTime, localInputToIso } from "@/lib/format";
import type { CaptionSource, CaptionSuggestion, SocialPlatform } from "@/lib/types";
import { cn } from "@/lib/cn";
import { useT } from "@/lib/i18n/I18nProvider";

interface PublishPostDialogProps {
  brandId: number;
  /** Content source: a completed generation of this brand… */
  generationId?: number;
  /** …a completed carousel… */
  carouselId?: number;
  /** …or any public https image URL. Exactly one of the three is required. */
  imageUrl?: string;
  /** Preview shown in the dialog (the cover for carousels). */
  previewUrl: string;
  /** Slide count, to label the carousel preview. */
  slideCount?: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function nowAsLocalInput(): string {
  const d = new Date(Date.now() + 5 * 60_000);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function PublishPostDialog({
  brandId,
  generationId,
  carouselId,
  imageUrl,
  previewUrl,
  slideCount,
  open,
  onOpenChange,
}: PublishPostDialogProps) {
  const { t } = useT();
  const queryClient = useQueryClient();
  const { connection, isLoading } = useSocialConnection(brandId, open);

  const [caption, setCaption] = React.useState("");
  const [platforms, setPlatforms] = React.useState<SocialPlatform[]>([]);
  const [schedule, setSchedule] = React.useState(false);
  const [scheduleAt, setScheduleAt] = React.useState("");
  /** Last suggestion applied from the assistant, to tell `agent` from `agent_edited`. */
  const [applied, setApplied] = React.useState<{ messageId: number; fullText: string } | null>(null);
  const [assistantOpen, setAssistantOpen] = React.useState(false);
  const defaultsSet = React.useRef(false);

  const hasIg = !!connection?.ig_user_id;
  const isActive = connection?.status === "active";

  React.useEffect(() => {
    if (!open) {
      defaultsSet.current = false;
      return;
    }
    if (defaultsSet.current || !isActive) return;
    defaultsSet.current = true;
    setPlatforms(hasIg ? ["instagram", "facebook"] : ["facebook"]);
    setSchedule(false);
    setScheduleAt("");
    setCaption("");
    setApplied(null);
    setAssistantOpen(false);
  }, [open, isActive, hasIg]);

  const togglePlatform = (p: SocialPlatform) =>
    setPlatforms((prev) => (prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]));

  const applySuggestion = (suggestion: CaptionSuggestion, messageId: number) => {
    setCaption(suggestion.full_text);
    setApplied({ messageId, fullText: suggestion.full_text });
  };

  // manual → never touched the assistant; agent → applied and left as-is; agent_edited → tweaked after.
  const captionSource: CaptionSource =
    !applied || !caption.trim()
      ? "manual"
      : caption.trim() === applied.fullText.trim()
        ? "agent"
        : "agent_edited";

  const publishMutation = useMutation({
    mutationFn: () =>
      socialApi.createPost(brandId, {
        ...(carouselId != null
          ? { carousel_id: carouselId }
          : generationId != null
            ? { generation_id: generationId }
            : { image_url: imageUrl }),
        caption: caption.trim() || undefined,
        platforms,
        publish_at: schedule && scheduleAt ? localInputToIso(scheduleAt) : undefined,
        caption_source: captionSource,
        ...(captionSource !== "manual" && applied
          ? { caption_message_id: applied.messageId }
          : {}),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brands", brandId, "posts"] });
      toast.success(
        schedule && scheduleAt
          ? t("social.postScheduled", { date: formatDateTime(new Date(scheduleAt)) })
          : t("social.postQueued"),
      );
      onOpenChange(false);
    },
    onError: (err) => {
      if (err instanceof ApiError && err.status === 409) {
        toast.error(err.message || t("social.needConnection"));
      } else {
        toast.error(err instanceof ApiError ? err.message : t("common.connectionError"));
      }
    },
  });

  const scheduleInvalid = schedule && (!scheduleAt || Number.isNaN(new Date(scheduleAt).getTime()));
  const canSubmit = isActive && platforms.length > 0 && !scheduleInvalid;
  // The assistant needs the generated content as context, so it's off for raw-URL posts.
  const assistantTarget: CaptionTarget | null =
    carouselId != null
      ? { type: "carousel", id: carouselId }
      : generationId != null
        ? { type: "generation", id: generationId }
        : null;
  const showAssistant = isActive && assistantTarget != null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn("max-h-[85vh] overflow-y-auto", showAssistant && "lg:max-w-3xl")}
      >
        <DialogHeader>
          <DialogTitle>{t("social.publishTitle")}</DialogTitle>
          <DialogDescription>{t("social.publishDescription")}</DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Spinner className="text-[var(--color-fg-muted)]" />
          </div>
        ) : !isActive ? (
          <div className="space-y-3">
            <p className="text-sm text-[var(--color-fg-muted)]">
              {connection?.status === "expired"
                ? t("social.expiredBanner")
                : t("social.needConnection")}
            </p>
            <Link href={`/brands/${brandId}`}>
              <Button size="sm" variant="secondary">
                {t("social.goConnect")}
              </Button>
            </Link>
          </div>
        ) : (
          <div
            className={cn(
              "grid gap-4",
              showAssistant && "lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start",
            )}
          >
            <div className="space-y-4">
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewUrl}
                  alt=""
                  className="max-h-56 w-full rounded-xl bg-[var(--color-bg-subtle)] object-contain"
                />
                {carouselId != null && slideCount != null && (
                  <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-xs text-white backdrop-blur-sm">
                    <Images className="h-3.5 w-3.5" />
                    {t("carousels.slidesCount", { count: slideCount })}
                  </span>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <Label htmlFor={`pub_caption_${brandId}`}>{t("social.captionLabel")}</Label>
                  <span
                    className={cn(
                      "text-xs",
                      caption.length > CAPTION_MAX
                        ? "text-[var(--color-danger-fg)]"
                        : "text-[var(--color-fg-muted)]",
                    )}
                  >
                    {caption.length}/{CAPTION_MAX}
                  </span>
                </div>
                <Textarea
                  id={`pub_caption_${brandId}`}
                  rows={4}
                  maxLength={CAPTION_MAX}
                  placeholder={t("social.captionPlaceholder")}
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                />
              </div>

              <div>
                <Label>{t("social.platformsLabel")}</Label>
                <div className="flex flex-col gap-2">
                  <label
                    className={cn(
                      "flex items-center gap-2 text-sm",
                      hasIg ? "cursor-pointer" : "cursor-not-allowed opacity-50",
                    )}
                  >
                    <input
                      type="checkbox"
                      className="h-4 w-4 accent-[var(--color-fg)]"
                      disabled={!hasIg}
                      checked={platforms.includes("instagram")}
                      onChange={() => togglePlatform("instagram")}
                    />
                    <Instagram className="h-4 w-4 text-[var(--color-fg-muted)]" />
                    Instagram
                    {hasIg ? (
                      <span className="text-xs text-[var(--color-fg-muted)]">
                        @{connection?.ig_username}
                      </span>
                    ) : (
                      <span className="text-xs text-[var(--color-fg-muted)]">
                        {t("social.igUnavailable")}
                      </span>
                    )}
                  </label>
                  <label className="flex cursor-pointer items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      className="h-4 w-4 accent-[var(--color-fg)]"
                      checked={platforms.includes("facebook")}
                      onChange={() => togglePlatform("facebook")}
                    />
                    <Facebook className="h-4 w-4 text-[var(--color-fg-muted)]" />
                    Facebook
                    <span className="text-xs text-[var(--color-fg-muted)]">
                      {connection?.page_name}
                    </span>
                  </label>
                </div>
                {platforms.length === 0 && (
                  <p className="mt-1 text-xs text-[var(--color-danger-fg)]">
                    {t("social.platformsRequired")}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="flex cursor-pointer items-center gap-2 text-sm select-none">
                  <input
                    type="checkbox"
                    className="h-4 w-4 accent-[var(--color-fg)]"
                    checked={schedule}
                    onChange={(e) => {
                      setSchedule(e.target.checked);
                      if (e.target.checked && !scheduleAt) setScheduleAt(nowAsLocalInput());
                    }}
                  />
                  {t("social.scheduleLabel")}
                </label>
                {schedule && (
                  <>
                    <Input
                      type="datetime-local"
                      value={scheduleAt}
                      min={nowAsLocalInput()}
                      onChange={(e) => setScheduleAt(e.target.value)}
                    />
                    <p className="text-xs text-[var(--color-fg-muted)]">{t("social.scheduleHint")}</p>
                  </>
                )}
              </div>

              <p className="text-xs text-[var(--color-fg-muted)]">{t("social.aiDisclosure")}</p>
            </div>

            {showAssistant && assistantTarget != null && (
              <div className="flex flex-col gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  className="justify-between lg:hidden"
                  aria-expanded={assistantOpen}
                  onClick={() => setAssistantOpen((v) => !v)}
                >
                  <span className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    {t("social.captionAssistant")}
                  </span>
                  <ChevronDown
                    className={cn("h-4 w-4 transition-transform", assistantOpen && "rotate-180")}
                  />
                </Button>
                {/* Kept mounted while collapsed so the thread is ready when opened. */}
                <div className={cn(assistantOpen ? "block" : "hidden", "lg:block")}>
                  <CaptionAssistant
                    brandId={brandId}
                    target={assistantTarget}
                    platforms={platforms}
                    currentCaption={caption}
                    appliedText={applied?.fullText ?? null}
                    onUse={applySuggestion}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {isActive && (
          <DialogFooter>
            <Button variant="secondary" onClick={() => onOpenChange(false)}>
              {t("common.cancel")}
            </Button>
            <Button
              disabled={!canSubmit}
              loading={publishMutation.isPending}
              onClick={() => publishMutation.mutate()}
            >
              {schedule ? t("social.submitSchedule") : t("social.submitPublish")}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
