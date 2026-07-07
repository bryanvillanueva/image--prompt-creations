"use client";
import * as React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Label } from "@/components/ui/Label";
import { Badge } from "@/components/ui/Badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { ImageUploader } from "@/components/prompt/ImageUploader";
import { brandsApi } from "@/lib/api/brands";
import { ApiError } from "@/lib/api/client";
import { qk } from "@/lib/queries/keys";
import { ASSET_TYPES, MAX_ASSETS_PER_BRAND } from "@/lib/constants";
import type { AssetType, BrandAsset } from "@/lib/types";
import { useT } from "@/lib/i18n/I18nProvider";

interface AssetManagerProps {
  brandId: number;
  assets: BrandAsset[];
}

export function AssetManager({ brandId, assets }: AssetManagerProps) {
  const { t } = useT();
  const queryClient = useQueryClient();
  const [uploadOpen, setUploadOpen] = React.useState(false);
  const [deleteTarget, setDeleteTarget] = React.useState<BrandAsset | null>(null);

  const [file, setFile] = React.useState<File | null>(null);
  const [assetType, setAssetType] = React.useState<AssetType>("logo");
  const [title, setTitle] = React.useState("");
  const [notes, setNotes] = React.useState("");
  const [fileError, setFileError] = React.useState<string | null>(null);

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: qk.brands.detail(brandId) });

  const resetForm = () => {
    setFile(null);
    setAssetType("logo");
    setTitle("");
    setNotes("");
    setFileError(null);
  };

  const uploadMutation = useMutation({
    mutationFn: () => {
      const form = new FormData();
      form.append("image", file as File);
      form.append("asset_type", assetType);
      if (title.trim()) form.append("title", title.trim());
      if (notes.trim()) form.append("notes", notes.trim());
      return brandsApi.uploadAsset(brandId, form);
    },
    onSuccess: () => {
      invalidate();
      toast.success(t("brands.assetUploaded"));
      setUploadOpen(false);
      resetForm();
    },
    onError: (err) => {
      if (err instanceof ApiError) {
        if (err.status === 413) setFileError(t("brands.assetTooLarge"));
        else if (err.status === 415) setFileError(t("brands.assetBadFormat"));
        else if (err.status === 409) toast.error(t("brands.assetLimitReached"));
        else toast.error(err.message);
      } else {
        toast.error(t("common.connectionError"));
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (assetId: number) => brandsApi.deleteAsset(brandId, assetId),
    onSuccess: () => {
      invalidate();
      toast.success(t("brands.assetDeleted"));
      setDeleteTarget(null);
    },
    onError: (err) => {
      toast.error(err instanceof ApiError ? err.message : t("common.connectionError"));
    },
  });

  const atLimit = assets.length >= MAX_ASSETS_PER_BRAND;

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-h3">{t("brands.assetsTitle")}</h2>
          <p className="text-sm text-[var(--color-fg-muted)]">
            {t("brands.assetsCount", { count: assets.length, max: MAX_ASSETS_PER_BRAND })}
          </p>
        </div>
        <Button size="sm" onClick={() => setUploadOpen(true)} disabled={atLimit}>
          <Plus className="h-4 w-4" />
          {t("brands.assetUpload")}
        </Button>
      </div>

      {assets.length === 0 ? (
        <div className="rounded-xl bg-[var(--color-bg-subtle)] p-6 text-center text-sm text-[var(--color-fg-muted)]">
          {t("brands.assetsEmpty")}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {assets.map((asset) => (
            <div key={asset.id} className="group relative rounded-xl bg-white shadow-card overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={asset.image_url}
                alt={asset.title ?? t(`brands.assetTypes.${asset.asset_type}`)}
                className="aspect-square w-full object-contain bg-[var(--color-bg-subtle)]"
              />
              <div className="p-2 space-y-1">
                <Badge variant={asset.asset_type === "logo" ? "dark" : "neutral"}>
                  {t(`brands.assetTypes.${asset.asset_type}`)}
                </Badge>
                {asset.title && <div className="text-xs font-medium truncate">{asset.title}</div>}
                {asset.notes && (
                  <div className="text-xs text-[var(--color-fg-muted)] line-clamp-2" title={asset.notes}>
                    {asset.notes}
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => setDeleteTarget(asset)}
                aria-label={t("common.delete")}
                className="absolute top-2 right-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/90 shadow-card text-[var(--color-danger-fg)] opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      <Dialog open={uploadOpen} onOpenChange={(open) => { setUploadOpen(open); if (!open) resetForm(); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{t("brands.assetUploadTitle")}</DialogTitle>
            <DialogDescription>{t("brands.assetUploadDescription")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <ImageUploader value={file} onChange={setFile} invalid={!!fileError} errorMessage={fileError ?? undefined} />
            <div>
              <Label htmlFor="asset_type">{t("brands.assetTypeLabel")}</Label>
              <Select id="asset_type" value={assetType} onChange={(e) => setAssetType(e.target.value as AssetType)}>
                {ASSET_TYPES.map((tp) => (
                  <option key={tp} value={tp}>{t(`brands.assetTypes.${tp}`)}</option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="asset_title">{t("brands.assetTitleLabel")}</Label>
              <Input id="asset_title" maxLength={150} value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="asset_notes">{t("brands.assetNotesLabel")}</Label>
              <Textarea
                id="asset_notes"
                rows={2}
                maxLength={500}
                placeholder={t("brands.assetNotesPlaceholder")}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
              <p className="text-xs text-[var(--color-fg-muted)] mt-1">{t("brands.assetNotesHint")}</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setUploadOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button
              onClick={() => {
                if (!file) {
                  setFileError(t("brands.assetSelectImage"));
                  return;
                }
                uploadMutation.mutate();
              }}
              loading={uploadMutation.isPending}
            >
              {t("brands.assetUpload")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("brands.assetDeleteTitle")}</DialogTitle>
            <DialogDescription>{t("brands.assetDeleteDescription")}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setDeleteTarget(null)}>
              {t("common.cancel")}
            </Button>
            <Button
              variant="danger"
              loading={deleteMutation.isPending}
              onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
            >
              {t("common.delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
