"use client";
import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { ErrorState } from "@/components/ui/ErrorState";
import { CopyPromptButton } from "@/components/prompt/CopyPromptButton";
import { LikeButton } from "@/components/prompt/LikeButton";
import { SaveButton } from "@/components/prompt/SaveButton";
import { ReportDialog } from "@/components/prompt/ReportDialog";
import { ImageLightbox } from "@/components/gallery/ImageLightbox";
import { promptsApi } from "@/lib/api/prompts";
import { ApiError } from "@/lib/api/client";
import { qk } from "@/lib/queries/keys";
import { useAuth } from "@/lib/auth/AuthContext";
import { formatDate, formatNumber } from "@/lib/format";

export default function PromptDetailPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const router = useRouter();
  const qc = useQueryClient();
  const { user, role } = useAuth();
  const [lightboxOpen, setLightboxOpen] = React.useState(false);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: qk.prompts.bySlug(slug),
    queryFn: () => promptsApi.bySlug(slug),
    retry: 1,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => promptsApi.remove(id),
    onSuccess: () => {
      toast.success("Prompt eliminado");
      qc.invalidateQueries({ queryKey: qk.prompts.all });
      router.push("/me/prompts");
    },
    onError: (err) => toast.error(err instanceof ApiError ? err.message : "Error al eliminar"),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner className="text-[var(--color-fg-muted)]" />
      </div>
    );
  }

  if (error) {
    if (error instanceof ApiError && error.status === 404) {
      return (
        <ErrorState title="Prompt no encontrado" message="Este prompt no existe o no está disponible." />
      );
    }
    return <ErrorState onRetry={() => refetch()} />;
  }

  if (!data) return null;
  const prompt = data.data;
  const isOwner = user?.id === prompt.user_id;
  const isStaff = role === "admin" || role === "moderator";
  const canEdit = isOwner || isStaff;

  const aspect = prompt.image?.width && prompt.image?.height
    ? prompt.image.width / prompt.image.height
    : 1;

  return (
    <article className="grid lg:grid-cols-2 gap-8 animate-fade-in">
      {/* Imagen */}
      <div className="bg-white rounded-xl shadow-card overflow-hidden">
        {prompt.image?.url ? (
          <button
            type="button"
            onClick={() => setLightboxOpen(true)}
            aria-label={`Ver imagen completa: ${prompt.title}`}
            className="relative block w-full bg-[var(--color-bg-subtle)] cursor-zoom-in focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-link)]"
            style={{ aspectRatio: aspect }}
          >
            <Image
              src={prompt.image.url}
              alt={prompt.image.alt_text || prompt.title}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-contain"
              priority
            />
          </button>
        ) : (
          <div className="relative w-full bg-[var(--color-bg-subtle)]" style={{ aspectRatio: aspect }} />
        )}
      </div>

      {prompt.image?.url && (
        <ImageLightbox
          open={lightboxOpen}
          onOpenChange={setLightboxOpen}
          image={prompt.image}
          title={prompt.title}
        />
      )}

      {/* Info */}
      <div className="flex flex-col gap-6 min-w-0">
        <header className="space-y-3">
          {prompt.category && (
            <Badge variant="blue">{prompt.category.name}</Badge>
          )}
          <h1 className="text-h1">{prompt.title}</h1>
          {prompt.author && (
            <Link
              href={`/u/${prompt.author.username}`}
              className="inline-flex items-center gap-2 text-sm text-[var(--color-fg-muted)] hover:text-[var(--color-fg)]"
            >
              <Avatar src={prompt.author.avatar_url} name={prompt.author.name} size={28} />
              <span>
                <span className="font-medium text-[var(--color-fg)]">{prompt.author.name}</span> · @{prompt.author.username}
              </span>
            </Link>
          )}
          <div className="text-xs text-[var(--color-fg-muted)] flex items-center gap-3 flex-wrap">
            <span>{formatDate(prompt.created_at)}</span>
            <span>·</span>
            <span>{formatNumber(prompt.views_count)} vistas</span>
            <span>·</span>
            <span>{formatNumber(prompt.copied_count)} copias</span>
          </div>
        </header>

        <div className="flex flex-wrap items-center gap-2">
          <CopyPromptButton prompt={prompt} />
          <LikeButton prompt={prompt} />
          <SaveButton prompt={prompt} />
          <ReportDialog promptId={prompt.id} slug={prompt.slug} />
          {canEdit && (
            <Link href={`/prompts/${prompt.slug}/edit`} className="ml-auto">
              <Button variant="ghost">
                <Pencil className="h-4 w-4" /> Editar
              </Button>
            </Link>
          )}
          {isOwner && (
            <Button
              variant="ghost"
              onClick={() => {
                if (confirm("¿Eliminar este prompt? Esta acción no se puede deshacer.")) {
                  deleteMutation.mutate(prompt.id);
                }
              }}
              loading={deleteMutation.isPending}
              className="text-[var(--color-danger-fg)]"
            >
              <Trash2 className="h-4 w-4" /> Eliminar
            </Button>
          )}
        </div>

        <section className="space-y-2">
          <div className="text-mono-label text-[var(--color-fg-muted)]">Prompt</div>
          <pre className="rounded-md bg-[var(--color-bg-subtle)] shadow-ring-light p-4 text-sm whitespace-pre-wrap break-words font-mono">
            {prompt.prompt_text}
          </pre>
        </section>

        {prompt.negative_prompt && (
          <section className="space-y-2">
            <div className="text-mono-label text-[var(--color-fg-muted)]">Negative prompt</div>
            <pre className="rounded-md bg-[var(--color-bg-subtle)] shadow-ring-light p-4 text-sm whitespace-pre-wrap break-words font-mono">
              {prompt.negative_prompt}
            </pre>
          </section>
        )}

        {prompt.description && (
          <section className="space-y-2">
            <div className="text-mono-label text-[var(--color-fg-muted)]">Descripción</div>
            <p className="text-body text-[var(--color-fg-muted)] whitespace-pre-wrap">{prompt.description}</p>
          </section>
        )}

        <section className="grid grid-cols-2 gap-4 text-sm">
          <Detail label="Modelo" value={prompt.model_name} />
          {prompt.aspect_ratio && <Detail label="Aspect ratio" value={prompt.aspect_ratio} />}
          {prompt.style && <Detail label="Estilo" value={prompt.style} />}
          <Detail label="Visibilidad" value={prompt.visibility} />
        </section>

        {prompt.tags.length > 0 && (
          <section className="space-y-2">
            <div className="text-mono-label text-[var(--color-fg-muted)]">Tags</div>
            <div className="flex flex-wrap gap-1.5">
              {prompt.tags.map((t) => (
                <Link key={t.id} href={`/?tag=${t.slug}`}>
                  <Badge variant="blue">#{t.name}</Badge>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </article>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-mono-label text-[var(--color-fg-muted)]">{label}</div>
      <div className="mt-1">{value}</div>
    </div>
  );
}
