"use client";
import * as React from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { useQuery } from "@tanstack/react-query";
import { taxonomiesApi } from "@/lib/api/taxonomies";
import { qk } from "@/lib/queries/keys";
import { MODELS, SORT_OPTIONS } from "@/lib/constants";
import type { SortOption } from "@/lib/types";
import { useT } from "@/lib/i18n/I18nProvider";

export interface Filters {
  q: string;
  category: string;
  tag: string;
  model: string;
  sort: SortOption;
}

interface FiltersBarProps {
  value: Filters;
  onChange: (next: Filters) => void;
}

export function FiltersBar({ value, onChange }: FiltersBarProps) {
  const { t } = useT();
  const [localQ, setLocalQ] = React.useState(value.q);
  React.useEffect(() => setLocalQ(value.q), [value.q]);

  const { data: cats } = useQuery({
    queryKey: qk.taxonomies.categories,
    queryFn: () => taxonomiesApi.categories().then((r) => r.data),
    staleTime: 5 * 60_000,
  });
  const { data: tags } = useQuery({
    queryKey: qk.taxonomies.tags,
    queryFn: () => taxonomiesApi.tags().then((r) => r.data),
    staleTime: 5 * 60_000,
  });

  React.useEffect(() => {
    const tm = setTimeout(() => {
      if (localQ !== value.q) onChange({ ...value, q: localQ });
    }, 300);
    return () => clearTimeout(tm);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localQ]);

  const isFiltered =
    !!value.category || !!value.tag || !!value.model || value.sort !== "recent" || !!value.q;

  return (
    <div className="bg-white rounded-xl shadow-card p-4 mb-6 flex flex-col gap-3 md:flex-row md:items-center">
      <div className="relative flex-1 min-w-0">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-fg-placeholder)]" />
        <Input
          type="search"
          placeholder={t("filters.placeholder")}
          value={localQ}
          onChange={(e) => setLocalQ(e.target.value)}
          className="pl-9"
        />
      </div>
      <div className="grid grid-cols-2 md:flex md:items-center gap-2">
        <Select
          aria-label={t("filters.categoryAria")}
          value={value.category}
          onChange={(e) => onChange({ ...value, category: e.target.value })}
          className="md:w-44"
        >
          <option value="">{t("filters.allCategories")}</option>
          {cats?.map((c) => (
            <option key={c.id} value={c.slug}>{c.name}</option>
          ))}
        </Select>
        <Select
          aria-label={t("filters.tagAria")}
          value={value.tag}
          onChange={(e) => onChange({ ...value, tag: e.target.value })}
          className="md:w-40"
        >
          <option value="">{t("filters.allTags")}</option>
          {tags?.map((tg) => (
            <option key={tg.id} value={tg.slug}>{tg.name}</option>
          ))}
        </Select>
        <Select
          aria-label={t("filters.modelAria")}
          value={value.model}
          onChange={(e) => onChange({ ...value, model: e.target.value })}
          className="md:w-44"
        >
          <option value="">{t("filters.allModels")}</option>
          {MODELS.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </Select>
        <Select
          aria-label={t("filters.sortAria")}
          value={value.sort}
          onChange={(e) => onChange({ ...value, sort: e.target.value as SortOption })}
          className="md:w-36"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{t(`sort.${o.value}`)}</option>
          ))}
        </Select>
        {isFiltered && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onChange({ q: "", category: "", tag: "", model: "", sort: "recent" })}
            className="md:ml-1"
            aria-label={t("filters.clearAria")}
            title={t("filters.clearAria")}
          >
            <X className="h-4 w-4" /> {t("filters.clear")}
          </Button>
        )}
      </div>
    </div>
  );
}
