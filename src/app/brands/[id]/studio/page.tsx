"use client";
import * as React from "react";
import Link from "next/link";
import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, GalleryHorizontalEnd, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/ErrorState";
import { Spinner } from "@/components/ui/Spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { GenerationStudio } from "@/components/brand/GenerationStudio";
import { GenerationCard } from "@/components/brand/GenerationCard";
import { CarouselStudio } from "@/components/brand/CarouselStudio";
import { CarouselCard } from "@/components/brand/CarouselCard";
import { brandsApi } from "@/lib/api/brands";
import { carouselsApi } from "@/lib/api/carousels";
import { promptsApi } from "@/lib/api/prompts";
import { qk } from "@/lib/queries/keys";
import type { Brand } from "@/lib/types";
import { useT } from "@/lib/i18n/I18nProvider";

const PAGE_SIZE = 10;

export default function BrandStudioPage() {
  return (
    <React.Suspense
      fallback={
        <div className="flex justify-center py-24">
          <Spinner className="text-[var(--color-fg-muted)]" />
        </div>
      }
    >
      <BrandStudioInner />
    </React.Suspense>
  );
}

function BrandStudioInner() {
  const params = useParams<{ id: string }>();
  const brandId = Number(params.id);
  const { t } = useT();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // "Reuse" flow: a community prompt slug arrives via ?reuse=<slug> and is
  // preloaded into the instruction field. The brand adaptation itself happens
  // server-side: the generation agent receives the brand identity.
  // Adaptation point (option B): when the backend exposes an endpoint like
  // POST /brands/:id/adapt-prompt { prompt_text }, call it here and prefill
  // with the rewritten instruction instead of the raw framing below.
  const reuseSlug = searchParams.get("reuse");
  const reuseQuery = useQuery({
    queryKey: qk.prompts.bySlug(reuseSlug ?? ""),
    queryFn: () => promptsApi.bySlug(reuseSlug!),
    enabled: !!reuseSlug,
  });
  const reusedPrompt = reuseQuery.data?.data;
  const initialInstruction = reusedPrompt
    ? t("brands.reuseInstruction", { prompt: reusedPrompt.prompt_text })
    : undefined;

  const clearReuseParam = React.useCallback(() => {
    router.replace(pathname, { scroll: false });
  }, [router, pathname]);

  React.useEffect(() => {
    if (reuseQuery.error) clearReuseParam();
  }, [reuseQuery.error, clearReuseParam]);

  const brandQuery = useQuery({
    queryKey: qk.brands.detail(brandId),
    queryFn: () => brandsApi.byId(brandId),
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

      <Tabs defaultValue="image">
        <TabsList>
          <TabsTrigger value="image">
            <ImageIcon className="mr-1.5 h-4 w-4" />
            {t("carousels.studioTabImage")}
          </TabsTrigger>
          <TabsTrigger value="carousel">
            <GalleryHorizontalEnd className="mr-1.5 h-4 w-4" />
            {t("carousels.studioTabCarousel")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="image" className="mt-6 focus:outline-none">
          <GenerationsTab
            brandId={brandId}
            brand={brand}
            initialInstruction={initialInstruction}
            onInitialInstructionApplied={clearReuseParam}
          />
        </TabsContent>

        <TabsContent value="carousel" className="mt-6 focus:outline-none">
          <CarouselsTab brandId={brandId} brand={brand} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function GenerationsTab({
  brandId,
  brand,
  initialInstruction,
  onInitialInstructionApplied,
}: {
  brandId: number;
  brand: Brand;
  initialInstruction?: string;
  onInitialInstructionApplied?: () => void;
}) {
  const { t } = useT();
  const [page, setPage] = React.useState(1);

  const generationsQuery = useQuery({
    queryKey: qk.brands.generations(brandId, page),
    queryFn: () => brandsApi.listGenerations(brandId, { page, limit: PAGE_SIZE }),
    enabled: Number.isFinite(brandId),
  });

  const generations = generationsQuery.data?.data ?? [];
  const total = generationsQuery.data?.meta?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="grid gap-6 lg:grid-cols-[420px_minmax(0,1fr)] items-start">
      <div className="lg:sticky lg:top-20">
        <GenerationStudio
          brand={brand}
          initialInstruction={initialInstruction}
          onInitialInstructionApplied={onInitialInstructionApplied}
        />
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
            {generations.map((gen, idx) => (
              <GenerationCard
                key={gen.id}
                brandId={brandId}
                generation={gen}
                defaultExpanded={page === 1 && idx === 0}
                accentColors={brand.primary_colors}
              />
            ))}
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </>
        )}
      </section>
    </div>
  );
}

function CarouselsTab({ brandId, brand }: { brandId: number; brand: Brand }) {
  const { t } = useT();
  const [page, setPage] = React.useState(1);

  const carouselsQuery = useQuery({
    queryKey: qk.brands.carousels(brandId, page),
    queryFn: () => carouselsApi.list(brandId, { page, limit: PAGE_SIZE }),
    enabled: Number.isFinite(brandId),
  });

  const carousels = carouselsQuery.data?.data ?? [];
  const total = carouselsQuery.data?.meta?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="grid gap-6 lg:grid-cols-[420px_minmax(0,1fr)] items-start">
      <div className="lg:sticky lg:top-20">
        <CarouselStudio brand={brand} />
      </div>

      <section className="space-y-4">
        <h2 className="text-h3">{t("carousels.historyTitle")}</h2>
        {carouselsQuery.isLoading ? (
          <div className="flex justify-center py-16">
            <Spinner className="text-[var(--color-fg-muted)]" />
          </div>
        ) : carouselsQuery.error ? (
          <ErrorState onRetry={() => carouselsQuery.refetch()} />
        ) : carousels.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-xl bg-[var(--color-bg-subtle)] py-16 text-center text-[var(--color-fg-muted)]">
            <GalleryHorizontalEnd className="h-8 w-8" />
            <p className="text-sm">{t("carousels.historyEmpty")}</p>
          </div>
        ) : (
          <>
            {carousels.map((carousel, idx) => (
              <CarouselCard
                key={carousel.id}
                brandId={brandId}
                carousel={carousel}
                defaultExpanded={page === 1 && idx === 0}
              />
            ))}
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </>
        )}
      </section>
    </div>
  );
}

function Pagination({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (updater: (p: number) => number) => void;
}) {
  const { t } = useT();
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-3 pt-2">
      <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => onPageChange((p) => p - 1)}>
        {t("brands.pagePrev")}
      </Button>
      <span className="text-sm text-[var(--color-fg-muted)]">
        {t("brands.pageOf", { page, pages: totalPages })}
      </span>
      <Button
        variant="secondary"
        size="sm"
        disabled={page >= totalPages}
        onClick={() => onPageChange((p) => p + 1)}
      >
        {t("brands.pageNext")}
      </Button>
    </div>
  );
}
