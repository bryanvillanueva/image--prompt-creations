"use client";
import { Suspense, useEffect } from "react";
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
import { loginSchema, type LoginInput } from "@/lib/validators";
import { useAuth } from "@/lib/auth/AuthContext";

function LoginInner() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/";
  const { setUser, isAuthenticated } = useAuth();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const mutation = useMutation({
    mutationFn: (input: LoginInput) => authApi.login(input),
    onSuccess: (res) => {
      setUser(res.data.user);
      toast.success(`¡Bienvenido, ${res.data.user.name}!`);
      router.replace(next);
    },
    onError: (err) => {
      if (err instanceof ApiError) {
        if (err.status === 401) {
          setError("password", { message: err.message });
        } else if (err.status === 422) {
          err.details.forEach((d) => {
            setError(d.field as keyof LoginInput, { message: d.message });
          });
        } else {
          toast.error(err.message);
        }
      } else {
        toast.error("Error de conexión");
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
          <h1 className="text-h2">Iniciar sesión</h1>
          <p className="text-sm text-[var(--color-fg-muted)]">
            Ingresa para subir prompts, dar likes y guardar tu inspiración.
          </p>
        </div>
        <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
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
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              invalid={!!errors.password}
              {...register("password")}
            />
            <FieldError message={errors.password?.message} />
          </div>
          <Button type="submit" className="w-full" loading={mutation.isPending}>
            Iniciar sesión
          </Button>
        </form>
        <div className="text-sm text-[var(--color-fg-muted)] text-center">
          ¿No tienes cuenta?{" "}
          <Link href="/register" className="text-[var(--color-link)] hover:underline">
            Regístrate
          </Link>
        </div>
      </CardBody>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-24"><Spinner /></div>}>
      <LoginInner />
    </Suspense>
  );
}
