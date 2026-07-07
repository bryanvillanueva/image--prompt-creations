"use client";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { BrandForm } from "@/components/brand/BrandForm";
import { useT } from "@/lib/i18n/I18nProvider";

export default function NewBrandPage() {
  const { t } = useT();
  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/brands"
          className="inline-flex items-center gap-1 text-sm text-[var(--color-fg-muted)] hover:text-[var(--color-fg)]"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("common.back")}
        </Link>
        <h1 className="text-h1 mt-2">{t("brands.newTitle")}</h1>
        <p className="text-body text-[var(--color-fg-muted)]">{t("brands.newLead")}</p>
      </div>
      <BrandForm />
    </div>
  );
}
