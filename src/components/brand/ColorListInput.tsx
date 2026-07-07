"use client";
import * as React from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { MAX_COLORS_PER_LIST } from "@/lib/constants";
import { cn } from "@/lib/cn";
import { useT } from "@/lib/i18n/I18nProvider";

interface ColorListInputProps {
  value: string[];
  onChange: (colors: string[]) => void;
  invalid?: boolean;
}

export function ColorListInput({ value, onChange, invalid }: ColorListInputProps) {
  const { t } = useT();

  const setColor = (index: number, color: string) => {
    const next = [...value];
    next[index] = color.toUpperCase();
    onChange(next);
  };

  const removeColor = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const addColor = () => {
    if (value.length >= MAX_COLORS_PER_LIST) return;
    onChange([...value, "#000000"]);
  };

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-2 rounded-md bg-white p-2 shadow-ring-light",
        invalid && "shadow-[rgba(185,28,28,0.4)_0_0_0_1px]",
      )}
    >
      {value.map((color, i) => (
        <span
          key={i}
          className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-bg-subtle)] pl-1 pr-1.5 py-1 text-xs font-mono"
        >
          <span className="relative inline-flex h-6 w-6 overflow-hidden rounded-full shadow-ring-light">
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(i, e.target.value)}
              aria-label={t("brands.colorPickerAria")}
              className="absolute -inset-1 h-8 w-8 cursor-pointer border-0 p-0"
            />
          </span>
          {color}
          <button
            type="button"
            onClick={() => removeColor(i)}
            aria-label={t("brands.colorRemoveAria")}
            className="inline-flex h-4 w-4 items-center justify-center rounded-full text-[var(--color-fg-muted)] hover:text-[var(--color-fg)]"
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
      {value.length < MAX_COLORS_PER_LIST && (
        <Button type="button" variant="ghost" size="sm" onClick={addColor}>
          <Plus className="h-4 w-4" />
          {t("brands.colorAdd")}
        </Button>
      )}
      {value.length === 0 && (
        <span className="text-xs text-[var(--color-fg-muted)]">{t("brands.colorEmptyHint")}</span>
      )}
    </div>
  );
}
