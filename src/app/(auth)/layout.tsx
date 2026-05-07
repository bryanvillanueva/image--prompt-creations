import * as React from "react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[calc(100dvh-4rem)] flex items-center justify-center py-12">
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}
