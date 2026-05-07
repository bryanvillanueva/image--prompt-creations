"use client";
import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Pencil, Trash2, CheckCircle2, Ban, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { ErrorState } from "@/components/ui/ErrorState";
import { Textarea } from "@/components/ui/Textarea";
import { Label } from "@/components/ui/Label";
import { FieldError } from "@/components/ui/FieldError";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { CopyPromptButton } from "@/components/prompt/CopyPromptButton";
import { LikeButton } from "@/components/prompt/LikeButton";
import { SaveButton } from "@/components/prompt/SaveButton";
import { ReportDialog } from "@/components/prompt/ReportDialog";
import { ModerationBanner } from "@/components/prompt/ModerationBanner";
import { ImageLightbox } from "@/components/gallery/ImageLightbox";
import { promptsApi } from "@/lib/api/prompts";
import { adminApi } from "@/lib/api/admin";
import { ApiError } from "@/lib/api/client";
import { qk } from "@/lib/queries/keys";
import { useAuth } from "@/lib/auth/AuthContext";
import { formatDate, formatNumber } from "@/lib/format";
import { makeRejectSchema, type RejectInput } from "@/lib/validators";
import { useT } from "@/lib/i18n/I18nProvider";

export default function PromptDetailPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const router = useRouter();
  const qc = useQueryClient();
  const { user, role } = useAuth();
  const { t } = useT();
  const rejectSchema = React.useMemo(() => makeRejectSchema(t), [t]);
  const [lightboxOpen, setLightboxOpen] = React.useState(false);
  const [rejectOpen, setRejectOpen] = React.useState(false);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: qk.prompts.bySlug(slug),
    queryFn: () => promptsApi.bySlug(slug),
    retry: 1,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => promptsApi.remove(id),
    onSuccess: () => {
      toast.success(t("promptDetail.deleted"));
      qc.invalidateQueries({ queryKey: qk.prompts.all });
      router.push("/me/prompts");
    },
    onError: (err) => toast.error(err instanceof ApiError ? err.message : t("promptDetail.deleteError")),
  });

  const onModError = (err: unknown) =>
    toast.error(err instanceof ApiError ? err.message : t("common.genericError"));
  const refetchPrompt = () => qc.invalidateQueries({ queryKey: qk.prompts.bySlug(slug) });

  const approve = useMutation({
    mutationFn: (id: number) => adminApi.approve(id),
    onSuccess: () => { toast.success(t("promptDetail.approved")); refetchPrompt(); },
    onError: onModError,
  });
  const block = useMutation({
    mutationFn: (id: number) => adminApi.block(id),
    onSuccess: () => { toast.success(t("promptDetail.blocked")); refetchPrompt(); },
    onError: onModError,
  });
  const hide = useMutation({
    mutationFn: (id: number) => adminApi.hide(id),
    onSuccess: () => { toast.success(t("promptDetail.hidden")); refetchPrompt(); },
    onError: onModError,
  });
  const reject = useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) => adminApi.reject(id, reason),
    onSuccess: () => {
      toast.success(t("promptDetail.rejected"));
      setRejectOpen(false);
      refetchPrompt();
    },
    onError: onModError,
  });

  const rejectForm = useForm<RejectInput>({
    resolver: zodResolver(rejectSchema),
    defaultValues: { rejection_reason: "" },
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
        <ErrorState title={t("promptDetail.notFoundTitle")} message={t("promptDetail.notFound")} />
      );
    }
    return <ErrorState onRetry={() => refetch()} />;
  }

  if (!data) return null;
  const prompt = data.data;
  const isOwner = user?.id === prompt.user_id;
  const isStaff = role === "admin" || role === "moderator";
  const canEdit = isOwner || isStaff;
  const isApproved = prompt.status === "approved";
  const showSocialActions = isApproved;
  const modBusy = approve.isPending || block.isPending || hide.isPending || reject.isPending;

  const aspect = prompt.image?.width && prompt.image?.height
    ? prompt.image.width / prompt.image.height
    : 1;

  return (
    <article className="grid lg:grid-cols-2 gap-8 animate-fade-in">
      <div className="bg-white rounded-xl shadow-card overflow-hidden">
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

      <div className="flex flex-col gap-6 min-w-0">
        {!isApproved && (
          <ModerationBanner
            status={prompt.status}
            reason={prompt.moderation_reason}
            rejectionReason={prompt.rejection_reason}
          />
        )}
        <header className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            {prompt.category && <Badge variant="blue">{prompt.category.name}</Badge>}
            {!isApproved && (
              <Badge
                variant={
                  prompt.status === "pending" ? "warning" :
                  prompt.status === "rejected" || prompt.status === "blocked" ? "danger" :
                  "neutral"
                }
              >
                {t(`promptStatus.${prompt.status}`)}
              </Badge>
            )}
          </div>
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
            <span>{t("promptDetail.views", { count: formatNumber(prompt.views_count) })}</span>
            <span>·</span>
            <span>{t("promptDetail.copies", { count: formatNumber(prompt.copied_count) })}</span>
          </div>
        </header>

        <div className="flex flex-wrap items-center gap-2">
          {showSocialActions && (
            <>
              <CopyPromptButton prompt={prompt} />
              <LikeButton prompt={prompt} />
              <SaveButton prompt={prompt} />
              {!isOwner && <ReportDialog promptId={prompt.id} slug={prompt.slug} />}
            </>
          )}
          {canEdit && (
            <Link href={`/prompts/${prompt.slug}/edit`} className="ml-auto">
              <Button variant="ghost">
                <Pencil className="h-4 w-4" /> {t("common.edit")}
              </Button>
            </Link>
          )}
          {isOwner && (
            <Button
              variant="ghost"
              onClick={() => {
                if (confirm(t("promptDetail.deleteConfirm"))) {
                  deleteMutation.mutate(prompt.id);
                }
              }}
              loading={deleteMutation.isPending}
              className="text-[var(--color-danger-fg)]"
            >
              <Trash2 className="h-4 w-4" /> {t("common.delete")}
            </Button>
          )}
        </div>

        {isStaff && (
          <section className="rounded-md shadow-ring-light p-3 space-y-2">
            <div className="text-mono-label text-[var(--color-fg-muted)]">{t("promptDetail.moderationActions")}</div>
            <div className="flex flex-wrap gap-2">
              {(prompt.status === "pending" || prompt.status === "blocked") && (
                <Button
                  size="sm"
                  onClick={() => approve.mutate(prompt.id)}
                  loading={approve.isPending}
                  disabled={modBusy}
                >
                  <CheckCircle2 className="h-4 w-4" /> {t("promptDetail.approve")}
                </Button>
              )}
              {prompt.status !== "rejected" && (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setRejectOpen(true)}
                  disabled={modBusy}
                >
                  <Ban className="h-4 w-4" /> {t("promptDetail.reject")}
                </Button>
              )}
              {prompt.status !== "blocked" && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => block.mutate(prompt.id)}
                  loading={block.isPending}
                  disabled={modBusy}
                >
                  <Ban className="h-4 w-4" /> {t("promptDetail.block")}
                </Button>
              )}
              {prompt.status === "approved" && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => hide.mutate(prompt.id)}
                  loading={hide.isPending}
                  disabled={modBusy}
                >
                  <EyeOff className="h-4 w-4" /> {t("promptDetail.hide")}
                </Button>
              )}
            </div>
          </section>
        )}

        <section className="space-y-2">
          <div className="text-mono-label text-[var(--color-fg-muted)]">{t("promptDetail.promptLabel")}</div>
          <pre className="rounded-md bg-[var(--color-bg-subtle)] shadow-ring-light p-4 text-sm whitespace-pre-wrap break-words font-mono">
            {prompt.prompt_text}
          </pre>
        </section>

        {prompt.negative_prompt && (
          <section className="space-y-2">
            <div className="text-mono-label text-[var(--color-fg-muted)]">{t("promptDetail.negativeLabel")}</div>
            <pre className="rounded-md bg-[var(--color-bg-subtle)] shadow-ring-light p-4 text-sm whitespace-pre-wrap break-words font-mono">
              {prompt.negative_prompt}
            </pre>
          </section>
        )}

        {prompt.description && (
          <section className="space-y-2">
            <div className="text-mono-label text-[var(--color-fg-muted)]">{t("promptDetail.descriptionLabel")}</div>
            <p className="text-body text-[var(--color-fg-muted)] whitespace-pre-wrap">{prompt.description}</p>
          </section>
        )}

        <section className="grid grid-cols-2 gap-4 text-sm">
          <Detail label={t("promptDetail.modelDetail")} value={prompt.model_name} />
          {prompt.aspect_ratio && <Detail label={t("promptDetail.aspectDetail")} value={prompt.aspect_ratio} />}
          {prompt.style && <Detail label={t("promptDetail.styleDetail")} value={prompt.style} />}
          <Detail label={t("promptDetail.visibilityDetail")} value={t(`visibility.${prompt.visibility}`)} />
        </section>

        {prompt.tags.length > 0 && (
          <section className="space-y-2">
            <div className="text-mono-label text-[var(--color-fg-muted)]">{t("promptDetail.tagsDetail")}</div>
            <div className="flex flex-wrap gap-1.5">
              {prompt.tags.map((tg) => (
                <Link key={tg.id} href={`/?tag=${tg.slug}`}>
                  <Badge variant="blue">#{tg.name}</Badge>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>

      {isStaff && (
        <Dialog
          open={rejectOpen}
          onOpenChange={(open) => { setRejectOpen(open); if (!open) rejectForm.reset(); }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("promptDetail.rejectTitle")}</DialogTitle>
              <DialogDescription>
                {t("promptDetail.rejectDescription")}
              </DialogDescription>
            </DialogHeader>
            <form
              onSubmit={rejectForm.handleSubmit((d) =>
                reject.mutate({ id: prompt.id, reason: d.rejection_reason })
              )}
              className="space-y-4"
            >
              <div>
                <Label htmlFor="rejection_reason">{t("promptDetail.rejectReasonLabel")}</Label>
                <Textarea
                  id="rejection_reason"
                  rows={4}
                  invalid={!!rejectForm.formState.errors.rejection_reason}
                  {...rejectForm.register("rejection_reason")}
                />
                <FieldError message={rejectForm.formState.errors.rejection_reason?.message} />
              </div>
              <DialogFooter>
                <Button type="button" variant="ghost" onClick={() => setRejectOpen(false)}>
                  {t("common.cancel")}
                </Button>
                <Button type="submit" loading={reject.isPending} variant="danger">
                  {t("promptDetail.reject")}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
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
