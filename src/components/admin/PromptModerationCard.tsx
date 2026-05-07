"use client";
import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, Ban, Eye, EyeOff, AlertCircle } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
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
import { adminApi } from "@/lib/api/admin";
import { ApiError } from "@/lib/api/client";
import { rejectSchema, type RejectInput } from "@/lib/validators";
import { formatDate } from "@/lib/format";
import type { Prompt } from "@/lib/types";

const statusVariant = (s: Prompt["status"]) =>
  s === "approved" ? "success" :
  s === "pending" ? "warning" :
  s === "blocked" ? "danger" :
  s === "rejected" ? "danger" :
  "neutral" as const;

export function PromptModerationCard({ prompt }: { prompt: Prompt }) {
  const qc = useQueryClient();
  const [rejectOpen, setRejectOpen] = React.useState(false);

  const invalidate = () => qc.invalidateQueries({ queryKey: ["admin", "pending"] });

  const approve = useMutation({
    mutationFn: () => adminApi.approve(prompt.id),
    onSuccess: () => { toast.success("Prompt aprobado"); invalidate(); },
    onError: (e) => toast.error(e instanceof ApiError ? e.message : "Error"),
  });

  const block = useMutation({
    mutationFn: () => adminApi.block(prompt.id),
    onSuccess: () => { toast.success("Prompt bloqueado"); invalidate(); },
    onError: (e) => toast.error(e instanceof ApiError ? e.message : "Error"),
  });

  const hide = useMutation({
    mutationFn: () => adminApi.hide(prompt.id),
    onSuccess: () => { toast.success("Prompt oculto"); invalidate(); },
    onError: (e) => toast.error(e instanceof ApiError ? e.message : "Error"),
  });

  const reject = useMutation({
    mutationFn: (input: RejectInput) => adminApi.reject(prompt.id, input.rejection_reason),
    onSuccess: () => {
      toast.success("Prompt rechazado");
      setRejectOpen(false);
      invalidate();
    },
    onError: (e) => toast.error(e instanceof ApiError ? e.message : "Error"),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<RejectInput>({
    resolver: zodResolver(rejectSchema),
    defaultValues: { rejection_reason: "" },
  });

  return (
    <Card>
      <CardBody className="grid md:grid-cols-[200px_1fr] gap-5 p-5">
        <Link href={`/prompts/${prompt.slug}`} target="_blank" className="relative w-full aspect-square rounded-md overflow-hidden bg-[var(--color-bg-subtle)] block">
          {prompt.image?.url && (
            <Image
              src={prompt.image.url}
              alt={prompt.image.alt_text || prompt.title}
              fill
              sizes="200px"
              className="object-cover"
            />
          )}
        </Link>
        <div className="space-y-3 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <Link href={`/prompts/${prompt.slug}`} target="_blank" className="block">
                <h3 className="text-h3 line-clamp-1 hover:underline">{prompt.title}</h3>
              </Link>
              {prompt.author && (
                <Link href={`/u/${prompt.author.username}`} target="_blank" className="inline-flex items-center gap-2 text-xs text-[var(--color-fg-muted)] mt-1 hover:text-[var(--color-fg)]">
                  <Avatar src={prompt.author.avatar_url} name={prompt.author.name} size={20} />
                  @{prompt.author.username}
                </Link>
              )}
            </div>
            <Badge variant={statusVariant(prompt.status)}>{prompt.status}</Badge>
          </div>

          <p className="text-sm text-[var(--color-fg-muted)] line-clamp-3 font-mono">{prompt.prompt_text}</p>

          {prompt.moderation_reason && (
            <div className="rounded-md bg-[var(--color-warning-bg)] text-[var(--color-warning-fg)] p-2 text-xs flex items-start gap-2">
              <AlertCircle className="h-3.5 w-3.5 mt-0.5" />
              <span>Filtro: {prompt.moderation_reason}</span>
            </div>
          )}

          <div className="text-xs text-[var(--color-fg-muted)] flex flex-wrap gap-2">
            <span>{prompt.model_name}</span>
            {prompt.category && <><span>·</span><span>{prompt.category.name}</span></>}
            {prompt.aspect_ratio && <><span>·</span><span>{prompt.aspect_ratio}</span></>}
            <span>·</span><span>{formatDate(prompt.created_at)}</span>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {(prompt.status === "pending" || prompt.status === "blocked") && (
              <Button onClick={() => approve.mutate()} loading={approve.isPending}>
                <CheckCircle2 className="h-4 w-4" /> Aprobar
              </Button>
            )}
            {prompt.status !== "rejected" && (
              <Button variant="secondary" onClick={() => setRejectOpen(true)}>
                <Ban className="h-4 w-4" /> Rechazar
              </Button>
            )}
            {prompt.status !== "blocked" && (
              <Button variant="ghost" onClick={() => block.mutate()} loading={block.isPending}>
                <Ban className="h-4 w-4" /> Bloquear
              </Button>
            )}
            {prompt.status === "approved" && (
              <Button variant="ghost" onClick={() => hide.mutate()} loading={hide.isPending}>
                <EyeOff className="h-4 w-4" /> Ocultar
              </Button>
            )}
            <Link href={`/prompts/${prompt.slug}`} target="_blank">
              <Button variant="ghost">
                <Eye className="h-4 w-4" /> Ver
              </Button>
            </Link>
          </div>
        </div>
      </CardBody>

      <Dialog open={rejectOpen} onOpenChange={(open) => { setRejectOpen(open); if (!open) reset(); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rechazar prompt</DialogTitle>
            <DialogDescription>
              El usuario verá el motivo en su panel. Sé claro y constructivo.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit((d) => reject.mutate(d))} className="space-y-4">
            <div>
              <Label htmlFor="rejection_reason">Motivo</Label>
              <Textarea
                id="rejection_reason"
                rows={4}
                invalid={!!errors.rejection_reason}
                {...register("rejection_reason")}
              />
              <FieldError message={errors.rejection_reason?.message} />
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setRejectOpen(false)}>Cancelar</Button>
              <Button type="submit" loading={reject.isPending} variant="danger">Rechazar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
