"use client";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { PromptForm } from "@/components/prompt/PromptForm";
import { promptsApi } from "@/lib/api/prompts";
import { qk } from "@/lib/queries/keys";
import { Spinner } from "@/components/ui/Spinner";
import { ErrorState } from "@/components/ui/ErrorState";

export default function EditPromptPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: qk.prompts.bySlug(slug),
    queryFn: () => promptsApi.bySlug(slug),
  });

  return (
    <AuthGuard>
      <div className="space-y-2 mb-6">
        <h1 className="text-h1">Editar prompt</h1>
        <p className="text-body-lg text-[var(--color-fg-muted)]">
          Al guardar, el prompt vuelve a revisión.
        </p>
      </div>
      {isLoading ? (
        <div className="flex justify-center py-24">
          <Spinner className="text-[var(--color-fg-muted)]" />
        </div>
      ) : error || !data ? (
        <ErrorState onRetry={() => refetch()} />
      ) : (
        <PromptForm initial={data.data} />
      )}
    </AuthGuard>
  );
}
