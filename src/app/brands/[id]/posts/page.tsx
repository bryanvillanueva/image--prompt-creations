"use client";
import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/ErrorState";
import { Spinner } from "@/components/ui/Spinner";
import { PostCard } from "@/components/social/PostCard";
import { useSocialConnection } from "@/components/social/useSocialConnection";
import { socialApi } from "@/lib/api/social";
import { brandsApi } from "@/lib/api/brands";
import { qk } from "@/lib/queries/keys";
import { useT } from "@/lib/i18n/I18nProvider";

const PAGE_SIZE = 20;

export default function BrandPostsPage() {
  const params = useParams<{ id: string }>();
  const brandId = Number(params.id);
  const { t } = useT();
  const [page, setPage] = React.useState(1);
  const { connection, metaDisabled } = useSocialConnection(brandId);

  const brandQuery = useQuery({
    queryKey: qk.brands.detail(brandId),
    queryFn: () => brandsApi.byId(brandId),
    enabled: Number.isFinite(brandId),
  });

  const postsQuery = useQuery({
    queryKey: qk.brands.posts(brandId, page),
    queryFn: () => socialApi.listPosts(brandId, { page, limit: PAGE_SIZE }),
    enabled: Number.isFinite(brandId) && !metaDisabled,
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
  const posts = postsQuery.data?.data ?? [];
  const total = postsQuery.data?.meta?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link
          href={`/brands/${brandId}`}
          className="inline-flex items-center gap-1 text-sm text-[var(--color-fg-muted)] hover:text-[var(--color-fg)]"
        >
          <ArrowLeft className="h-4 w-4" />
          {brand.name}
        </Link>
        <h1 className="text-h1 mt-2">{t("social.postsTitle")}</h1>
        <p className="text-body text-[var(--color-fg-muted)]">{t("social.postsLead")}</p>
      </div>

      {metaDisabled ? (
        <p className="rounded-xl bg-[var(--color-bg-subtle)] p-6 text-center text-sm text-[var(--color-fg-muted)]">
          {t("social.metaUnavailable")}
        </p>
      ) : !connection && !postsQuery.isLoading ? (
        <div className="flex flex-col items-center gap-3 rounded-xl bg-[var(--color-bg-subtle)] py-16 text-center">
          <CalendarDays className="h-8 w-8 text-[var(--color-fg-muted)]" />
          <p className="text-sm text-[var(--color-fg-muted)]">{t("social.needConnection")}</p>
          <Link href={`/brands/${brandId}`}>
            <Button size="sm" variant="secondary">
              {t("social.goConnect")}
            </Button>
          </Link>
        </div>
      ) : postsQuery.isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner className="text-[var(--color-fg-muted)]" />
        </div>
      ) : postsQuery.error ? (
        <ErrorState onRetry={() => postsQuery.refetch()} />
      ) : posts.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl bg-[var(--color-bg-subtle)] py-16 text-center text-[var(--color-fg-muted)]">
          <CalendarDays className="h-8 w-8" />
          <p className="text-sm">{t("social.postsEmpty")}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard key={post.id} brandId={brandId} post={post} />
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
        </div>
      )}
    </div>
  );
}
