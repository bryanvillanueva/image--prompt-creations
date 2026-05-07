"use client";
import Link from "next/link";
import { useT } from "@/lib/i18n/I18nProvider";

export function Footer() {
  const { t } = useT();
  return (
    <footer className="mt-24 border-t border-[var(--color-border)]">
      <div className="container-app py-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-sm text-[var(--color-fg-muted)]">
        <div>{t("footer.copyright", { year: new Date().getFullYear() })}</div>
        <nav className="flex items-center gap-5">
          <Link href="/rules" className="hover:text-[var(--color-fg)]">
            {t("footer.rules")}
          </Link>
          <Link href="/terms" className="hover:text-[var(--color-fg)]">
            {t("footer.terms")}
          </Link>
        </nav>
      </div>
    </footer>
  );
}
