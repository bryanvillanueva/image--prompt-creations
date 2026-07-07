"use client";
import * as React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import { FieldError } from "@/components/ui/FieldError";
import { FormatPicker, CUSTOM_FORMAT } from "./FormatPicker";
import { brandsApi } from "@/lib/api/brands";
import { ApiError } from "@/lib/api/client";
import {
  FORMAT_PRESETS,
  INSTRUCTION_MAX,
  INSTRUCTION_MIN,
  MAX_REFERENCE_ASSETS,
  type BrandAspectRatio,
} from "@/lib/constants";
import type { Brand } from "@/lib/types";
import { cn } from "@/lib/cn";
import { useT } from "@/lib/i18n/I18nProvider";

interface GenerationStudioProps {
  brand: Brand;
}

export function GenerationStudio({ brand }: GenerationStudioProps) {
  const { t } = useT();
  const queryClient = useQueryClient();

  const [instruction, setInstruction] = React.useState("");
  const [presetId, setPresetId] = React.useState<string>(FORMAT_PRESETS[0].id);
  const [customRatio, setCustomRatio] = React.useState<BrandAspectRatio>("1:1");
  const [useLogo, setUseLogo] = React.useState(true);
  const [referenceIds, setReferenceIds] = React.useState<number[]>([]);
  const [error, setError] = React.useState<string | null>(null);

  const assets = brand.assets ?? [];
  const hasLogo = assets.some((a) => a.asset_type === "logo" || a.asset_type === "logo_variant");

  const preset = FORMAT_PRESETS.find((p) => p.id === presetId);
  const ratio = preset?.ratio ?? customRatio;
  // The selected format is injected into the instruction so the agent
  // composes the image for that platform without the user typing it.
  const formatContext = preset ? `\n\n${t(`brands.formats.${preset.id}.prompt`)}` : "";
  const maxChars = INSTRUCTION_MAX - formatContext.length;

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
      brandsApi.createGeneration(brand.id, {
        instruction: instruction.trim() + formatContext,
        aspect_ratio: ratio,
        use_logo: hasLogo ? useLogo : false,
        reference_asset_ids: referenceIds.length ? referenceIds : undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brands", brand.id, "generations"] });
      toast.success(t("brands.generationQueued"));
      setInstruction("");
      setReferenceIds([]);
      setError(null);
    },
    onError: (err) => {
      if (err instanceof ApiError) {
        if (err.status === 429) toast.error(t("brands.dailyLimit"));
        else if (err.status === 400) toast.error(err.message || t("brands.instructionBlocked"));
        else toast.error(err.message);
      } else {
        toast.error(t("common.connectionError"));
      }
    },
  });

  const submit = () => {
    const trimmed = instruction.trim();
    if (trimmed.length < INSTRUCTION_MIN) {
      setError(t("brands.instructionTooShort", { min: INSTRUCTION_MIN }));
      return;
    }
    if (trimmed.length > maxChars) {
      setError(t("brands.instructionTooLong", { max: maxChars }));
      return;
    }
    setError(null);
    mutation.mutate();
  };

  return (
    <div className="rounded-xl bg-white p-5 shadow-card space-y-5">
      <div>
        <Label htmlFor="instruction">{t("brands.instructionLabel")}</Label>
        <Textarea
          id="instruction"
          rows={4}
          placeholder={t("brands.instructionPlaceholder")}
          value={instruction}
          onChange={(e) => setInstruction(e.target.value)}
          invalid={!!error}
        />
        <div className="mt-1 flex items-center justify-between">
          <FieldError message={error ?? undefined} />
          <span
            className={cn(
              "ml-auto text-xs",
              instruction.trim().length > maxChars
                ? "text-[var(--color-danger-fg)]"
                : "text-[var(--color-fg-muted)]",
            )}
          >
            {instruction.trim().length}/{maxChars}
          </span>
        </div>
      </div>

      <div>
        <Label>{t("brands.formatLabel")}</Label>
        <FormatPicker
          presetId={presetId}
          customRatio={customRatio}
          onPresetChange={setPresetId}
          onCustomRatioChange={setCustomRatio}
        />
        {presetId !== CUSTOM_FORMAT && (
          <p className="text-xs text-[var(--color-fg-muted)] mt-2">{t("brands.formatHint")}</p>
        )}
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

      <Button onClick={submit} loading={mutation.isPending} className="w-full" size="lg">
        <Sparkles className="h-4 w-4" />
        {t("brands.generate")}
      </Button>
    </div>
  );
}
