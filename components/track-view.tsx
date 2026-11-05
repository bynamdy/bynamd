"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

/** Fire-and-forget page view tracker (feeds the admin traffic counter). */
export function TrackView() {
  const pathname = usePathname();
  const lastTracked = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin")) return;
    if (lastTracked.current === pathname) return;
    lastTracked.current = pathname;
    const body = JSON.stringify({ path: pathname });
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    }).catch(() => {});
  }, [pathname]);

  return null;
}
