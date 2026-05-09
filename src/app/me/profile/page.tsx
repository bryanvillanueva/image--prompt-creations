"use client";
import * as React from "react";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardFooter } from "@/components/ui/Card";
import { EditProfileForm } from "@/components/profile/EditProfileForm";
import { ChangePasswordDialog } from "@/components/profile/ChangePasswordDialog";
import { useAuth } from "@/lib/auth/AuthContext";
import { formatDate } from "@/lib/format";
import { useT } from "@/lib/i18n/I18nProvider";

export default function ProfilePage() {
  const { user } = useAuth();
  const { t } = useT();
  const [editing, setEditing] = React.useState(false);
  const [passwordOpen, setPasswordOpen] = React.useState(false);

  if (!user) return null;

  return (
    <>
    <Card className="max-w-xl">
      {editing ? (
        <CardBody className="p-6">
          <EditProfileForm onClose={() => setEditing(false)} />
        </CardBody>
      ) : (
        <>
          <CardBody className="p-6 space-y-6">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 min-w-0">
                <Avatar src={user.avatar_url} name={user.name} size={64} />
                <div className="min-w-0">
                  <div className="text-h3 truncate">{user.name}</div>
                  <div className="text-sm text-[var(--color-fg-muted)] truncate">@{user.username}</div>
                </div>
              </div>
              <Button variant="secondary" size="sm" onClick={() => setEditing(true)}>
                {t("me.editProfile")}
              </Button>
            </div>
            <div className="border-t border-[var(--color-border)]" />
            <div className="grid grid-cols-2 gap-x-4 gap-y-5 text-sm">
              <Detail label={t("me.profileEmail")} value={user.email} />
              <Detail
                label={t("me.profileStatus")}
                value={
                  <Badge variant={user.status === "active" ? "success" : "warning"}>
                    {user.status}
                  </Badge>
                }
              />
              <Detail label={t("me.profileLimit")} value={String(user.upload_limit_per_day)} />
              <Detail label={t("me.profileMember")} value={formatDate(user.created_at)} />
            </div>
            {user.bio && (
              <>
                <div className="border-t border-[var(--color-border)]" />
                <div>
                  <div className="text-mono-label text-[var(--color-fg-muted)] mb-1">
                    {t("me.profileBio")}
                  </div>
                  <p className="text-body whitespace-pre-wrap">{user.bio}</p>
                </div>
              </>
            )}
            <p className="text-xs text-[var(--color-fg-muted)]">{t("me.profileEditNote")}</p>
          </CardBody>
          <CardFooter className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <div className="text-sm font-medium">{t("me.profileSecurityTitle")}</div>
              <div className="text-xs text-[var(--color-fg-muted)] mt-0.5">
                {t("me.profileSecurityNote")}
              </div>
            </div>
            <Button variant="secondary" size="sm" onClick={() => setPasswordOpen(true)}>
              {t("me.changePassword")}
            </Button>
          </CardFooter>
        </>
      )}
    </Card>
    <ChangePasswordDialog open={passwordOpen} onOpenChange={setPasswordOpen} />
    </>
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
