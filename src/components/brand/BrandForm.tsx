"use client";
import * as React from "react";
import { useForm, Controller, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Label } from "@/components/ui/Label";
import { FieldError } from "@/components/ui/FieldError";
import { ColorListInput } from "./ColorListInput";
import { TypographyInput } from "./TypographyInput";
import { brandsApi, type BrandPayload } from "@/lib/api/brands";
import { ApiError } from "@/lib/api/client";
import { qk } from "@/lib/queries/keys";
import { makeBrandFormSchema, type BrandFormValues } from "@/lib/validators";
import type { Brand } from "@/lib/types";
import { useT } from "@/lib/i18n/I18nProvider";

interface BrandFormProps {
  initial?: Brand;
}

export function BrandForm({ initial }: BrandFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isEditing = !!initial;
  const { t } = useT();
  const schema = React.useMemo(() => makeBrandFormSchema(t), [t]);

  const {
    register,
    handleSubmit,
    setError,
    control,
    formState: { errors, isSubmitting },
  } = useForm<BrandFormValues>({
    resolver: zodResolver(schema) as Resolver<BrandFormValues>,
    defaultValues: {
      name: initial?.name ?? "",
      description: initial?.description ?? "",
      industry: initial?.industry ?? "",
      tone_of_voice: initial?.tone_of_voice ?? "",
      slogan: initial?.slogan ?? "",
      typography: initial?.typography
        ? Object.entries(initial.typography).map(([role, font]) => ({ role, font }))
        : [],
      primary_colors: initial?.primary_colors ?? [],
      secondary_colors: initial?.secondary_colors ?? [],
    },
  });

  const mutation = useMutation({
    mutationFn: (input: BrandFormValues) => {
      const typography = input.typography.length
        ? Object.fromEntries(input.typography.map((e) => [e.role.trim(), e.font.trim()]))
        : null;
      const payload: BrandPayload = {
        name: input.name.trim(),
        description: input.description?.trim() || null,
        industry: input.industry?.trim() || null,
        tone_of_voice: input.tone_of_voice?.trim() || null,
        slogan: input.slogan?.trim() || null,
        typography,
        primary_colors: input.primary_colors.length ? input.primary_colors : null,
        secondary_colors: input.secondary_colors.length ? input.secondary_colors : null,
      };
      return isEditing && initial
        ? brandsApi.update(initial.id, payload)
        : brandsApi.create(payload);
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: qk.brands.all });
      toast.success(isEditing ? t("brands.formSaved") : t("brands.formCreated"));
      router.push(`/brands/${res.data.id}`);
    },
    onError: (err) => {
      if (err instanceof ApiError) {
        if (err.status === 422) {
          err.details.forEach((d) => {
            setError(d.field as keyof BrandFormValues, { message: d.message });
          });
          toast.error(err.message);
        } else if (err.status === 409) {
          toast.error(t("brands.limitReached"));
        } else if (err.status === 401) {
          router.push("/login?next=/brands");
        } else {
          toast.error(err.message);
        }
      } else {
        toast.error(t("common.connectionError"));
      }
    },
  });

  return (
    <form
      onSubmit={handleSubmit((data) => mutation.mutate(data))}
      className="grid lg:grid-cols-[minmax(0,1fr)_360px] gap-6 animate-fade-in"
    >
      <div className="space-y-5">
        <div>
          <Label htmlFor="name">{t("brands.nameLabel")}</Label>
          <Input id="name" placeholder={t("brands.namePlaceholder")} invalid={!!errors.name} {...register("name")} />
          <FieldError message={errors.name?.message} />
        </div>

        <div>
          <Label htmlFor="description">{t("brands.descriptionLabel")}</Label>
          <Textarea
            id="description"
            rows={4}
            placeholder={t("brands.descriptionPlaceholder")}
            invalid={!!errors.description}
            {...register("description")}
          />
          <p className="text-xs text-[var(--color-fg-muted)] mt-1">{t("brands.descriptionHint")}</p>
          <FieldError message={errors.description?.message} />
        </div>

        <div>
          <Label htmlFor="tone_of_voice">{t("brands.toneLabel")}</Label>
          <Input
            id="tone_of_voice"
            placeholder={t("brands.tonePlaceholder")}
            invalid={!!errors.tone_of_voice}
            {...register("tone_of_voice")}
          />
          <FieldError message={errors.tone_of_voice?.message} />
        </div>

        <div>
          <Label htmlFor="slogan">{t("brands.sloganLabel")}</Label>
          <Input id="slogan" placeholder={t("brands.sloganPlaceholder")} invalid={!!errors.slogan} {...register("slogan")} />
          <FieldError message={errors.slogan?.message} />
        </div>

        <div>
          <Label>{t("brands.typographyLabel")}</Label>
          <Controller
            control={control}
            name="typography"
            render={({ field, fieldState }) => (
              <TypographyInput value={field.value} onChange={field.onChange} invalid={!!fieldState.error} />
            )}
          />
          <p className="text-xs text-[var(--color-fg-muted)] mt-1">{t("brands.typographyHint")}</p>
          <FieldError message={errors.typography?.message as string | undefined} />
        </div>
      </div>

      <aside className="space-y-5 lg:sticky lg:top-20 lg:self-start">
        <div>
          <Label htmlFor="industry">{t("brands.industryLabel")}</Label>
          <Input id="industry" placeholder={t("brands.industryPlaceholder")} invalid={!!errors.industry} {...register("industry")} />
          <FieldError message={errors.industry?.message} />
        </div>

        <div>
          <Label>{t("brands.primaryColorsLabel")}</Label>
          <Controller
            control={control}
            name="primary_colors"
            render={({ field, fieldState }) => (
              <ColorListInput value={field.value} onChange={field.onChange} invalid={!!fieldState.error} />
            )}
          />
          <FieldError message={errors.primary_colors?.message as string | undefined} />
        </div>

        <div>
          <Label>{t("brands.secondaryColorsLabel")}</Label>
          <Controller
            control={control}
            name="secondary_colors"
            render={({ field, fieldState }) => (
              <ColorListInput value={field.value} onChange={field.onChange} invalid={!!fieldState.error} />
            )}
          />
          <FieldError message={errors.secondary_colors?.message as string | undefined} />
        </div>

        <div className="bg-[var(--color-bg-subtle)] shadow-ring-light rounded-md p-3 text-xs text-[var(--color-fg-muted)]">
          {t("brands.formNotice")}
        </div>

        <Button type="submit" loading={isSubmitting || mutation.isPending} className="w-full">
          {isEditing ? t("brands.submitEdit") : t("brands.submitCreate")}
        </Button>
      </aside>
    </form>
  );
}
