"use client";
import { Suspense, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { FieldError } from "@/components/ui/FieldError";
import { Card, CardBody } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { authApi } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import { makeRegisterSchema, type RegisterInput } from "@/lib/validators";
import { useAuth } from "@/lib/auth/AuthContext";
import { useT } from "@/lib/i18n/I18nProvider";

function RegisterInner() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/";
  const { setUser, isAuthenticated } = useAuth();
  const { t } = useT();
  const schema = useMemo(() => makeRegisterSchema(t), [t]);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", username: "", email: "", password: "" },
  });

  const mutation = useMutation({
    mutationFn: (input: RegisterInput) => authApi.register(input),
    onSuccess: (res) => {
      setUser(res.data.user);
      toast.success(t("auth.register.success"));
      router.replace(next);
    },
    onError: (err) => {
      if (err instanceof ApiError) {
        if (err.status === 409) {
          if (err.message.toLowerCase().includes("email")) {
            setError("email", { message: err.message });
          } else if (
            err.message.toLowerCase().includes("usuario") ||
            err.message.toLowerCase().includes("username")
          ) {
            setError("username", { message: err.message });
          } else {
            toast.error(err.message);
          }
        } else if (err.status === 422) {
          err.details.forEach((d) => {
            setError(d.field as keyof RegisterInput, { message: d.message });
          });
        } else if (err.status === 429) {
          toast.error(t("auth.register.tooMany"));
        } else {
          toast.error(err.message);
        }
      } else {
        toast.error(t("common.connectionError"));
      }
    },
  });

  useEffect(() => {
    if (isAuthenticated) router.replace(next);
  }, [isAuthenticated, next, router]);

  return (
    <Card className="animate-fade-in">
      <CardBody className="p-8 space-y-5">
        <div className="space-y-1">
          <h1 className="text-h2">{t("auth.register.title")}</h1>
          <p className="text-sm text-[var(--color-fg-muted)]">
            {t("auth.register.lead")}
          </p>
        </div>
        <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
          <div>
            <Label htmlFor="name">{t("auth.register.name")}</Label>
            <Input id="name" autoComplete="name" invalid={!!errors.name} {...register("name")} />
            <FieldError message={errors.name?.message} />
          </div>
          <div>
            <Label htmlFor="username">{t("auth.register.username")}</Label>
            <Input
              id="username"
              autoComplete="username"
              placeholder={t("auth.register.usernamePlaceholder")}
              invalid={!!errors.username}
              {...register("username")}
            />
            <FieldError message={errors.username?.message} />
          </div>
          <div>
            <Label htmlFor="email">{t("auth.register.email")}</Label>
            <Input id="email" type="email" autoComplete="email" invalid={!!errors.email} {...register("email")} />
            <FieldError message={errors.email?.message} />
          </div>
          <div>
            <Label htmlFor="password">{t("auth.register.password")}</Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              invalid={!!errors.password}
              {...register("password")}
            />
            <FieldError message={errors.password?.message} />
          </div>
          <p className="text-xs text-[var(--color-fg-muted)]">
            {t("auth.register.agreePrefix")}{" "}
            <Link href="/rules" className="text-[var(--color-link)] hover:underline">
              {t("auth.register.rulesLink")}
            </Link>{" "}
            {t("auth.register.andText")}{" "}
            <Link href="/terms" className="text-[var(--color-link)] hover:underline">
              {t("auth.register.termsLink")}
            </Link>
            .
          </p>
          <Button type="submit" className="w-full" loading={mutation.isPending}>
            {t("auth.register.submit")}
          </Button>
        </form>
        <div className="text-sm text-[var(--color-fg-muted)] text-center">
          {t("auth.register.hasAccount")}{" "}
          <Link href="/login" className="text-[var(--color-link)] hover:underline">
            {t("auth.register.login")}
          </Link>
        </div>
      </CardBody>
    </Card>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-24"><Spinner /></div>}>
      <RegisterInner />
    </Suspense>
  );
}
