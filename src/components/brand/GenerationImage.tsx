"use client";
import * as React from "react";
import * as RDialog from "@radix-ui/react-dialog";
import { Download, Expand, X } from "lucide-react";
import { Spinner } from "@/components/ui/Spinner";
import { cn } from "@/lib/cn";
import { useT } from "@/lib/i18n/I18nProvider";

function ratioToNumber(r: string): number | null {
  const m = /^(\d+(?:\.\d+)?):(\d+(?:\.\d+)?)$/.exec(r.trim());
  if (!m) return null;
  const value = Number(m[1]) / Number(m[2]);
  return Number.isFinite(value) && value > 0 ? value : null;
}

const MAX_BOX_HEIGHT = 520;

// Sizes a box to the generation's aspect ratio, capping portrait formats so a
// 9:16 story doesn't take over the whole column.
function boxStyle(aspectRatio: string): React.CSSProperties {
  const ratio = ratioToNumber(aspectRatio);
  if (!ratio) return { aspectRatio: "1 / 1", maxWidth: MAX_BOX_HEIGHT };
  return {
    aspectRatio: String(ratio),
    maxWidth: ratio < 1 ? Math.round(MAX_BOX_HEIGHT * ratio) : undefined,
  };
}

/** Shimmer placeholder shown while the agent is still generating the image. */
export function GenerationImageSkeleton({
  aspectRatio,
  message,
}: {
  aspectRatio: string;
  message?: string;
}) {
  return (
    <div
      className="relative mx-auto w-full overflow-hidden rounded-xl bg-[var(--color-bg-subtle)]"
      style={boxStyle(aspectRatio)}
    >
      <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-[var(--color-bg-subtle)] via-white/60 to-[var(--color-bg-subtle)]" />
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-4 text-center">
        <Spinner className="text-[var(--color-fg-muted)]" />
        {message && <p className="text-sm text-[var(--color-fg-muted)]">{message}</p>}
      </div>
    </div>
  );
}

interface GenerationImageProps {
  src: string;
  alt: string;
  aspectRatio: string;
}

/**
 * Final image of a generation: skeleton while the file downloads, click to
 * open a fullscreen lightbox, and hover actions to expand/download.
 */
export function GenerationImage({ src, alt, aspectRatio }: GenerationImageProps) {
  const { t } = useT();
  const [loaded, setLoaded] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [downloading, setDownloading] = React.useState(false);

  const download = React.useCallback(async () => {
    setDownloading(true);
    try {
      const res = await fetch(src);
      if (!res.ok) throw new Error(String(res.status));
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const ext = blob.type.split("/")[1]?.split("+")[0] || "png";
      a.download = `brand-image-${Date.now()}.${ext}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      // CORS or network issue: at least open the file in a new tab.
      window.open(src, "_blank", "noopener");
    } finally {
      setDownloading(false);
    }
  }, [src]);

  const overlayButton =
    "inline-flex h-8 w-8 items-center justify-center rounded-md bg-black/55 text-white backdrop-blur-sm transition-colors hover:bg-black/75";

  return (
    <>
      <div
        className="group relative mx-auto w-full overflow-hidden rounded-xl bg-[var(--color-bg-subtle)]"
        style={boxStyle(aspectRatio)}
      >
        {!loaded && (
          <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-[var(--color-bg-subtle)] via-white/60 to-[var(--color-bg-subtle)]" />
        )}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          onLoad={() => setLoaded(true)}
          onClick={() => setOpen(true)}
          className={cn(
            "h-full w-full cursor-zoom-in object-cover transition-opacity duration-300",
            loaded ? "opacity-100" : "opacity-0",
          )}
        />
        {loaded && (
          <div className="absolute right-2 top-2 flex gap-1.5 opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100">
            <button
              type="button"
              className={overlayButton}
              aria-label={t("common.expand")}
              onClick={() => setOpen(true)}
            >
              <Expand className="h-4 w-4" />
            </button>
            <button
              type="button"
              className={overlayButton}
              aria-label={t("common.download")}
              disabled={downloading}
              onClick={download}
            >
              {downloading ? (
                <Spinner className="h-4 w-4" />
              ) : (
                <Download className="h-4 w-4" />
              )}
            </button>
          </div>
        )}
      </div>

      <RDialog.Root open={open} onOpenChange={setOpen}>
        <RDialog.Portal>
          <RDialog.Overlay className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm data-[state=open]:animate-fade-in" />
          <RDialog.Content
            className="fixed inset-0 z-50 flex items-center justify-center p-4 focus:outline-none data-[state=open]:animate-fade-in sm:p-8"
            onClick={() => setOpen(false)}
          >
            <RDialog.Title className="sr-only">{alt}</RDialog.Title>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={alt}
              onClick={(e) => e.stopPropagation()}
              className="max-h-[92vh] max-w-[92vw] rounded-lg object-contain shadow-2xl"
            />
            <div className="absolute right-4 top-4 flex gap-2" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20"
                aria-label={t("common.download")}
                disabled={downloading}
                onClick={download}
              >
                {downloading ? <Spinner className="h-5 w-5" /> : <Download className="h-5 w-5" />}
              </button>
              <RDialog.Close
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20"
                aria-label={t("common.close")}
              >
                <X className="h-5 w-5" />
              </RDialog.Close>
            </div>
          </RDialog.Content>
        </RDialog.Portal>
      </RDialog.Root>
    </>
  );
}
