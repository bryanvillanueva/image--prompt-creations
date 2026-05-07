"use client";
import { AlertCircle, CheckCircle2, Clock, EyeOff, Ban } from "lucide-react";
import type { PromptStatus } from "@/lib/types";
import { useT } from "@/lib/i18n/I18nProvider";

interface Props {
  status: PromptStatus;
  reason?: string | null;
  rejectionReason?: string | null;
}

const styles: Record<PromptStatus, { bg: string; fg: string; icon: React.ReactNode }> = {
  draft: { bg: "var(--color-bg-subtle)", fg: "var(--color-fg-muted)", icon: <Clock className="h-4 w-4" /> },
  pending: { bg: "var(--color-warning-bg)", fg: "var(--color-warning-fg)", icon: <Clock className="h-4 w-4" /> },
  approved: { bg: "var(--color-success-bg)", fg: "var(--color-success-fg)", icon: <CheckCircle2 className="h-4 w-4" /> },
  rejected: { bg: "var(--color-danger-bg)", fg: "var(--color-danger-fg)", icon: <Ban className="h-4 w-4" /> },
  blocked: { bg: "var(--color-danger-bg)", fg: "var(--color-danger-fg)", icon: <AlertCircle className="h-4 w-4" /> },
  hidden: { bg: "var(--color-bg-subtle)", fg: "var(--color-fg-muted)", icon: <EyeOff className="h-4 w-4" /> },
};

export function ModerationBanner({ status, reason, rejectionReason }: Props) {
  const { t } = useT();
  const s = styles[status];
  const detail = rejectionReason ?? reason;
  return (
    <div
      className="rounded-md p-3 flex items-start gap-2 text-sm"
      style={{ background: s.bg, color: s.fg }}
    >
      <span className="mt-0.5">{s.icon}</span>
      <div className="flex-1">
        <div className="font-medium">{t(`moderationBanner.${status}`)}</div>
        {detail && <div className="text-xs opacity-90 mt-1">{detail}</div>}
      </div>
    </div>
  );
}
