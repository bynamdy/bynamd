/**
 * Reset the admin account's 2FA so the NEXT login at /admin starts
 * the first-time QR setup flow (scan with Google Authenticator).
 *
 * Usage:
 *   bun scripts/reset-admin-2fa.ts            # reset 2FA only (keep email/password)
 *   bun scripts/reset-admin-2fa.ts --full     # also reset email/password from .env
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

async function main() {
  const email = (process.env.ADMIN_EMAIL || "admin@bynamdy.com").toLowerCase();
  const admin = await db.admin.findUnique({ where: { email } });

  if (!admin) {
    const password = process.env.ADMIN_PASSWORD || "ChangeMe123!";
    await db.admin.create({
      data: {
        email,
        passwordHash: await bcrypt.hash(password, 12),
      },
    });
    console.log(`✅ Admin created: ${email} — first login at /admin will show the 2FA QR setup.`);
  } else {
    const data: Record<string, unknown> = {
      totpSecret: null,
      twoFactorEnabled: false,
      backupCodes: "[]",
      failedAttempts: 0,
      lockedUntil: null,
    };
    if (process.argv.includes("--full")) {
      const password = process.env.ADMIN_PASSWORD || "ChangeMe123!";
      data.passwordHash = await bcrypt.hash(password, 12);
      console.log("🔑 Password also reset from ADMIN_PASSWORD env.");
    }
    await db.admin.update({ where: { id: admin.id }, data });
    console.log(`✅ 2FA reset for ${email}. Next login at /admin will show the QR setup flow.`);
  }
  await db.$disconnect();
}

main();
