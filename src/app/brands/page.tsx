"use client";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Palette, Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Spinner } from "@/components/ui/Spinner";
import { BrandCard } from "@/components/brand/BrandCard";
import { brandsApi } from "@/lib/api/brands";
import { qk } from "@/lib/queries/keys";
import { MAX_BRANDS_PER_USER } from "@/lib/constants";
import { useT } from "@/lib/i18n/I18nProvider";

export default function BrandsPage() {
  const { t } = useT();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: qk.brands.list,
    queryFn: () => brandsApi.list(),
  });

  const brands = data?.data ?? [];
  const atLimit = brands.length >= MAX_BRANDS_PER_USER;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-h1">{t("brands.listTitle")}</h1>
          <p className="text-body text-[var(--color-fg-muted)]">{t("brands.listLead")}</p>
        </div>
        <div className="flex items-center gap-3">
          {!isLoading && !error && (
            <span className="text-sm text-[var(--color-fg-muted)]">
              {t("brands.listCount", { count: brands.length, max: MAX_BRANDS_PER_USER })}
            </span>
          )}
          <Link href="/brands/new" aria-disabled={atLimit} tabIndex={atLimit ? -1 : undefined} className={atLimit ? "pointer-events-none" : undefined}>
            <Button disabled={atLimit}>
              <Plus className="h-4 w-4" />
              {t("brands.createButton")}
            </Button>
          </Link>
        </div>
      </div>

      {atLimit && (
        <p className="text-sm text-[var(--color-fg-muted)]">{t("brands.limitReached")}</p>
      )}

      {isLoading ? (
        <div className="flex justify-center py-24">
          <Spinner className="text-[var(--color-fg-muted)]" />
        </div>
      ) : error ? (
        <ErrorState onRetry={() => refetch()} />
      ) : brands.length === 0 ? (
        <EmptyState
          icon={<Palette className="h-8 w-8" />}
          title={t("brands.emptyTitle")}
          description={t("brands.emptyDescription")}
          action={
            <Link href="/brands/new">
              <Button>{t("brands.emptyAction")}</Button>
            </Link>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {brands.map((brand) => (
            <BrandCard key={brand.id} brand={brand} />
          ))}
        </div>
      )}
    </div>
  );
}
