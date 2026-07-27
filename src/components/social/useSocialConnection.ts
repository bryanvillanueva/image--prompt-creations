"use client";
import { useQuery } from "@tanstack/react-query";
import { socialApi } from "@/lib/api/social";
import { ApiError } from "@/lib/api/client";
import { qk } from "@/lib/queries/keys";

/**
 * Shared query for a brand's Meta connection. React Query dedupes it, so any
 * number of components (connection card, publish dialogs, posts page) can use
 * it with a single request. `metaDisabled` is true when the backend has no
 * Meta app configured (503) — hide every social UI in that case.
 */
export function useSocialConnection(brandId: number, enabled = true) {
  const query = useQuery({
    queryKey: qk.brands.social(brandId),
    queryFn: () => socialApi.getConnection(brandId),
    enabled: Number.isFinite(brandId) && enabled,
    retry: (failureCount, err) =>
      !(err instanceof ApiError && err.status === 503) && failureCount < 1,
  });

  const metaDisabled = query.error instanceof ApiError && query.error.status === 503;

  return {
    connection: query.data?.data ?? null,
    metaDisabled,
    isLoading: query.isLoading,
    error: metaDisabled ? null : query.error,
    refetch: query.refetch,
  };
}
