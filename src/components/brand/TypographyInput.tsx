"use client";
import * as React from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { MAX_TYPOGRAPHY_ENTRIES } from "@/lib/constants";
import { useT } from "@/lib/i18n/I18nProvider";

export interface TypographyEntry {
  role: string;
  font: string;
}

interface TypographyInputProps {
  value: TypographyEntry[];
  onChange: (entries: TypographyEntry[]) => void;
  invalid?: boolean;
}

export function TypographyInput({ value, onChange, invalid }: TypographyInputProps) {
  const { t } = useT();

  const update = (index: number, patch: Partial<TypographyEntry>) => {
    onChange(value.map((e, i) => (i === index ? { ...e, ...patch } : e)));
  };

  const remove = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const add = () => {
    if (value.length >= MAX_TYPOGRAPHY_ENTRIES) return;
    const suggested = value.length === 0 ? "primary" : value.length === 1 ? "secondary" : "";
    onChange([...value, { role: suggested, font: "" }]);
  };

  return (
    <div className="space-y-2">
      {value.map((entry, i) => (
        <div key={i} className="flex items-center gap-2">
          <Input
            value={entry.role}
            onChange={(e) => update(i, { role: e.target.value })}
            placeholder={t("brands.typographyRolePlaceholder")}
            invalid={invalid && !entry.role.trim()}
            className="max-w-[160px]"
          />
          <Input
            value={entry.font}
            onChange={(e) => update(i, { font: e.target.value })}
            placeholder={t("brands.typographyFontPlaceholder")}
            invalid={invalid && !entry.font.trim()}
          />
          <button
            type="button"
            onClick={() => remove(i)}
            aria-label={t("brands.typographyRemoveAria")}
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-[var(--color-fg-muted)] hover:bg-[var(--color-bg-subtle)]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
      {value.length < MAX_TYPOGRAPHY_ENTRIES && (
        <Button type="button" variant="secondary" size="sm" onClick={add}>
          <Plus className="h-4 w-4" />
          {t("brands.typographyAdd")}
        </Button>
      )}
    </div>
  );
}
