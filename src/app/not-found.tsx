"use client";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { useT } from "@/lib/i18n/I18nProvider";

export default function NotFound() {
  const { t } = useT();
  return (
    <EmptyState
      title={t("notFound.title")}
      description={t("notFound.description")}
      action={
        <Link href="/">
          <Button>{t("notFound.action")}</Button>
        </Link>
      }
    />
  );
}
