import { cache } from "react";
import { db } from "@/lib/db";
import { CONTENT_DEFAULTS, type SiteContent } from "@/lib/site-config";

export * from "@/lib/site-config";

/**
 * Server-only: merges DB-edited page texts over the defaults.
 * Client components must NOT import this module — use @/lib/site-config.
 */
export const getContent = cache(async (): Promise<SiteContent> => {
  try {
    const rows = await db.pageContent.findMany();
    const map: Record<string, string> = { ...CONTENT_DEFAULTS };
    for (const row of rows) {
      if (row.value && row.value.trim() !== "") map[row.key] = row.value;
    }
    return map;
  } catch {
    return { ...CONTENT_DEFAULTS };
  }
});
