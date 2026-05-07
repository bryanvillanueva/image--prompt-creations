"use client";
import { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Card, CardBody } from "@/components/ui/Card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { adminApi } from "@/lib/api/admin";
import { ApiError } from "@/lib/api/client";
import { qk } from "@/lib/queries/keys";
import { formatDate } from "@/lib/format";
import { REPORT_REASONS } from "@/lib/constants";

const STATUSES: { value: string; label: string }[] = [
  { value: "pending", label: "Pendientes" },
  { value: "resolved", label: "Resueltos" },
  { value: "dismissed", label: "Descartados" },
];

export default function ReportsPage() {
  const [status, setStatus] = useState("pending");
  const qc = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: qk.admin.reports({ status }),
    queryFn: () => adminApi.reports({ status }),
  });

  const resolve = useMutation({
    mutationFn: ({ id, status }: { id: number; status: "resolved" | "dismissed" }) =>
      adminApi.resolveReport(id, status),
    onSuccess: () => {
      toast.success("Reporte actualizado");
      qc.invalidateQueries({ queryKey: ["admin", "reports"] });
    },
    onError: (e) => toast.error(e instanceof ApiError ? e.message : "Error"),
  });

  const items = data?.data ?? [];

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-h2">Reportes</h2>
        <p className="text-body text-[var(--color-fg-muted)]">Revisa el contenido reportado por la comunidad.</p>
      </div>
      <Tabs value={status} onValueChange={setStatus}>
        <TabsList>
          {STATUSES.map((s) => (
            <TabsTrigger key={s.value} value={s.value}>{s.label}</TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {isLoading ? (
        <div className="flex justify-center py-24"><Spinner className="text-[var(--color-fg-muted)]" /></div>
      ) : error ? (
        <ErrorState onRetry={() => refetch()} />
      ) : items.length === 0 ? (
        <EmptyState title="Sin reportes" description="No hay reportes en este estado." />
      ) : (
        <div className="space-y-3">
          {items.map((r) => {
            const reasonLabel = REPORT_REASONS.find((x) => x.value === r.reason)?.label ?? r.reason;
            return (
              <Card key={r.id}>
                <CardBody className="p-5 space-y-3">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="warning">{reasonLabel}</Badge>
                        <Badge variant="neutral">{r.status}</Badge>
                        <span className="text-xs text-[var(--color-fg-muted)]">{formatDate(r.created_at)}</span>
                      </div>
                      {r.prompt_title && (
                        <Link
                          href={`/prompts/${r.prompt_slug}`}
                          target="_blank"
                          className="text-h3 mt-2 hover:underline block truncate"
                        >
                          {r.prompt_title}
                        </Link>
                      )}
                      {r.reporter_username && (
                        <div className="text-xs text-[var(--color-fg-muted)] mt-1">
                          Reportado por @{r.reporter_username}
                        </div>
                      )}
                    </div>
                    {r.status === "pending" && (
                      <div className="flex gap-2 shrink-0">
                        <Button size="sm" onClick={() => resolve.mutate({ id: r.id, status: "resolved" })} loading={resolve.isPending}>
                          Resolver
                        </Button>
                        <Button size="sm" variant="secondary" onClick={() => resolve.mutate({ id: r.id, status: "dismissed" })} loading={resolve.isPending}>
                          Descartar
                        </Button>
                      </div>
                    )}
                  </div>
                  {r.description && (
                    <p className="text-sm text-[var(--color-fg-muted)] bg-[var(--color-bg-subtle)] rounded-md p-3 shadow-ring-light">
                      {r.description}
                    </p>
                  )}
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
