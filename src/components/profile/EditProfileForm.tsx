"use client";
import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import { FieldError } from "@/components/ui/FieldError";
import { ImageUploader } from "@/components/prompt/ImageUploader";
import { authApi, type UpdateProfileInput } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import { useAuth } from "@/lib/auth/AuthContext";
import { useT } from "@/lib/i18n/I18nProvider";
import { makeProfileUpdateSchema, type ProfileUpdateInput } from "@/lib/validators";
import type { PublicUser } from "@/lib/types";

interface Props {
  onClose: () => void;
}

export function EditProfileForm({ onClose }: Props) {
  const { user, setUser } = useAuth();
  const { t } = useT();
  const schema = React.useMemo(() => makeProfileUpdateSchema(t), [t]);

  const [avatarFile, setAvatarFile] = React.useState<File | null>(null);
  const [removeExistingAvatar, setRemoveExistingAvatar] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);

  const defaults = React.useMemo<ProfileUpdateInput>(
    () => ({
      name: user?.name ?? "",
      username: user?.username ?? "",
      email: user?.email ?? "",
      bio: user?.bio ?? "",
    }),
    [user],
  );

  const {
    register,
    handleSubmit,
    setError,
    watch,
    formState: { errors },
  } = useForm<ProfileUpdateInput>({
    resolver: zodResolver(schema),
    defaultValues: defaults,
  });

  const bioValue = watch("bio") ?? "";
  const hasExistingAvatar = !!user?.avatar_url;
  const initialPreview = removeExistingAvatar ? null : user?.avatar_url ?? null;

  const handleApiError = (err: unknown, ctx: "patch" | "avatar") => {
    if (err instanceof ApiError) {
      if (err.status === 409) {
        const msg = err.message.toLowerCase();
        if (msg.includes("email")) {
          setError("email", { message: t("me.emailTaken") });
        } else if (msg.includes("user")) {
          setError("username", { message: t("me.usernameTaken") });
        } else {
          toast.error(err.message);
        }
      } else if (err.status === 422) {
        err.details.forEach((d) => {
          setError(d.field as keyof ProfileUpdateInput, { message: d.message });
        });
        if (err.details.length === 0) toast.error(err.message);
      } else if (err.status === 400 && ctx === "patch") {
        toast.error(t("me.noChanges"));
      } else if (err.status === 413) {
        toast.error(t("apiErrors.e413"));
      } else if (err.status === 415) {
        toast.error(t("apiErrors.e415"));
      } else {
        toast.error(err.message);
      }
    } else {
      toast.error(t("common.connectionError"));
    }
  };

  const onSubmit = async (values: ProfileUpdateInput) => {
    if (!user) return;

    const payload: UpdateProfileInput = {};
    const trimmedName = values.name.trim();
    const trimmedUsername = values.username.trim();
    const trimmedEmail = values.email.trim();
    const trimmedBio = values.bio.trim();

    if (trimmedName !== user.name) payload.name = trimmedName;
    if (trimmedUsername !== user.username) payload.username = trimmedUsername;
    if (trimmedEmail !== user.email) payload.email = trimmedEmail;

    const currentBio = user.bio ?? "";
    if (trimmedBio !== currentBio) {
      payload.bio = trimmedBio === "" ? null : trimmedBio;
    }

    const hasTextChanges = Object.keys(payload).length > 0;
    const hasAvatarChange = !!avatarFile || (removeExistingAvatar && hasExistingAvatar);

    if (!hasTextChanges && !hasAvatarChange) {
      toast.info(t("me.noChanges"));
      return;
    }

    setSubmitting(true);
    let latest: PublicUser | null = null;

    try {
      if (avatarFile) {
        const res = await authApi.uploadAvatar(avatarFile);
        latest = res.data.user;
      } else if (removeExistingAvatar && hasExistingAvatar) {
        const res = await authApi.deleteAvatar();
        latest = res.data.user;
      }
    } catch (err) {
      handleApiError(err, "avatar");
      setSubmitting(false);
      return;
    }

    if (hasTextChanges) {
      try {
        const res = await authApi.updateMe(payload);
        latest = res.data.user;
      } catch (err) {
        if (latest) setUser(latest);
        handleApiError(err, "patch");
        setSubmitting(false);
        return;
      }
    }

    if (latest) setUser(latest);
    toast.success(t("me.profileUpdated"));
    setSubmitting(false);
    onClose();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="space-y-1">
        <h2 className="text-h3">{t("me.editProfileTitle")}</h2>
        <p className="text-sm text-[var(--color-fg-muted)]">{t("me.editProfileLead")}</p>
      </div>

      <div>
        <Label>{t("me.fieldAvatar")}</Label>
        <ImageUploader
          value={avatarFile}
          initialUrl={initialPreview}
          onChange={(file) => {
            setAvatarFile(file);
            if (file) setRemoveExistingAvatar(false);
          }}
        />
        <p className="text-xs text-[var(--color-fg-muted)] mt-1">{t("me.fieldAvatarHint")}</p>
        {hasExistingAvatar && !avatarFile && (
          removeExistingAvatar ? (
            <div className="flex items-center justify-between gap-2 mt-2">
              <span className="text-xs text-[var(--color-danger-fg)]">
                {t("me.avatarMarkedForRemoval")}
              </span>
              <Button
                type="button"
                variant="link"
                size="sm"
                onClick={() => setRemoveExistingAvatar(false)}
              >
                {t("me.undoRemoveAvatar")}
              </Button>
            </div>
          ) : (
            <Button
              type="button"
              variant="link"
              size="sm"
              className="mt-2"
              onClick={() => setRemoveExistingAvatar(true)}
            >
              {t("me.removeAvatar")}
            </Button>
          )
        )}
      </div>

      <div>
        <Label htmlFor="name">{t("me.fieldName")}</Label>
        <Input id="name" autoComplete="name" invalid={!!errors.name} {...register("name")} />
        <FieldError message={errors.name?.message} />
      </div>

      <div>
        <Label htmlFor="username">{t("me.fieldUsername")}</Label>
        <Input
          id="username"
          autoComplete="username"
          invalid={!!errors.username}
          {...register("username")}
        />
        <FieldError message={errors.username?.message} />
      </div>

      <div>
        <Label htmlFor="email">{t("me.fieldEmail")}</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          invalid={!!errors.email}
          {...register("email")}
        />
        <FieldError message={errors.email?.message} />
      </div>

      <div>
        <Label htmlFor="bio">{t("me.fieldBio")}</Label>
        <Textarea
          id="bio"
          rows={4}
          placeholder={t("me.fieldBioPlaceholder")}
          invalid={!!errors.bio}
          {...register("bio")}
        />
        <div className="flex justify-between mt-1">
          <FieldError message={errors.bio?.message} />
          <span className="text-xs text-[var(--color-fg-muted)] ml-auto">
            {t("me.bioCounter", { count: bioValue.length })}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 pt-2">
        <Button type="button" variant="ghost" onClick={onClose} disabled={submitting}>
          {t("common.cancel")}
        </Button>
        <Button type="submit" loading={submitting}>
          {t("common.save")}
        </Button>
      </div>
    </form>
  );
}
