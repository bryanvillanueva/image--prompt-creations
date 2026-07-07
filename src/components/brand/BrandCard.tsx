"use client";
import * as React from "react";
import Link from "next/link";
import { Sparkles, Palette } from "lucide-react";
import { Card, CardBody, CardFooter } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import type { Brand } from "@/lib/types";
import { useT } from "@/lib/i18n/I18nProvider";

export function BrandCard({ brand }: { brand: Brand }) {
  const { t } = useT();
  const colors = [...(brand.primary_colors ?? []), ...(brand.secondary_colors ?? [])];

  return (
    <Card className="flex flex-col transition-shadow hover:shadow-card-hover">
      <Link href={`/brands/${brand.id}`} className="flex-1">
        <CardBody className="space-y-3">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-h3 leading-tight">{brand.name}</h3>
            {brand.industry && <Badge variant="blue">{brand.industry}</Badge>}
          </div>
          {brand.slogan && (
            <p className="text-sm italic text-[var(--color-fg-muted)]">“{brand.slogan}”</p>
          )}
          {colors.length > 0 ? (
            <div className="flex items-center gap-1.5">
              {colors.slice(0, 8).map((c, i) => (
                <span
                  key={`${c}-${i}`}
                  className="h-5 w-5 rounded-full shadow-ring-light"
                  style={{ backgroundColor: c }}
                  title={c}
                />
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs text-[var(--color-fg-muted)]">
              <Palette className="h-4 w-4" />
              {t("brands.cardNoColors")}
            </div>
          )}
        </CardBody>
      </Link>
      <CardFooter className="flex items-center justify-between gap-2">
        <Link href={`/brands/${brand.id}`}>
          <Button variant="ghost" size="sm">{t("brands.cardView")}</Button>
        </Link>
        <Link href={`/brands/${brand.id}/studio`}>
          <Button variant="primary" size="sm">
            <Sparkles className="h-4 w-4" />
            {t("brands.cardStudio")}
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
