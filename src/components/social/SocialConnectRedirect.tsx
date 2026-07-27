"use client";
import * as React from "react";
import { usePathname, useRouter } from "next/navigation";

/**
 * The Meta OAuth callback redirects the browser to FRONTEND_URL with
 * ?social_connect=...&brand_id=... — if the user lands anywhere other than the
 * brand detail page, forward them there keeping the params so
 * SocialConnectionCard can act on them.
 */
export function SocialConnectRedirect() {
  const router = useRouter();
  const pathname = usePathname();

  React.useEffect(() => {
    const search = window.location.search;
    if (!search) return;
    const params = new URLSearchParams(search);
    const result = params.get("social_connect");
    const brandId = Number(params.get("brand_id"));
    if (!result || !Number.isFinite(brandId) || brandId <= 0) return;
    const target = `/brands/${brandId}`;
    if (pathname === target) return;
    router.replace(`${target}${search}`);
  }, [pathname, router]);

  return null;
}
