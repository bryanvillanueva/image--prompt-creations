"use client";
import * as React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { authApi } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import { qk } from "@/lib/queries/keys";
import type { PublicUser, Role } from "@/lib/types";

interface AuthContextValue {
  user: PublicUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  role: Role | null;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: PublicUser | null) => void;
}

const AuthContext = React.createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();

  const { data, isLoading, refetch } = useQuery<PublicUser | null>({
    queryKey: qk.auth.me,
    queryFn: async () => {
      try {
        const res = await authApi.me();
        return res.data.user;
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) return null;
        throw err;
      }
    },
    staleTime: 60_000,
    retry: false,
    refetchOnMount: "always",
  });

  const user = data ?? null;

  const value: AuthContextValue = {
    user,
    isLoading,
    isAuthenticated: !!user,
    role: user?.role ?? null,
    refresh: async () => {
      await refetch();
    },
    logout: async () => {
      try {
        await authApi.logout();
      } catch {
        // ignore — limpiamos igual
      }
      queryClient.setQueryData(qk.auth.me, null);
      queryClient.clear();
    },
    setUser: (u) => {
      queryClient.setQueryData(qk.auth.me, u);
      // Refetch every query so user-scoped fields (is_liked, is_saved, etc.)
      // hydrate with the new auth context on the destination page.
      queryClient.invalidateQueries();
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return ctx;
}
