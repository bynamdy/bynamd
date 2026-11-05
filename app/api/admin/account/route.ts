import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";
import { hashPassword, isStrongPassword, verifyPassword } from "@/lib/auth";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({
    email: admin.email,
    twoFactorEnabled: admin.twoFactorEnabled,
    createdAt: admin.createdAt,
  });
}

/**
 * Account settings:
 *  - action "email":     { currentPassword, newEmail }
 *  - action "password":  { currentPassword, newPassword, confirmPassword }
 *  - action "regen_backup_codes": { currentPassword } -> returns new plain codes once
 */
export async function PUT(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const b = await req.json();
    const currentPassword = String(b.currentPassword || "");

    if (!(await verifyPassword(currentPassword, admin.passwordHash))) {
      return NextResponse.json({ error: "Current password is incorrect." }, { status: 403 });
    }

    if (b.action === "email") {
      const newEmail = String(b.newEmail || "").trim().toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
        return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
      }
      if (newEmail === admin.email) {
        return NextResponse.json({ error: "That is already your email." }, { status: 400 });
      }
      const taken = await db.admin.findUnique({ where: { email: newEmail } });
      if (taken) {
        return NextResponse.json({ error: "That email is already in use." }, { status: 400 });
      }
      await db.admin.update({ where: { id: admin.id }, data: { email: newEmail } });
      return NextResponse.json({ ok: true, email: newEmail, message: "Email updated." });
    }

    if (b.action === "password") {
      const newPassword = String(b.newPassword || "");
      const confirmPassword = String(b.confirmPassword || "");
      if (!isStrongPassword(newPassword)) {
        return NextResponse.json(
          { error: "New password must be at least 8 characters." },
          { status: 400 }
        );
      }
      if (newPassword !== confirmPassword) {
        return NextResponse.json({ error: "New passwords do not match." }, { status: 400 });
      }
      const passwordHash = await hashPassword(newPassword);
      await db.admin.update({ where: { id: admin.id }, data: { passwordHash } });
      return NextResponse.json({ ok: true, message: "Password updated." });
    }

    if (b.action === "regen_backup_codes") {
      const { generateBackupCodes } = await import("@/lib/auth");
      const generated = generateBackupCodes();
      await db.admin.update({
        where: { id: admin.id },
        data: { backupCodes: JSON.stringify(generated.hashed) },
      });
      return NextResponse.json({
        ok: true,
        backupCodes: generated.plain,
        message: "New backup codes generated. Old codes no longer work.",
      });
    }

    return NextResponse.json({ error: "Unknown action." }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Could not update account." }, { status: 500 });
  }
}
