"use client";
import { useT } from "@/lib/i18n/I18nProvider";

export default function TermsPage() {
  const { t } = useT();
  return (
    <article className="max-w-2xl space-y-6">
      <h1 className="text-h1">{t("terms.title")}</h1>
      <p className="text-body-lg text-[var(--color-fg-muted)]">{t("terms.lead")}</p>

      <section className="space-y-3">
        <h2 className="text-h2">{t("terms.s1Title")}</h2>
        <p className="text-body">{t("terms.s1Body")}</p>
      </section>

      <section className="space-y-3">
        <h2 className="text-h2">{t("terms.s2Title")}</h2>
        <p className="text-body">{t("terms.s2Body")}</p>
      </section>

      <section className="space-y-3">
        <h2 className="text-h2">{t("terms.s3Title")}</h2>
        <p className="text-body">{t("terms.s3Body")}</p>
      </section>

      <section className="space-y-3">
        <h2 className="text-h2">{t("terms.s4Title")}</h2>
        <p className="text-body">{t("terms.s4Body")}</p>
      </section>
    </article>
  );
}
