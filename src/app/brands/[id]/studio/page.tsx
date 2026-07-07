"use client";
import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/ErrorState";
import { Spinner } from "@/components/ui/Spinner";
import { GenerationStudio } from "@/components/brand/GenerationStudio";
import { GenerationCard } from "@/components/brand/GenerationCard";
import { brandsApi } from "@/lib/api/brands";
import { qk } from "@/lib/queries/keys";
import { useT } from "@/lib/i18n/I18nProvider";

const PAGE_SIZE = 10;

export default function BrandStudioPage() {
  const params = useParams<{ id: string }>();
  const brandId = Number(params.id);
  const { t } = useT();
  const [page, setPage] = React.useState(1);

  const brandQuery = useQuery({
    queryKey: qk.brands.detail(brandId),
    queryFn: () => brandsApi.byId(brandId),
    enabled: Number.isFinite(brandId),
  });

  const generationsQuery = useQuery({
    queryKey: qk.brands.generations(brandId, page),
    queryFn: () => brandsApi.listGenerations(brandId, { page, limit: PAGE_SIZE }),
    enabled: Number.isFinite(brandId),
  });

  if (brandQuery.isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner className="text-[var(--color-fg-muted)]" />
      </div>
    );
  }
  if (brandQuery.error || !brandQuery.data) {
    return <ErrorState onRetry={() => brandQuery.refetch()} />;
  }

  const brand = brandQuery.data.data;
  const generations = generationsQuery.data?.data ?? [];
  const total = generationsQuery.data?.meta?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`/brands/${brandId}`}
          className="inline-flex items-center gap-1 text-sm text-[var(--color-fg-muted)] hover:text-[var(--color-fg)]"
        >
          <ArrowLeft className="h-4 w-4" />
          {brand.name}
        </Link>
        <h1 className="text-h1 mt-2">{t("brands.studioTitle")}</h1>
        <p className="text-body text-[var(--color-fg-muted)]">{t("brands.studioLead")}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[420px_minmax(0,1fr)] items-start">
        <div className="lg:sticky lg:top-20">
          <GenerationStudio brand={brand} />
        </div>

        <section className="space-y-4">
          <h2 className="text-h3">{t("brands.historyTitle")}</h2>
          {generationsQuery.isLoading ? (
            <div className="flex justify-center py-16">
              <Spinner className="text-[var(--color-fg-muted)]" />
            </div>
          ) : generationsQuery.error ? (
            <ErrorState onRetry={() => generationsQuery.refetch()} />
          ) : generations.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-xl bg-[var(--color-bg-subtle)] py-16 text-center text-[var(--color-fg-muted)]">
              <ImageIcon className="h-8 w-8" />
              <p className="text-sm">{t("brands.historyEmpty")}</p>
            </div>
          ) : (
            <>
              {generations.map((gen) => (
                <GenerationCard key={gen.id} brandId={brandId} generation={gen} />
              ))}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 pt-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    {t("brands.pagePrev")}
                  </Button>
                  <span className="text-sm text-[var(--color-fg-muted)]">
                    {t("brands.pageOf", { page, pages: totalPages })}
                  </span>
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    {t("brands.pageNext")}
                  </Button>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}
