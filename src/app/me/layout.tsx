"use client";
import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { cn } from "@/lib/cn";

const tabs = [
  { href: "/me/prompts", label: "Mis prompts" },
  { href: "/me/saved", label: "Guardados" },
  { href: "/me/profile", label: "Perfil" },
];

export default function MeLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <AuthGuard>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-h1">Tu panel</h1>
          <p className="text-body text-[var(--color-fg-muted)]">Gestiona tus contribuciones a la comunidad.</p>
        </div>
        <nav className="inline-flex rounded-full bg-[var(--color-bg-subtle)] p-1 shadow-ring-light">
          {tabs.map((t) => (
            <Link
              key={t.href}
              href={t.href}
              className={cn(
                "px-4 h-8 inline-flex items-center rounded-full text-sm font-medium transition-colors",
                pathname.startsWith(t.href)
                  ? "bg-white shadow-ring-light text-[var(--color-fg)]"
                  : "text-[var(--color-fg-muted)] hover:text-[var(--color-fg)]",
              )}
            >
              {t.label}
            </Link>
          ))}
        </nav>
        <div>{children}</div>
      </div>
    </AuthGuard>
  );
}
