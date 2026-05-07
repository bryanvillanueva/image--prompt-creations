"use client";
import { useT } from "@/lib/i18n/I18nProvider";

export default function RulesPage() {
  const { t } = useT();
  return (
    <article className="max-w-2xl prose-app space-y-6">
      <h1 className="text-h1">{t("rules.title")}</h1>
      <p className="text-body-lg text-[var(--color-fg-muted)]">{t("rules.lead")}</p>

      <section className="space-y-3">
        <h2 className="text-h2">{t("rules.forbiddenTitle")}</h2>
        <ul className="list-disc pl-5 space-y-1.5 text-body">
          <li>{t("rules.f1")}</li>
          <li>{t("rules.f2")}</li>
          <li>{t("rules.f3")}</li>
          <li>{t("rules.f4")}</li>
          <li>{t("rules.f5")}</li>
          <li>{t("rules.f6")}</li>
          <li>{t("rules.f7")}</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-h2">{t("rules.bestTitle")}</h2>
        <ul className="list-disc pl-5 space-y-1.5 text-body">
          <li>{t("rules.b1")}</li>
          <li>{t("rules.b2")}</li>
          <li>{t("rules.b3")}</li>
          <li>{t("rules.b4")}</li>
          <li>{t("rules.b5")}</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-h2">{t("rules.modTitle")}</h2>
        <p className="text-body">{t("rules.modBody")}</p>
      </section>
    </article>
  );
}
