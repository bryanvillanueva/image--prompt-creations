"use client";
import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { cn } from "@/lib/cn";
import { useT } from "@/lib/i18n/I18nProvider";

export default function MeLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { t } = useT();
  const tabs = [
    { href: "/me/prompts", label: t("me.tabPrompts") },
    { href: "/me/saved", label: t("me.tabSaved") },
    { href: "/me/profile", label: t("me.tabProfile") },
  ];
  return (
    <AuthGuard>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-h1">{t("me.panelTitle")}</h1>
          <p className="text-body text-[var(--color-fg-muted)]">{t("me.panelLead")}</p>
        </div>
        <nav className="inline-flex rounded-full bg-[var(--color-bg-subtle)] p-1 shadow-ring-light">
          {tabs.map((tg) => (
            <Link
              key={tg.href}
              href={tg.href}
              className={cn(
                "px-4 h-8 inline-flex items-center rounded-full text-sm font-medium transition-colors",
                pathname.startsWith(tg.href)
                  ? "bg-white shadow-ring-light text-[var(--color-fg)]"
                  : "text-[var(--color-fg-muted)] hover:text-[var(--color-fg)]",
              )}
            >
              {tg.label}
            </Link>
          ))}
        </nav>
        <div>{children}</div>
      </div>
    </AuthGuard>
  );
}
