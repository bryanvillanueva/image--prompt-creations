"use client";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Card, CardBody } from "@/components/ui/Card";
import { useAuth } from "@/lib/auth/AuthContext";
import { formatDate } from "@/lib/format";
import { useT } from "@/lib/i18n/I18nProvider";

export default function ProfilePage() {
  const { user } = useAuth();
  const { t } = useT();
  if (!user) return null;
  return (
    <Card className="max-w-xl">
      <CardBody className="p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Avatar src={user.avatar_url} name={user.name} size={64} />
          <div className="min-w-0">
            <div className="text-h3 truncate">{user.name}</div>
            <div className="text-sm text-[var(--color-fg-muted)]">@{user.username}</div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <Detail label={t("me.profileEmail")} value={user.email} />
          <Detail label={t("me.profileRole")} value={<Badge variant="dark">{user.role}</Badge>} />
          <Detail label={t("me.profileStatus")} value={<Badge variant={user.status === "active" ? "success" : "warning"}>{user.status}</Badge>} />
          <Detail label={t("me.profileTrust")} value={user.trust_level} />
          <Detail label={t("me.profileLimit")} value={String(user.upload_limit_per_day)} />
          <Detail label={t("me.profileMember")} value={formatDate(user.created_at)} />
        </div>
        {user.bio && (
          <div>
            <div className="text-mono-label text-[var(--color-fg-muted)] mb-1">{t("me.profileBio")}</div>
            <p className="text-body">{user.bio}</p>
          </div>
        )}
        <p className="text-xs text-[var(--color-fg-muted)]">
          {t("me.profileEditNote")}
        </p>
      </CardBody>
    </Card>
  );
}

function Detail({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="text-mono-label text-[var(--color-fg-muted)]">{label}</div>
      <div className="mt-1">{value}</div>
    </div>
  );
}
