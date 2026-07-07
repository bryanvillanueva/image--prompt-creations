"use client";
import * as React from "react";
import { AuthGuard } from "@/components/auth/AuthGuard";

export default function BrandsLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="animate-fade-in">{children}</div>
    </AuthGuard>
  );
}
