"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Wand2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";
import { brandsApi } from "@/lib/api/brands";
import { qk } from "@/lib/queries/keys";
import type { Prompt } from "@/lib/types";
import { useT } from "@/lib/i18n/I18nProvider";

/**
 * Sends the user to a brand studio with this prompt preloaded in the
 * instruction field. The generation agent receives the brand identity
 * server-side, so the adaptation happens at generation time.
 */
export function ReusePromptButton({ prompt }: { prompt: Prompt }) {
  const router = useRouter();
  const { t } = useT();

  const brandsQuery = useQuery({
    queryKey: qk.brands.list,
    queryFn: () => brandsApi.list(),
  });

  const brands = brandsQuery.data?.data ?? [];

  const goToStudio = (brandId: number) => {
    router.push(`/brands/${brandId}/studio?reuse=${encodeURIComponent(prompt.slug)}`);
  };

  if (brands.length > 1) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="secondary" size="md">
            <Wand2 className="h-4 w-4" />
            {t("promptDetail.reuseButton")}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuLabel>{t("promptDetail.reusePickBrand")}</DropdownMenuLabel>
          {brands.map((brand) => (
            <DropdownMenuItem key={brand.id} onSelect={() => goToStudio(brand.id)}>
              {brand.name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  const onClick = () => {
    if (brands.length === 1) {
      goToStudio(brands[0].id);
    } else {
      toast.info(t("promptDetail.reuseNoBrands"));
      router.push("/brands/new");
    }
  };

  return (
    <Button variant="secondary" size="md" onClick={onClick} disabled={brandsQuery.isLoading}>
      <Wand2 className="h-4 w-4" />
      {t("promptDetail.reuseButton")}
    </Button>
  );
}
