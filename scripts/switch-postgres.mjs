#!/usr/bin/env node
/**
 * Switches the Prisma datasource provider from "sqlite" to "postgresql"
 * (for Supabase deployment) and back.
 *
 * Usage:
 *   node scripts/switch-postgres.mjs postgres   # before deploying to Supabase
 *   node scripts/switch-postgres.mjs sqlite     # back to local development
 */
import fs from "fs";
import path from "path";

const mode = process.argv[2] || "postgres";
const schemaPath = path.join(process.cwd(), "prisma", "schema.prisma");

if (!fs.existsSync(schemaPath)) {
  console.error("Could not find prisma/schema.prisma — run from the project root.");
  process.exit(1);
}

let schema = fs.readFileSync(schemaPath, "utf8");

if (mode === "postgres") {
  schema = schema.replace(/provider\s*=\s*"sqlite"/, 'provider = "postgresql"');
  console.log('✅ Datasource provider switched to "postgresql" (Supabase).');
} else {
  schema = schema.replace(/provider\s*=\s*"postgresql"/, 'provider = "sqlite"');
  console.log('✅ Datasource provider switched back to "sqlite" (local dev).');
}

fs.writeFileSync(schemaPath, schema);
console.log("Next steps:");
console.log("  1. npx prisma generate");
console.log("  2. npx prisma db push   (with DATABASE_URL set)");
console.log("  3. npx tsx scripts/seed.ts");
