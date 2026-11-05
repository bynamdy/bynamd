import { defineCloudflareConfig } from "@opennextjs/cloudflare";

/**
 * OpenNext → Cloudflare adapter config.
 * Default in-memory incremental cache is enough for this site
 * (all dynamic pages use force-dynamic; no ISR cache needed).
 */
export default defineCloudflareConfig({});
