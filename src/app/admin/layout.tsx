"use client";
import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shield } from "lucide-react";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { useAuth } from "@/lib/auth/AuthContext";
import { cn } from "@/lib/cn";
import { useT } from "@/lib/i18n/I18nProvider";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { role } = useAuth();
  const { t } = useT();
  const isAdmin = role === "admin";

  const items = [
    { href: "/admin/pending", label: t("admin.navPending") },
    { href: "/admin/reports", label: t("admin.navReports") },
    { href: "/admin/users", label: t("admin.navUsers") },
    ...(isAdmin ? [{ href: "/admin/moderation-words", label: t("admin.navWords") }] : []),
  ];

  return (
    <RoleGuard allow={["admin", "moderator"]}>
      <div className="grid lg:grid-cols-[220px_1fr] gap-8 animate-fade-in">
        <aside className="space-y-2">
          <div className="inline-flex items-center gap-2 text-mono-label text-[var(--color-fg-muted)]">
            <Shield className="h-3.5 w-3.5" />
            {t("admin.sidebarTitle")}
          </div>
          <nav className="flex flex-col gap-1 mt-2">
            {items.map((it) => (
              <Link
                key={it.href}
                href={it.href}
                className={cn(
                  "px-3 py-2 rounded-md text-sm font-medium",
                  pathname.startsWith(it.href)
                    ? "bg-[var(--color-fg)] text-white"
                    : "text-[var(--color-fg-muted)] hover:bg-[var(--color-bg-subtle)] hover:text-[var(--color-fg)]",
                )}
              >
                {it.label}
              </Link>
            ))}
          </nav>
        </aside>
        <section className="min-w-0">{children}</section>
      </div>
    </RoleGuard>
  );
}
