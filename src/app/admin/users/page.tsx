"use client";
import { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Search } from "lucide-react";
import { Card, CardBody } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { adminApi } from "@/lib/api/admin";
import { ApiError } from "@/lib/api/client";
import { qk } from "@/lib/queries/keys";
import { useAuth } from "@/lib/auth/AuthContext";
import { formatDate } from "@/lib/format";

export default function AdminUsersPage() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const qc = useQueryClient();
  const { role } = useAuth();
  const isAdmin = role === "admin";

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: qk.admin.users({ q: q || undefined, status: status || undefined }),
    queryFn: () => adminApi.users({ q: q || undefined, status: status || undefined }),
  });

  const suspend = useMutation({
    mutationFn: (id: number) => adminApi.suspendUser(id),
    onSuccess: () => {
      toast.success("Usuario suspendido");
      qc.invalidateQueries({ queryKey: ["admin", "users"] });
    },
    onError: (e) => toast.error(e instanceof ApiError ? e.message : "Error"),
  });

  const items = data?.data ?? [];

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-h2">Usuarios</h2>
        <p className="text-body text-[var(--color-fg-muted)]">Busca, filtra y suspende cuentas si es necesario.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-fg-placeholder)]" />
          <Input
            placeholder="Buscar por nombre, usuario o email"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={status} onChange={(e) => setStatus(e.target.value)} className="md:w-44">
          <option value="">Todos los estados</option>
          <option value="active">Activos</option>
          <option value="suspended">Suspendidos</option>
          <option value="deleted">Eliminados</option>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-24"><Spinner className="text-[var(--color-fg-muted)]" /></div>
      ) : error ? (
        <ErrorState onRetry={() => refetch()} />
      ) : items.length === 0 ? (
        <EmptyState title="Sin usuarios" />
      ) : (
        <div className="space-y-2">
          {items.map((u) => (
            <Card key={u.id}>
              <CardBody className="p-4 flex flex-wrap items-center gap-4">
                <Avatar src={u.avatar_url} name={u.name} size={40} />
                <Link href={`/u/${u.username}`} target="_blank" className="min-w-0 flex-1 hover:underline">
                  <div className="font-medium truncate">{u.name}</div>
                  <div className="text-xs text-[var(--color-fg-muted)] truncate">@{u.username} · {u.email}</div>
                </Link>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="dark">{u.role}</Badge>
                  <Badge variant={u.status === "active" ? "success" : "warning"}>{u.status}</Badge>
                  <Badge variant="neutral">{u.trust_level}</Badge>
                </div>
                <div className="text-xs text-[var(--color-fg-muted)]">{formatDate(u.created_at)}</div>
                {isAdmin && u.status === "active" && u.role !== "admin" && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      if (confirm(`¿Suspender a @${u.username}?`)) suspend.mutate(u.id);
                    }}
                    loading={suspend.isPending}
                  >
                    Suspender
                  </Button>
                )}
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
