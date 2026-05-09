"use client";
import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { FieldError } from "@/components/ui/FieldError";
import { authApi } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import { useT } from "@/lib/i18n/I18nProvider";
import {
  makeChangePasswordSchema,
  type ChangePasswordInput,
} from "@/lib/validators";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ChangePasswordDialog({ open, onOpenChange }: Props) {
  const { t } = useT();
  const schema = React.useMemo(() => makeChangePasswordSchema(t), [t]);

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordInput>({
    resolver: zodResolver(schema),
    defaultValues: { current_password: "", new_password: "", confirm_password: "" },
  });

  React.useEffect(() => {
    if (!open) reset({ current_password: "", new_password: "", confirm_password: "" });
  }, [open, reset]);

  const mutation = useMutation({
    mutationFn: (input: ChangePasswordInput) =>
      authApi.changePassword({
        current_password: input.current_password,
        new_password: input.new_password,
      }),
    onSuccess: () => {
      toast.success(t("me.passwordChanged"));
      onOpenChange(false);
    },
    onError: (err) => {
      if (err instanceof ApiError) {
        if (err.status === 401) {
          setError("current_password", { message: t("me.currentPasswordWrong") });
        } else if (err.status === 400) {
          setError("new_password", { message: t("validation.passwordSameAsCurrent") });
        } else if (err.status === 422) {
          if (err.details.length > 0) {
            err.details.forEach((d) => {
              const field = (
                d.field === "new_password" || d.field === "current_password"
                  ? d.field
                  : "new_password"
              ) as keyof ChangePasswordInput;
              setError(field, { message: d.message });
            });
          } else {
            setError("new_password", { message: err.message });
          }
        } else {
          toast.error(err.message);
        }
      } else {
        toast.error(t("common.connectionError"));
      }
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("me.changePasswordTitle")}</DialogTitle>
          <DialogDescription>{t("me.changePasswordLead")}</DialogDescription>
        </DialogHeader>
        <form
          onSubmit={handleSubmit((d) => mutation.mutate(d))}
          className="space-y-4"
          noValidate
        >
          <div>
            <Label htmlFor="current_password">{t("me.currentPassword")}</Label>
            <Input
              id="current_password"
              type="password"
              autoComplete="current-password"
              invalid={!!errors.current_password}
              {...register("current_password")}
            />
            <FieldError message={errors.current_password?.message} />
          </div>

          <div>
            <Label htmlFor="new_password">{t("me.newPassword")}</Label>
            <Input
              id="new_password"
              type="password"
              autoComplete="new-password"
              invalid={!!errors.new_password}
              {...register("new_password")}
            />
            <p className="text-xs text-[var(--color-fg-muted)] mt-1">
              {t("me.passwordRules")}
            </p>
            <FieldError message={errors.new_password?.message} />
          </div>

          <div>
            <Label htmlFor="confirm_password">{t("me.confirmPassword")}</Label>
            <Input
              id="confirm_password"
              type="password"
              autoComplete="new-password"
              invalid={!!errors.confirm_password}
              {...register("confirm_password")}
            />
            <FieldError message={errors.confirm_password?.message} />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={mutation.isPending}
            >
              {t("common.cancel")}
            </Button>
            <Button type="submit" loading={mutation.isPending}>
              {t("common.save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
