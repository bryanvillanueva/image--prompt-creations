"use client";
import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft, Brain, Pencil, Sparkles, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardBody } from "@/components/ui/Card";
import { ErrorState } from "@/components/ui/ErrorState";
import { Spinner } from "@/components/ui/Spinner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { AssetManager } from "@/components/brand/AssetManager";
import { brandsApi } from "@/lib/api/brands";
import { ApiError } from "@/lib/api/client";
import { qk } from "@/lib/queries/keys";
import { formatDate } from "@/lib/format";
import { useT } from "@/lib/i18n/I18nProvider";

function ColorRow({ label, colors }: { label: string; colors: string[] | null }) {
  if (!colors || colors.length === 0) return null;
  return (
    <div>
      <div className="text-xs font-medium text-[var(--color-fg-muted)] mb-1">{label}</div>
      <div className="flex flex-wrap items-center gap-2">
        {colors.map((c, i) => (
          <span key={`${c}-${i}`} className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-bg-subtle)] pl-1 pr-2 py-1 text-xs font-mono">
            <span className="h-5 w-5 rounded-full shadow-ring-light" style={{ backgroundColor: c }} />
            {c}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function BrandDetailPage() {
  const params = useParams<{ id: string }>();
  const brandId = Number(params.id);
  const router = useRouter();
  const queryClient = useQueryClient();
  const { t } = useT();
  const [deleteOpen, setDeleteOpen] = React.useState(false);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: qk.brands.detail(brandId),
    queryFn: () => brandsApi.byId(brandId),
    enabled: Number.isFinite(brandId),
  });

  const deleteMutation = useMutation({
    mutationFn: () => brandsApi.remove(brandId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.brands.all });
      toast.success(t("brands.deleted"));
      router.push("/brands");
    },
    onError: (err) => {
      toast.error(err instanceof ApiError ? err.message : t("common.connectionError"));
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner className="text-[var(--color-fg-muted)]" />
      </div>
    );
  }
  if (error || !data) return <ErrorState onRetry={() => refetch()} />;

  const brand = data.data;

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/brands"
          className="inline-flex items-center gap-1 text-sm text-[var(--color-fg-muted)] hover:text-[var(--color-fg)]"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("brands.backToList")}
        </Link>
        <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-h1">{brand.name}</h1>
              {brand.industry && <Badge variant="blue">{brand.industry}</Badge>}
            </div>
            {brand.slogan && (
              <p className="text-body italic text-[var(--color-fg-muted)]">“{brand.slogan}”</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Link href={`/brands/${brand.id}/edit`}>
              <Button variant="secondary" size="sm">
                <Pencil className="h-4 w-4" />
                {t("common.edit")}
              </Button>
            </Link>
            <Button variant="ghost" size="sm" onClick={() => setDeleteOpen(true)}>
              <Trash2 className="h-4 w-4 text-[var(--color-danger-fg)]" />
            </Button>
            <Link href={`/brands/${brand.id}/studio`}>
              <Button size="sm">
                <Sparkles className="h-4 w-4" />
                {t("brands.goToStudio")}
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <Card>
            <CardBody className="space-y-4">
              <h2 className="text-h3">{t("brands.identityTitle")}</h2>
              {brand.description && <p className="text-sm whitespace-pre-wrap">{brand.description}</p>}
              {brand.tone_of_voice && (
                <div>
                  <div className="text-xs font-medium text-[var(--color-fg-muted)] mb-1">{t("brands.toneLabel")}</div>
                  <p className="text-sm">{brand.tone_of_voice}</p>
                </div>
              )}
              <ColorRow label={t("brands.primaryColorsLabel")} colors={brand.primary_colors} />
              <ColorRow label={t("brands.secondaryColorsLabel")} colors={brand.secondary_colors} />
              {brand.typography && Object.keys(brand.typography).length > 0 && (
                <div>
                  <div className="text-xs font-medium text-[var(--color-fg-muted)] mb-1">{t("brands.typographyLabel")}</div>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(brand.typography).map(([role, font]) => (
                      <Badge key={role} variant="neutral">
                        <span className="opacity-70">{role}:</span> {font}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardBody>
          </Card>

          <AssetManager brandId={brand.id} assets={brand.assets ?? []} />
        </div>

        <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <Card>
            <CardBody className="space-y-2">
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4 text-[var(--color-fg-muted)]" />
                <h2 className="font-semibold">{t("brands.styleMemoryTitle")}</h2>
              </div>
              {brand.style_memory ? (
                <>
                  <p className="text-sm text-[var(--color-fg-muted)] whitespace-pre-wrap">{brand.style_memory}</p>
                  {brand.style_memory_updated_at && (
                    <p className="text-xs text-[var(--color-fg-muted)]">
                      {t("brands.styleMemoryUpdated", { date: formatDate(brand.style_memory_updated_at) })}
                    </p>
                  )}
                </>
              ) : (
                <p className="text-sm text-[var(--color-fg-muted)]">{t("brands.styleMemoryEmpty")}</p>
              )}
            </CardBody>
          </Card>
        </aside>
      </div>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("brands.deleteTitle", { name: brand.name })}</DialogTitle>
            <DialogDescription>{t("brands.deleteDescription")}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setDeleteOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button variant="danger" loading={deleteMutation.isPending} onClick={() => deleteMutation.mutate()}>
              {t("common.delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
