"use client";
import { Suspense, useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useInfiniteQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";
import { Spinner } from "@/components/ui/Spinner";
import { FiltersBar, type Filters } from "@/components/gallery/FiltersBar";
import { MasonryGrid } from "@/components/gallery/MasonryGrid";
import { PromptCard, PromptCardSkeleton } from "@/components/gallery/PromptCard";
import { promptsApi } from "@/lib/api/prompts";
import { qk } from "@/lib/queries/keys";
import type { SortOption } from "@/lib/types";

const PAGE_SIZE = 20;

function HomeInner() {
  const router = useRouter();
  const params = useSearchParams();

  const filters: Filters = useMemo(
    () => ({
      q: params.get("q") ?? "",
      category: params.get("category") ?? "",
      tag: params.get("tag") ?? "",
      model: params.get("model") ?? "",
      sort: (params.get("sort") as SortOption) ?? "recent",
    }),
    [params],
  );

  const updateFilters = useCallback(
    (next: Filters) => {
      const sp = new URLSearchParams();
      if (next.q) sp.set("q", next.q);
      if (next.category) sp.set("category", next.category);
      if (next.tag) sp.set("tag", next.tag);
      if (next.model) sp.set("model", next.model);
      if (next.sort && next.sort !== "recent") sp.set("sort", next.sort);
      router.replace(`/${sp.toString() ? `?${sp.toString()}` : ""}`, { scroll: false });
    },
    [router],
  );

  const query = useInfiniteQuery({
    queryKey: qk.prompts.list(filters),
    queryFn: ({ pageParam }) =>
      promptsApi.list({ ...filters, page: pageParam, limit: PAGE_SIZE }),
    initialPageParam: 1,
    getNextPageParam: (last) => {
      const meta = last.meta;
      if (!meta) return undefined;
      return meta.page < meta.pages ? meta.page + 1 : undefined;
    },
  });

  const items = query.data?.pages.flatMap((p) => p.data) ?? [];
  const total = query.data?.pages[0]?.meta?.total ?? null;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="space-y-2">
        <h1 className="text-h1">Biblioteca de prompts IA</h1>
        <p className="text-body-lg text-[var(--color-fg-muted)] max-w-2xl">
          Descubre, copia y guarda prompts para generar imágenes con tus modelos favoritos.
          Hechos por la comunidad, listos para inspirarte.
        </p>
      </div>

      <FiltersBar value={filters} onChange={updateFilters} />

      <div className="flex items-center justify-between text-sm text-[var(--color-fg-muted)]">
        <div>
          {total !== null ? `${total} resultado${total === 1 ? "" : "s"}` : "Cargando…"}
        </div>
      </div>

      {query.isError ? (
        <ErrorState
          message="No pudimos obtener los prompts del servidor."
          onRetry={() => query.refetch()}
        />
      ) : query.isLoading ? (
        <MasonryGrid>
          {Array.from({ length: 8 }).map((_, i) => (
            <PromptCardSkeleton key={i} />
          ))}
        </MasonryGrid>
      ) : items.length === 0 ? (
        <EmptyState
          title="Sin resultados"
          description="Prueba a cambiar los filtros o la búsqueda."
          action={
            <Link href="/prompts/new">
              <Button>Sé el primero en publicar</Button>
            </Link>
          }
        />
      ) : (
        <>
          <MasonryGrid>
            {items.map((p) => (
              <PromptCard key={p.id} prompt={p} />
            ))}
          </MasonryGrid>
          <div className="flex justify-center pt-2">
            {query.hasNextPage ? (
              <Button
                variant="secondary"
                onClick={() => query.fetchNextPage()}
                loading={query.isFetchingNextPage}
              >
                Cargar más
              </Button>
            ) : query.isFetching ? (
              <Spinner className="text-[var(--color-fg-muted)]" />
            ) : (
              <div className="text-sm text-[var(--color-fg-muted)]">Has llegado al final.</div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-24"><Spinner /></div>}>
      <HomeInner />
    </Suspense>
  );
}
