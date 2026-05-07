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
import type { PublicUser, Role } from "@/lib/types";
import { useT, type TFn } from "@/lib/i18n/I18nProvider";

type Mut = {
  suspend: (id: number) => void;
  reactivate: (id: number) => void;
  changeRole: (id: number, role: Role) => void;
  changeLimit: (id: number, limit: number) => void;
  isPending: boolean;
};

function UserRow({
  u,
  currentUserId,
  mut,
  t,
}: {
  u: PublicUser;
  currentUserId: number | undefined;
  mut: Mut;
  t: TFn;
}) {
  const [newRole, setNewRole] = useState<Role>(u.role);
  const [limitStr, setLimitStr] = useState(String(u.upload_limit_per_day));
  const limitNum = Number(limitStr);
  const limitValid = limitNum >= 1 && limitNum <= 1000;

  return (
    <Card>
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

        <div className="flex items-center gap-2 flex-wrap">
          {u.status === "active" && u.role !== "admin" && (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => { if (confirm(t("admin.userSuspendConfirm", { username: u.username }))) mut.suspend(u.id); }}
              loading={mut.isPending}
            >
              {t("admin.userSuspend")}
            </Button>
          )}
          {u.status === "suspended" && (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => { if (confirm(t("admin.userReactivateConfirm", { username: u.username }))) mut.reactivate(u.id); }}
              loading={mut.isPending}
            >
              {t("admin.userReactivate")}
            </Button>
          )}
          {u.id !== currentUserId && (
            <div className="flex items-center gap-1">
              <Select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as Role)}
                className="h-8 text-sm py-0"
              >
                <option value="user">user</option>
                <option value="moderator">moderator</option>
                <option value="admin">admin</option>
              </Select>
              <Button
                size="sm"
                variant="secondary"
                disabled={newRole === u.role || mut.isPending}
                onClick={() => mut.changeRole(u.id, newRole)}
                loading={mut.isPending}
              >
                {t("admin.userRoleBtn")}
              </Button>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Input
              type="number"
              value={limitStr}
              onChange={(e) => setLimitStr(e.target.value)}
              className="h-8 w-20 text-sm"
            />
            <Button
              size="sm"
              variant="secondary"
              disabled={!limitValid || limitNum === u.upload_limit_per_day || mut.isPending}
              onClick={() => mut.changeLimit(u.id, limitNum)}
              loading={mut.isPending}
            >
              {t("admin.userLimitBtn")}
            </Button>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

export default function AdminUsersPage() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const qc = useQueryClient();
  const { role, user: currentUser } = useAuth();
  const { t } = useT();
  const isAdmin = role === "admin";

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: qk.admin.users({ q: q || undefined, status: status || undefined }),
    queryFn: () => adminApi.users({ q: q || undefined, status: status || undefined }),
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ["admin", "users"] });
  const onError = (e: unknown) => toast.error(e instanceof ApiError ? e.message : t("common.genericError"));

  const suspend = useMutation({
    mutationFn: (id: number) => adminApi.suspendUser(id),
    onSuccess: () => { toast.success(t("admin.userSuspended")); invalidate(); },
    onError,
  });

  const reactivate = useMutation({
    mutationFn: (id: number) => adminApi.reactivateUser(id),
    onSuccess: () => { toast.success(t("admin.userReactivated")); invalidate(); },
    onError,
  });

  const changeRole = useMutation({
    mutationFn: ({ id, role }: { id: number; role: Role }) => adminApi.changeUserRole(id, role),
    onSuccess: () => { toast.success(t("admin.userRoleUpdated")); invalidate(); },
    onError,
  });

  const changeLimit = useMutation({
    mutationFn: ({ id, limit }: { id: number; limit: number }) => adminApi.changeUploadLimit(id, limit),
    onSuccess: () => { toast.success(t("admin.userLimitUpdated")); invalidate(); },
    onError,
  });

  const items = data?.data ?? [];

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-h2">{t("admin.usersTitle")}</h2>
        <p className="text-body text-[var(--color-fg-muted)]">{t("admin.usersLead")}</p>
      </div>

      <div className="flex flex-col md:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-fg-placeholder)]" />
          <Input
            placeholder={t("admin.usersSearchPlaceholder")}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={status} onChange={(e) => setStatus(e.target.value)} className="md:w-44">
          <option value="">{t("admin.usersAllStatuses")}</option>
          <option value="active">{t("admin.usersStatusActive")}</option>
          <option value="suspended">{t("admin.usersStatusSuspended")}</option>
          <option value="deleted">{t("admin.usersStatusDeleted")}</option>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-24"><Spinner className="text-[var(--color-fg-muted)]" /></div>
      ) : error ? (
        <ErrorState onRetry={() => refetch()} />
      ) : items.length === 0 ? (
        <EmptyState title={t("admin.usersEmptyTitle")} />
      ) : (
        <div className="space-y-2">
          {items.map((u) =>
            isAdmin ? (
              <UserRow
                key={u.id}
                u={u}
                currentUserId={currentUser?.id}
                t={t}
                mut={{
                  suspend: (id) => suspend.mutate(id),
                  reactivate: (id) => reactivate.mutate(id),
                  changeRole: (id, role) => changeRole.mutate({ id, role }),
                  changeLimit: (id, limit) => changeLimit.mutate({ id, limit }),
                  isPending:
                    suspend.isPending ||
                    reactivate.isPending ||
                    changeRole.isPending ||
                    changeLimit.isPending,
                }}
              />
            ) : (
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
                </CardBody>
              </Card>
            )
          )}
        </div>
      )}
    </div>
  );
}
