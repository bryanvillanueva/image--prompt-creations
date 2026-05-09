"use client";
import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, Bookmark, Copy } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { ImageLightbox } from "@/components/gallery/ImageLightbox";
import { LoginPromptDialog } from "@/components/auth/LoginPromptDialog";
import { useAuth } from "@/lib/auth/AuthContext";
import { formatNumber } from "@/lib/format";
import type { Prompt } from "@/lib/types";
import { useT } from "@/lib/i18n/I18nProvider";

export function PromptCard({ prompt }: { prompt: Prompt }) {
  const { t } = useT();
  const { isAuthenticated, isLoading } = useAuth();
  const [lightboxOpen, setLightboxOpen] = React.useState(false);
  const [authPromptOpen, setAuthPromptOpen] = React.useState(false);
  const aspect = prompt.image?.width && prompt.image?.height
    ? prompt.image.width / prompt.image.height
    : 1;
  const imageAlt = prompt.image?.alt_text || prompt.title;
  const detailHref = `/prompts/${prompt.slug}`;

  const detailContent = (
    <>
      <h3 className="text-base font-semibold tracking-tight line-clamp-2 mb-2">
        {prompt.title}
      </h3>
      <div className="flex items-center justify-between gap-2 text-xs text-[var(--color-fg-muted)]">
        {prompt.author && (
          <div className="flex items-center gap-2 min-w-0">
            <Avatar src={prompt.author.avatar_url} name={prompt.author.name} size={20} />
            <span className="truncate">@{prompt.author.username}</span>
          </div>
        )}
        <div className="flex items-center gap-3 shrink-0">
          <span className="inline-flex items-center gap-1" title={t("promptCard.likes")}>
            <Heart className="h-3.5 w-3.5" />
            {formatNumber(prompt.likes_count)}
          </span>
          <span className="inline-flex items-center gap-1" title={t("promptCard.saves")}>
            <Bookmark className="h-3.5 w-3.5" />
            {formatNumber(prompt.saves_count)}
          </span>
          <span className="inline-flex items-center gap-1" title={t("promptCard.copies")}>
            <Copy className="h-3.5 w-3.5" />
            {formatNumber(prompt.copied_count)}
          </span>
        </div>
      </div>
    </>
  );

  const handleGuardedClick = (e: React.MouseEvent) => {
    if (isLoading) {
      e.preventDefault();
      return;
    }
    if (!isAuthenticated) {
      e.preventDefault();
      setAuthPromptOpen(true);
    }
  };

  return (
    <article className="group block bg-white rounded-xl shadow-card overflow-hidden transition-shadow hover:shadow-card-hover">
      {prompt.image?.url ? (
        <button
          type="button"
          onClick={() => setLightboxOpen(true)}
          aria-label={t("promptCard.viewFull", { title: prompt.title })}
          className="relative block w-full bg-[var(--color-bg-subtle)] cursor-zoom-in focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-link)]"
          style={{ aspectRatio: aspect }}
        >
          <Image
            src={prompt.image.url}
            alt={imageAlt}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition-transform duration-200 group-hover:scale-[1.02]"
          />
        </button>
      ) : (
        <div
          className="relative w-full bg-[var(--color-bg-subtle)]"
          style={{ aspectRatio: aspect }}
        >
          <div className="absolute inset-0 grid place-items-center text-[var(--color-fg-placeholder)]">
            {t("promptCard.noImage")}
          </div>
        </div>
      )}

      <Link href={detailHref} onClick={handleGuardedClick} className="block p-4">
        {detailContent}
      </Link>

      {prompt.image?.url && (
        <ImageLightbox
          open={lightboxOpen}
          onOpenChange={setLightboxOpen}
          image={prompt.image}
          title={prompt.title}
        />
      )}

      <LoginPromptDialog
        open={authPromptOpen}
        onOpenChange={setAuthPromptOpen}
        next={detailHref}
      />
    </article>
  );
}

export function PromptCardSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-card overflow-hidden">
      <div className="w-full aspect-[4/5] bg-[var(--color-bg-subtle)] animate-pulse" />
      <div className="p-4 space-y-2">
        <div className="h-4 w-3/4 bg-[var(--color-bg-subtle)] animate-pulse rounded-md" />
        <div className="h-3 w-1/2 bg-[var(--color-bg-subtle)] animate-pulse rounded-md" />
      </div>
    </div>
  );
}
