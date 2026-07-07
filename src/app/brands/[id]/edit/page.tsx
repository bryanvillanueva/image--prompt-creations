"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { ErrorState } from "@/components/ui/ErrorState";
import { Spinner } from "@/components/ui/Spinner";
import { BrandForm } from "@/components/brand/BrandForm";
import { brandsApi } from "@/lib/api/brands";
import { qk } from "@/lib/queries/keys";
import { useT } from "@/lib/i18n/I18nProvider";

export default function EditBrandPage() {
  const params = useParams<{ id: string }>();
  const brandId = Number(params.id);
  const { t } = useT();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: qk.brands.detail(brandId),
    queryFn: () => brandsApi.byId(brandId),
    enabled: Number.isFinite(brandId),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner className="text-[var(--color-fg-muted)]" />
      </div>
    );
  }
  if (error || !data) return <ErrorState onRetry={() => refetch()} />;

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`/brands/${brandId}`}
          className="inline-flex items-center gap-1 text-sm text-[var(--color-fg-muted)] hover:text-[var(--color-fg)]"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("common.back")}
        </Link>
        <h1 className="text-h1 mt-2">{t("brands.editTitle", { name: data.data.name })}</h1>
      </div>
      <BrandForm initial={data.data} />
    </div>
  );
}
