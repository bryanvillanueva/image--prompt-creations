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
  const [optimisticUser, setOptimisticUser] = React.useState<PublicUser | null | undefined>(undefined);

  const { data, isLoading, refetch } = useQuery({
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
  });

  const user = optimisticUser !== undefined ? optimisticUser : data ?? null;

  const value: AuthContextValue = {
    user,
    isLoading,
    isAuthenticated: !!user,
    role: user?.role ?? null,
    refresh: async () => {
      await refetch();
      setOptimisticUser(undefined);
    },
    logout: async () => {
      try {
        await authApi.logout();
      } catch {
        // ignore — limpiamos igual
      }
      setOptimisticUser(null);
      queryClient.clear();
    },
    setUser: (u) => setOptimisticUser(u),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return ctx;
}
