"use client";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Avatar } from "@/components/ui/Avatar";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { MasonryGrid } from "@/components/gallery/MasonryGrid";
import { PromptCard } from "@/components/gallery/PromptCard";
import { usersApi } from "@/lib/api/taxonomies";
import { ApiError } from "@/lib/api/client";
import { qk } from "@/lib/queries/keys";
import { formatDate } from "@/lib/format";
import { useT } from "@/lib/i18n/I18nProvider";

export default function PublicProfilePage() {
  const params = useParams<{ username: string }>();
  const username = params.username;
  const { t } = useT();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: qk.users.public(username),
    queryFn: () => usersApi.publicProfile(username),
    retry: 1,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner className="text-[var(--color-fg-muted)]" />
      </div>
    );
  }

  if (error) {
    if (error instanceof ApiError && error.status === 404) {
      return <EmptyState title={t("publicProfile.notFound")} />;
    }
    return <ErrorState onRetry={() => refetch()} />;
  }

  if (!data) return null;
  const { user, prompts } = data.data;

  return (
    <div className="space-y-8 animate-fade-in">
      <header className="flex items-start gap-5">
        <Avatar src={user.avatar_url} name={user.name} size={72} />
        <div className="min-w-0">
          <h1 className="text-h1">{user.name}</h1>
          <div className="text-[var(--color-fg-muted)]">@{user.username}</div>
          {user.bio && <p className="mt-3 max-w-xl text-body">{user.bio}</p>}
          <div className="text-xs text-[var(--color-fg-muted)] mt-3">
            {t("publicProfile.memberSince", { date: formatDate(user.created_at), count: prompts.length })}
          </div>
        </div>
      </header>

      {prompts.length === 0 ? (
        <EmptyState title={t("publicProfile.noPromptsTitle")} />
      ) : (
        <MasonryGrid>
          {prompts.map((p) => (
            <PromptCard key={p.id} prompt={p} />
          ))}
        </MasonryGrid>
      )}
    </div>
  );
}
