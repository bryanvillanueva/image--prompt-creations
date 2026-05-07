"use client";
import * as React from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthContext";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import type { Role } from "@/lib/types";

interface RoleGuardProps {
  allow: Role[];
  children: React.ReactNode;
}

export function RoleGuard({ allow, children }: RoleGuardProps) {
  const { user, isAuthenticated, isLoading, role } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  React.useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      const next = encodeURIComponent(pathname || "/");
      router.replace(`/login?next=${next}`);
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center py-24">
        <Spinner className="text-[var(--color-fg-muted)]" />
      </div>
    );
  }
  if (!role || !allow.includes(role)) {
    return (
      <EmptyState
        title="No autorizado"
        description="No tienes permisos para ver esta sección."
      />
    );
  }
  return <>{children}</>;
}
