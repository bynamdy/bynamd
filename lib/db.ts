import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { getCloudflareContext } from "@opennextjs/cloudflare";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * One Prisma client for every runtime:
 *
 * - Cloudflare Workers (deployed via @opennextjs/cloudflare): the query goes
 *   through the HYPERDRIVE binding using the pg driver adapter (required —
 *   the classic Prisma engine binary cannot run inside a Worker).
 * - Netlify / any Node host / local dev: standard client.
 *   Local dev uses SQLite (db/custom.db); Node production hosts use the
 *   Postgres DATABASE_URL directly.
 */
function createPrismaClient(): PrismaClient {
  try {
    // getCloudflareContext() throws outside Cloudflare Workers — safe to try/catch.
    type CfEnv = {
      HYPERDRIVE?: { connectionString?: string };
      DATABASE_URL?: string;
    };
    const env = (getCloudflareContext() as unknown as { env?: CfEnv }).env;
    // Prefer the Hyperdrive binding when present. If it is not configured,
    // fall back to the raw DATABASE_URL env var — a direct connection to
    // Supabase works fine on Workers, just without Hyperdrive's pooling.
    const connectionString =
      env?.HYPERDRIVE?.connectionString ?? env?.DATABASE_URL;
    if (connectionString) {
      const adapter = new PrismaPg({ connectionString });
      return new PrismaClient({ adapter, log: ["error", "warn"] });
    }
  } catch {
    // Not running on Cloudflare — use the standard client below.
  }
  return new PrismaClient({ log: ["error", "warn"] });
}

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
