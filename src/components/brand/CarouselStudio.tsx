"use client";
import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Check, GalleryHorizontalEnd, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { FieldError } from "@/components/ui/FieldError";
import { carouselsApi } from "@/lib/api/carousels";
import { ApiError } from "@/lib/api/client";
import { qk } from "@/lib/queries/keys";
import {
  CAROUSEL_ASPECT_RATIOS,
  CAROUSEL_DEFAULT_RATIO,
  CAROUSEL_DEFAULT_SLIDES,
  CAROUSEL_SLIDE_MAX,
  CAROUSEL_SLIDE_MIN,
  CAROUSEL_TOPIC_MAX,
  CAROUSEL_TOPIC_MIN,
  MAX_REFERENCE_ASSETS,
} from "@/lib/constants";
import type { Brand } from "@/lib/types";
import { cn } from "@/lib/cn";
import { useT } from "@/lib/i18n/I18nProvider";

/** "Let the agent decide" option for style/narrative selects. */
const AUTO = "";

interface CarouselStudioProps {
  brand: Brand;
}

export function CarouselStudio({ brand }: CarouselStudioProps) {
  const { t } = useT();
  const queryClient = useQueryClient();

  const presetsQuery = useQuery({
    queryKey: qk.brands.carouselPresets,
    queryFn: () => carouselsApi.getPresets().then((r) => r.data),
    staleTime: Infinity,
  });
  const presets = presetsQuery.data;

  const slideMin = presets?.slide_count.min ?? CAROUSEL_SLIDE_MIN;
  const slideMax = presets?.slide_count.max ?? CAROUSEL_SLIDE_MAX;
  const ratios = presets?.aspect_ratios ?? CAROUSEL_ASPECT_RATIOS;

  const [topic, setTopic] = React.useState("");
  const [slideCount, setSlideCount] = React.useState(CAROUSEL_DEFAULT_SLIDES);
  const [stylePreset, setStylePreset] = React.useState(AUTO);
  const [narrativePreset, setNarrativePreset] = React.useState(AUTO);
  const [ratio, setRatio] = React.useState(CAROUSEL_DEFAULT_RATIO);
  const [useLogo, setUseLogo] = React.useState(true);
  const [referenceIds, setReferenceIds] = React.useState<number[]>([]);
  const [error, setError] = React.useState<string | null>(null);

  // Keep the chosen count inside the backend's bounds once the catalog loads.
  React.useEffect(() => {
    setSlideCount((c) => Math.min(Math.max(c, slideMin), slideMax));
  }, [slideMin, slideMax]);

  const assets = brand.assets ?? [];
  const hasLogo = assets.some((a) => a.asset_type === "logo" || a.asset_type === "logo_variant");

  const selectedStyle = presets?.styles.find((s) => s.id === stylePreset);
  const selectedNarrative = presets?.narratives.find((n) => n.id === narrativePreset);

  const toggleReference = (assetId: number) => {
    setReferenceIds((prev) =>
      prev.includes(assetId)
        ? prev.filter((id) => id !== assetId)
        : prev.length < MAX_REFERENCE_ASSETS
          ? [...prev, assetId]
          : prev,
    );
  };

  const mutation = useMutation({
    mutationFn: () =>
      carouselsApi.create(brand.id, {
        topic: topic.trim(),
        slide_count: slideCount,
        aspect_ratio: ratio,
        ...(stylePreset !== AUTO ? { style_preset: stylePreset } : {}),
        ...(narrativePreset !== AUTO ? { narrative_preset: narrativePreset } : {}),
        use_logo: hasLogo ? useLogo : false,
        reference_asset_ids: referenceIds.length ? referenceIds : undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brands", brand.id, "carousels"] });
      toast.success(t("carousels.queued"));
      setTopic("");
      setReferenceIds([]);
      setError(null);
    },
    onError: (err) => {
      if (err instanceof ApiError) {
        if (err.status === 429) {
          // The backend message carries the exact daily-quota numbers — show it as-is.
          toast.error(err.message, { description: t("carousels.lowerSlidesHint") });
        } else if (err.status === 400) {
          toast.error(err.message || t("carousels.topicBlocked"));
        } else if (err.status === 422 && err.details.length) {
          toast.error(err.details[0].message);
        } else {
          toast.error(err.message);
        }
      } else {
        toast.error(t("common.connectionError"));
      }
    },
  });

  const submit = () => {
    const trimmed = topic.trim();
    if (trimmed.length < CAROUSEL_TOPIC_MIN) {
      setError(t("carousels.topicTooShort", { min: CAROUSEL_TOPIC_MIN }));
      return;
    }
    if (trimmed.length > CAROUSEL_TOPIC_MAX) {
      setError(t("carousels.topicTooLong", { max: CAROUSEL_TOPIC_MAX }));
      return;
    }
    setError(null);
    mutation.mutate();
  };

  return (
    <div className="rounded-xl bg-white p-5 shadow-card space-y-5">
      <div>
        <Label htmlFor="carousel_topic">{t("carousels.topicLabel")}</Label>
        <Textarea
          id="carousel_topic"
          rows={4}
          placeholder={t("carousels.topicPlaceholder")}
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          invalid={!!error}
        />
        <div className="mt-1 flex items-center justify-between">
          <FieldError message={error ?? undefined} />
          <span
            className={cn(
              "ml-auto text-xs",
              topic.trim().length > CAROUSEL_TOPIC_MAX
                ? "text-[var(--color-danger-fg)]"
                : "text-[var(--color-fg-muted)]",
            )}
          >
            {topic.trim().length}/{CAROUSEL_TOPIC_MAX}
          </span>
        </div>
      </div>

      <div>
        <Label>{t("carousels.slideCountLabel")}</Label>
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: slideMax - slideMin + 1 }, (_, i) => slideMin + i).map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setSlideCount(n)}
              aria-pressed={slideCount === n}
              className={cn(
                "h-9 w-9 rounded-lg bg-white text-sm font-medium shadow-ring-light transition-shadow hover:shadow-card",
                slideCount === n && "shadow-[var(--color-fg)_0_0_0_2px]",
              )}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      {presetsQuery.error ? (
        <div className="rounded-md bg-[var(--color-bg-subtle)] p-3 text-sm text-[var(--color-fg-muted)]">
          <p>{t("carousels.presetsError")}</p>
          <Button size="sm" variant="secondary" className="mt-2" onClick={() => presetsQuery.refetch()}>
            <RefreshCw className="h-3.5 w-3.5" />
            {t("common.retry")}
          </Button>
        </div>
      ) : (
        <>
          <div>
            <Label htmlFor="carousel_style">{t("carousels.styleLabel")}</Label>
            <Select
              id="carousel_style"
              value={stylePreset}
              disabled={!presets}
              onChange={(e) => setStylePreset(e.target.value)}
            >
              <option value={AUTO}>{t("carousels.autoOption")}</option>
              {presets?.styles.map((s) => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </Select>
            {selectedStyle && (
              <p className="mt-1 text-xs text-[var(--color-fg-muted)]">{selectedStyle.description}</p>
            )}
          </div>

          <div>
            <Label htmlFor="carousel_narrative">{t("carousels.narrativeLabel")}</Label>
            <Select
              id="carousel_narrative"
              value={narrativePreset}
              disabled={!presets}
              onChange={(e) => setNarrativePreset(e.target.value)}
            >
              <option value={AUTO}>{t("carousels.autoOption")}</option>
              {presets?.narratives.map((n) => (
                <option key={n.id} value={n.id}>{n.label}</option>
              ))}
            </Select>
            {selectedNarrative && (
              <p className="mt-1 text-xs text-[var(--color-fg-muted)]">{selectedNarrative.description}</p>
            )}
          </div>
        </>
      )}

      <div>
        <Label>{t("carousels.aspectLabel")}</Label>
        <div className="flex flex-wrap gap-2">
          {ratios.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRatio(r)}
              aria-pressed={ratio === r}
              className={cn(
                "h-9 rounded-lg bg-white px-3 text-sm font-medium shadow-ring-light transition-shadow hover:shadow-card",
                ratio === r && "shadow-[var(--color-fg)_0_0_0_2px]",
              )}
            >
              {r}
            </button>
          ))}
        </div>
        <p className="mt-1 text-xs text-[var(--color-fg-muted)]">{t("carousels.aspectHint")}</p>
      </div>

      {hasLogo && (
        <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
          <input
            type="checkbox"
            checked={useLogo}
            onChange={(e) => setUseLogo(e.target.checked)}
            className="h-4 w-4 accent-[var(--color-fg)]"
          />
          {t("brands.useLogoLabel")}
        </label>
      )}

      {assets.length > 0 && (
        <div>
          <Label>{t("brands.referencesLabel")}</Label>
          <p className="text-xs text-[var(--color-fg-muted)] mb-2">
            {t("brands.referencesHint", { max: MAX_REFERENCE_ASSETS })}
          </p>
          <div className="flex flex-wrap gap-2">
            {assets.map((asset) => {
              const selected = referenceIds.includes(asset.id);
              return (
                <button
                  key={asset.id}
                  type="button"
                  onClick={() => toggleReference(asset.id)}
                  aria-pressed={selected}
                  title={asset.title ?? t(`brands.assetTypes.${asset.asset_type}`)}
                  className={cn(
                    "relative h-16 w-16 overflow-hidden rounded-lg bg-[var(--color-bg-subtle)] shadow-ring-light transition-shadow",
                    selected && "shadow-[var(--color-fg)_0_0_0_2px]",
                  )}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={asset.image_url} alt={asset.title ?? ""} className="h-full w-full object-contain" />
                  {selected && (
                    <span className="absolute right-1 top-1 inline-flex h-4 w-4 items-center justify-center rounded-full bg-[var(--color-fg)] text-white">
                      <Check className="h-3 w-3" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Each slide spends 1 image of the daily quota — surface it before submitting. */}
      <p className="rounded-md bg-[var(--color-bg-subtle)] p-3 text-xs text-[var(--color-fg-muted)]">
        {t("carousels.costNote", { count: slideCount })}
      </p>

      <Button onClick={submit} loading={mutation.isPending} className="w-full" size="lg">
        <GalleryHorizontalEnd className="h-4 w-4" />
        {t("carousels.generate")}
      </Button>
    </div>
  );
}
