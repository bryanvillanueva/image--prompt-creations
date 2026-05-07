"use client";
import * as React from "react";
import { Upload, X, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE_BYTES } from "@/lib/constants";
import { formatBytes } from "@/lib/format";
import { cn } from "@/lib/cn";
import { useT } from "@/lib/i18n/I18nProvider";

interface ImageUploaderProps {
  value?: File | null;
  initialUrl?: string | null;
  onChange: (file: File | null) => void;
  invalid?: boolean;
  errorMessage?: string;
}

export function ImageUploader({
  value,
  initialUrl,
  onChange,
  invalid,
  errorMessage,
}: ImageUploaderProps) {
  const { t } = useT();
  const [preview, setPreview] = React.useState<string | null>(initialUrl ?? null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = React.useState(false);
  const [localError, setLocalError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!value) {
      setPreview(initialUrl ?? null);
      return;
    }
    const url = URL.createObjectURL(value);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [value, initialUrl]);

  const handleFile = (file: File | null) => {
    setLocalError(null);
    if (!file) {
      onChange(null);
      return;
    }
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setLocalError(t("imageUploader.formatError"));
      return;
    }
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      setLocalError(t("imageUploader.sizeError", { size: formatBytes(file.size) }));
      return;
    }
    onChange(file);
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0] ?? null;
    handleFile(file);
  };

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "relative cursor-pointer rounded-xl bg-white shadow-card transition-shadow overflow-hidden",
          dragOver && "shadow-card-hover",
          invalid && "shadow-[rgba(185,28,28,0.4)_0_0_0_1px]",
        )}
        style={{ minHeight: 240 }}
      >
        {preview ? (
          <div className="relative w-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="Preview" className="w-full h-auto max-h-[480px] object-contain bg-[var(--color-bg-subtle)]" />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange(null);
                setPreview(initialUrl ?? null);
                if (inputRef.current) inputRef.current.value = "";
              }}
              className="absolute top-3 right-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-card hover:bg-[var(--color-bg-subtle)]"
              aria-label={t("imageUploader.removeAria")}
            >
              <X className="h-4 w-4" />
            </button>
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between bg-white/90 backdrop-blur rounded-md px-3 py-2 text-xs">
              <div className="flex items-center gap-2">
                <ImageIcon className="h-4 w-4" />
                <span className="truncate max-w-[200px]">{value?.name ?? t("imageUploader.currentImage")}</span>
              </div>
              {value && <span className="text-[var(--color-fg-muted)]">{formatBytes(value.size)}</span>}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center p-12 text-[var(--color-fg-muted)]">
            <Upload className="h-8 w-8 mb-3" />
            <div className="font-medium text-[var(--color-fg)]">{t("imageUploader.dropOrClick")}</div>
            <div className="text-xs mt-1">{t("imageUploader.hint")}</div>
            <Button type="button" variant="secondary" size="sm" className="mt-4" onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}>
              {t("imageUploader.pickFile")}
            </Button>
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
        />
      </div>
      {(localError || errorMessage) && (
        <p className="text-xs text-[var(--color-danger-fg)] mt-1">{localError || errorMessage}</p>
      )}
    </div>
  );
}
