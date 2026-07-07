"use client";
import * as React from "react";
import { Select } from "@/components/ui/Select";
import { Label } from "@/components/ui/Label";
import { BRAND_ASPECT_RATIOS, FORMAT_PRESETS, type BrandAspectRatio } from "@/lib/constants";
import { cn } from "@/lib/cn";
import { useT } from "@/lib/i18n/I18nProvider";

export const CUSTOM_FORMAT = "custom";

interface FormatPickerProps {
  presetId: string;
  customRatio: BrandAspectRatio;
  onPresetChange: (presetId: string) => void;
  onCustomRatioChange: (ratio: BrandAspectRatio) => void;
}

function RatioShape({ ratio, className }: { ratio: BrandAspectRatio; className?: string }) {
  const [w, h] = ratio.split(":").map(Number);
  return (
    <div className={cn("flex h-12 items-center justify-center", className)}>
      <div
        className="rounded-[3px] bg-current opacity-80"
        style={w >= h ? { width: 40, height: (40 * h) / w } : { height: 44, width: (44 * w) / h }}
      />
    </div>
  );
}

export function FormatPicker({ presetId, customRatio, onPresetChange, onCustomRatioChange }: FormatPickerProps) {
  const { t } = useT();

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {FORMAT_PRESETS.map((preset) => {
          const selected = presetId === preset.id;
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => onPresetChange(preset.id)}
              aria-pressed={selected}
              className={cn(
                "flex flex-col items-center rounded-xl bg-white p-3 text-center shadow-ring-light transition-shadow hover:shadow-card",
                selected && "shadow-[var(--color-fg)_0_0_0_2px]",
              )}
            >
              <RatioShape
                ratio={preset.ratio}
                className={selected ? "text-[var(--color-fg)]" : "text-[var(--color-fg-muted)]"}
              />
              <div className="mt-1 text-sm font-medium leading-tight">
                {t(`brands.formats.${preset.id}.label`)}
              </div>
              <div className="text-[11px] text-[var(--color-fg-muted)]">
                {t(`brands.formats.${preset.id}.platforms`)}
              </div>
              <div className="text-[11px] text-[var(--color-fg-muted)]">
                {preset.width}×{preset.height} · {preset.ratio}
              </div>
            </button>
          );
        })}

        <button
          type="button"
          onClick={() => onPresetChange(CUSTOM_FORMAT)}
          aria-pressed={presetId === CUSTOM_FORMAT}
          className={cn(
            "flex flex-col items-center justify-center rounded-xl bg-white p-3 text-center shadow-ring-light transition-shadow hover:shadow-card",
            presetId === CUSTOM_FORMAT && "shadow-[var(--color-fg)_0_0_0_2px]",
          )}
        >
          <div className="flex h-12 items-center justify-center text-lg text-[var(--color-fg-muted)]">⋯</div>
          <div className="mt-1 text-sm font-medium leading-tight">{t("brands.formats.custom.label")}</div>
          <div className="text-[11px] text-[var(--color-fg-muted)]">{t("brands.formats.custom.platforms")}</div>
        </button>
      </div>

      {presetId === CUSTOM_FORMAT && (
        <div className="max-w-[200px]">
          <Label htmlFor="custom_ratio">{t("brands.customRatioLabel")}</Label>
          <Select
            id="custom_ratio"
            value={customRatio}
            onChange={(e) => onCustomRatioChange(e.target.value as BrandAspectRatio)}
          >
            {BRAND_ASPECT_RATIOS.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </Select>
        </div>
      )}
    </div>
  );
}
