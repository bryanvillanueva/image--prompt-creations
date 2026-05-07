"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { ModerationWordForm } from "@/components/admin/ModerationWordForm";
import { adminApi } from "@/lib/api/admin";
import { ApiError } from "@/lib/api/client";
import { qk } from "@/lib/queries/keys";
import { useAuth } from "@/lib/auth/AuthContext";
import { EmptyState as NotAuthorized } from "@/components/ui/EmptyState";
import type { ModerationWord } from "@/lib/types";

export default function ModerationWordsPage() {
  const { role } = useAuth();
  const qc = useQueryClient();
  const [editing, setEditing] = useState<ModerationWord | null>(null);
  const [creating, setCreating] = useState(false);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: qk.admin.modWords,
    queryFn: () => adminApi.modWords(),
    enabled: role === "admin",
  });

  const create = useMutation({
    mutationFn: adminApi.createModWord,
    onSuccess: () => {
      toast.success("Regla creada");
      setCreating(false);
      qc.invalidateQueries({ queryKey: qk.admin.modWords });
    },
    onError: (e) => toast.error(e instanceof ApiError ? e.message : "Error"),
  });

  const update = useMutation({
    mutationFn: ({ id, ...rest }: { id: number } & Parameters<typeof adminApi.updateModWord>[1]) =>
      adminApi.updateModWord(id, rest),
    onSuccess: () => {
      toast.success("Regla actualizada");
      setEditing(null);
      qc.invalidateQueries({ queryKey: qk.admin.modWords });
    },
    onError: (e) => toast.error(e instanceof ApiError ? e.message : "Error"),
  });

  const remove = useMutation({
    mutationFn: (id: number) => adminApi.deleteModWord(id),
    onSuccess: () => {
      toast.success("Regla eliminada");
      qc.invalidateQueries({ queryKey: qk.admin.modWords });
    },
    onError: (e) => toast.error(e instanceof ApiError ? e.message : "Error"),
  });

  if (role !== "admin") {
    return <NotAuthorized title="Solo admin" description="Esta sección solo está disponible para administradores." />;
  }

  const items = data?.data ?? [];

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 className="text-h2">Palabras prohibidas</h2>
          <p className="text-body text-[var(--color-fg-muted)]">
            Reglas que el filtro automático aplica al subir o editar prompts.
          </p>
        </div>
        <Button onClick={() => setCreating(true)}>
          <Plus className="h-4 w-4" /> Nueva regla
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-24"><Spinner className="text-[var(--color-fg-muted)]" /></div>
      ) : error ? (
        <ErrorState onRetry={() => refetch()} />
      ) : items.length === 0 ? (
        <EmptyState title="Sin reglas" description="Crea la primera regla para comenzar." />
      ) : (
        <div className="space-y-2">
          {items.map((w) => (
            <Card key={w.id}>
              <CardBody className="p-4 flex flex-wrap items-center gap-3">
                <code className="font-mono text-sm bg-[var(--color-bg-subtle)] shadow-ring-light px-2 py-1 rounded-md">
                  {w.term}
                </code>
                <Badge variant="neutral">{w.match_type}</Badge>
                <Badge variant={w.severity === "critical" || w.severity === "high" ? "danger" : w.severity === "medium" ? "warning" : "neutral"}>
                  {w.severity}
                </Badge>
                <Badge variant="blue">{w.category}</Badge>
                <Badge variant="dark">{w.action}</Badge>
                {!w.is_active && <Badge variant="neutral">inactiva</Badge>}
                <div className="ml-auto flex gap-2">
                  <Button size="sm" variant="ghost" onClick={() => setEditing(w)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-[var(--color-danger-fg)]"
                    onClick={() => {
                      if (confirm(`¿Eliminar la regla "${w.term}"?`)) remove.mutate(w.id);
                    }}
                    loading={remove.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      <ModerationWordForm
        open={creating}
        onOpenChange={setCreating}
        onSubmit={(input) =>
          create.mutate({
            term: input.term,
            language: input.language || undefined,
            category: input.category,
            severity: input.severity,
            match_type: input.match_type,
            action: input.action,
            is_active: input.is_active,
          })
        }
        loading={create.isPending}
      />

      {editing && (
        <ModerationWordForm
          open={!!editing}
          onOpenChange={(o) => !o && setEditing(null)}
          initial={editing}
          onSubmit={(input) =>
            update.mutate({
              id: editing.id,
              term: input.term,
              language: input.language || undefined,
              category: input.category,
              severity: input.severity,
              match_type: input.match_type,
              action: input.action,
              is_active: input.is_active,
            })
          }
          loading={update.isPending}
        />
      )}
    </div>
  );
}
