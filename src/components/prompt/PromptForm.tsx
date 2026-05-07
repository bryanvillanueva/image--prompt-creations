"use client";
import * as React from "react";
import { useForm, Controller, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Label } from "@/components/ui/Label";
import { FieldError } from "@/components/ui/FieldError";
import { ImageUploader } from "./ImageUploader";
import { TagInput } from "./TagInput";
import { taxonomiesApi } from "@/lib/api/taxonomies";
import { promptsApi } from "@/lib/api/prompts";
import { ApiError } from "@/lib/api/client";
import { qk } from "@/lib/queries/keys";
import { promptFormSchema, type PromptFormValues } from "@/lib/validators";
import { ASPECT_RATIOS, MODELS, VISIBILITY_OPTIONS } from "@/lib/constants";
import type { Prompt } from "@/lib/types";

interface PromptFormProps {
  initial?: Prompt;
}

export function PromptForm({ initial }: PromptFormProps) {
  const router = useRouter();
  const isEditing = !!initial;

  const { data: categories } = useQuery({
    queryKey: qk.taxonomies.categories,
    queryFn: () => taxonomiesApi.categories().then((r) => r.data),
    staleTime: 5 * 60_000,
  });

  const {
    register,
    handleSubmit,
    setError,
    control,
    formState: { errors, isSubmitting },
  } = useForm<PromptFormValues>({
    resolver: zodResolver(promptFormSchema) as Resolver<PromptFormValues>,
    defaultValues: {
      title: initial?.title ?? "",
      prompt_text: initial?.prompt_text ?? "",
      negative_prompt: initial?.negative_prompt ?? "",
      category_id: initial?.category_id ?? undefined,
      model_name: initial?.model_name ?? "",
      aspect_ratio: initial?.aspect_ratio ?? "",
      style: initial?.style ?? "",
      description: initial?.description ?? "",
      visibility: initial?.visibility ?? "public",
      tags: initial?.tags?.map((t) => t.name) ?? [],
      alt_text: initial?.image?.alt_text ?? "",
      image: undefined,
    },
  });

  const mutation = useMutation({
    mutationFn: (input: PromptFormValues) => {
      const fd = new FormData();
      if (input.image) fd.append("image", input.image);
      fd.append("title", input.title);
      fd.append("prompt_text", input.prompt_text);
      if (input.negative_prompt) fd.append("negative_prompt", input.negative_prompt);
      fd.append("category_id", String(input.category_id));
      fd.append("model_name", input.model_name);
      if (input.aspect_ratio) fd.append("aspect_ratio", input.aspect_ratio);
      if (input.style) fd.append("style", input.style);
      if (input.description) fd.append("description", input.description);
      fd.append("visibility", input.visibility);
      fd.append("tags", JSON.stringify(input.tags ?? []));
      if (input.alt_text) fd.append("alt_text", input.alt_text);
      return isEditing && initial
        ? promptsApi.update(initial.id, fd)
        : promptsApi.create(fd);
    },
    onSuccess: (res) => {
      const action = res.meta?.moderation?.action;
      const label =
        action === "block"
          ? "El prompt fue bloqueado por el filtro automático. Un moderador lo revisará."
          : action === "needs_review" || action === "flag"
          ? "Tu prompt fue enviado a revisión."
          : isEditing
          ? "Cambios guardados. Tu prompt vuelve a revisión."
          : "Prompt enviado. Pronto un moderador lo revisará.";
      toast.success(label);
      router.push(`/prompts/${res.data.slug}`);
    },
    onError: (err) => {
      if (err instanceof ApiError) {
        if (err.status === 422) {
          err.details.forEach((d) => {
            setError(d.field as keyof PromptFormValues, { message: d.message });
          });
          toast.error(err.message);
        } else if (err.status === 413) {
          setError("image", { message: "La imagen supera los 3 MB." });
        } else if (err.status === 415) {
          setError("image", { message: "Formato no soportado." });
        } else if (err.status === 429) {
          toast.error("Has alcanzado tu cuota diaria de subidas.");
        } else if (err.status === 401) {
          router.push("/login?next=/prompts/new");
        } else {
          toast.error(err.message);
        }
      } else {
        toast.error("Error de conexión");
      }
    },
  });

  const onSubmit = (data: PromptFormValues) => {
    if (!isEditing && !data.image) {
      setError("image", { message: "Selecciona una imagen" });
      return;
    }
    mutation.mutate(data);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="grid lg:grid-cols-[minmax(0,1fr)_360px] gap-6 animate-fade-in"
    >
      <div className="space-y-5">
        <Controller
          control={control}
          name="image"
          render={({ field, fieldState }) => (
            <ImageUploader
              value={field.value as File | null | undefined}
              initialUrl={initial?.image?.url ?? null}
              onChange={(file) => field.onChange(file ?? undefined)}
              invalid={!!fieldState.error}
              errorMessage={fieldState.error?.message}
            />
          )}
        />

        <div>
          <Label htmlFor="title">Título *</Label>
          <Input id="title" invalid={!!errors.title} {...register("title")} />
          <FieldError message={errors.title?.message} />
        </div>

        <div>
          <Label htmlFor="prompt_text">Prompt *</Label>
          <Textarea
            id="prompt_text"
            rows={6}
            placeholder="Describe lo que el modelo debería generar…"
            invalid={!!errors.prompt_text}
            {...register("prompt_text")}
          />
          <FieldError message={errors.prompt_text?.message} />
        </div>

        <div>
          <Label htmlFor="negative_prompt">Negative prompt</Label>
          <Textarea id="negative_prompt" rows={3} {...register("negative_prompt")} />
          <FieldError message={errors.negative_prompt?.message} />
        </div>

        <div>
          <Label htmlFor="description">Descripción</Label>
          <Textarea id="description" rows={3} {...register("description")} />
          <FieldError message={errors.description?.message} />
        </div>

        <div>
          <Label htmlFor="alt_text">Texto alternativo (accesibilidad)</Label>
          <Input id="alt_text" {...register("alt_text")} />
          <FieldError message={errors.alt_text?.message} />
        </div>
      </div>

      <aside className="space-y-5 lg:sticky lg:top-20 lg:self-start">
        <div>
          <Label htmlFor="category_id">Categoría *</Label>
          <Select id="category_id" invalid={!!errors.category_id} {...register("category_id", { valueAsNumber: true })}>
            <option value="">Selecciona una categoría</option>
            {categories?.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </Select>
          <FieldError message={errors.category_id?.message} />
        </div>

        <div>
          <Label htmlFor="model_name">Modelo *</Label>
          <Select id="model_name" invalid={!!errors.model_name} {...register("model_name")}>
            <option value="">Selecciona un modelo</option>
            {MODELS.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </Select>
          <FieldError message={errors.model_name?.message} />
        </div>

        <div>
          <Label htmlFor="aspect_ratio">Aspect ratio</Label>
          <Select id="aspect_ratio" {...register("aspect_ratio")}>
            <option value="">—</option>
            {ASPECT_RATIOS.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </Select>
          <FieldError message={errors.aspect_ratio?.message} />
        </div>

        <div>
          <Label htmlFor="style">Estilo visual</Label>
          <Input id="style" placeholder="ej: cinematic, anime…" {...register("style")} />
          <FieldError message={errors.style?.message} />
        </div>

        <div>
          <Label htmlFor="visibility">Visibilidad</Label>
          <Select id="visibility" {...register("visibility")}>
            {VISIBILITY_OPTIONS.map((v) => (
              <option key={v.value} value={v.value}>{v.label}</option>
            ))}
          </Select>
        </div>

        <div>
          <Label>Tags</Label>
          <Controller
            control={control}
            name="tags"
            render={({ field, fieldState }) => (
              <TagInput
                value={field.value ?? []}
                onChange={field.onChange}
                invalid={!!fieldState.error}
              />
            )}
          />
          <FieldError message={errors.tags?.message as string | undefined} />
        </div>

        <div className="bg-[var(--color-bg-subtle)] shadow-ring-light rounded-md p-3 text-xs text-[var(--color-fg-muted)]">
          Los prompts se publican tras una revisión manual. Asegúrate de cumplir las
          reglas de comunidad para evitar bloqueos.
        </div>

        <Button type="submit" loading={isSubmitting || mutation.isPending} className="w-full">
          {isEditing ? "Guardar cambios" : "Publicar prompt"}
        </Button>
      </aside>
    </form>
  );
}
