import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  createPreAuth,
  createSession,
  getPreAuth,
  generateBackupCodes,
  verifyPassword,
  verifyTotpCode,
  createTotp,
  clearSession,
  sha256,
} from "@/lib/auth";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import QRCode from "qrcode";

/**
 * Admin login — two steps:
 *  1) step "credentials": email + password.
 *     - If 2FA already enabled -> stage "totp" (enter authenticator code).
 *     - If first login -> stage "setup": returns QR code + manual secret + one-time
 *       backup recovery codes. Scan with Google Authenticator / Authy / 1Password.
 *  2) step "totp": verify the 6-digit code (or a backup code) -> full session.
 */
export async function POST(req: Request) {
  const ip = getClientIp(req);
  const rl = checkRateLimit(`login:${ip}`, 15, 15 * 60 * 1000);
  if (!rl.ok) {
    return NextResponse.json(
      { error: `Too many attempts. Try again in ${rl.retryAfterSec}s.` },
      { status: 429 }
    );
  }

  let body: {
    step?: string;
    email?: string;
    password?: string;
    code?: string;
    isBackup?: boolean;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  /* ---------------- STEP 1: email + password ---------------- */
  if (body.step === "credentials") {
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    const admin = await db.admin.findUnique({ where: { email } });
    if (!admin || !(await verifyPassword(password, admin.passwordHash))) {
      if (admin) {
        const failed = admin.failedAttempts + 1;
        await db.admin.update({
          where: { id: admin.id },
          data: {
            failedAttempts: failed,
            lockedUntil:
              failed >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : admin.lockedUntil,
          },
        });
      }
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    if (admin.lockedUntil && admin.lockedUntil > new Date()) {
      return NextResponse.json(
        { error: "Account temporarily locked after failed attempts. Try again in 15 minutes." },
        { status: 423 }
      );
    }

    await db.admin.update({
      where: { id: admin.id },
      data: { failedAttempts: 0, lockedUntil: null },
    });

    if (admin.twoFactorEnabled && admin.totpSecret) {
      await createPreAuth(admin.id, admin.email);
      return NextResponse.json({ stage: "totp" });
    }

    // First login: generate TOTP secret + backup codes and enter setup mode
    const totp = createTotp(admin.email);
    const secretHex = totp.secret.hex;
    const generated = generateBackupCodes();

    await db.admin.update({
      where: { id: admin.id },
      data: {
        totpSecret: secretHex,
        twoFactorEnabled: false,
        backupCodes: JSON.stringify(generated.hashed),
      },
    });

    const uri = totp.toString(); // otpauth:// URI
    const qr = await QRCode.toDataURL(uri, { width: 280, margin: 1 });

    await createPreAuth(admin.id, admin.email);
    return NextResponse.json({
      stage: "setup",
      qr,
      manualSecret: totp.secret.base32,
      backupCodes: generated.plain,
    });
  }

  /* ---------------- STEP 2: TOTP / backup code ---------------- */
  if (body.step === "totp") {
    const pre = await getPreAuth();
    if (!pre) {
      return NextResponse.json(
        { error: "Session expired. Please log in again.", expired: true },
        { status: 401 }
      );
    }
    const admin = await db.admin.findUnique({ where: { id: pre.sub } });
    if (!admin) {
      return NextResponse.json({ error: "Account not found.", expired: true }, { status: 401 });
    }

    const code = String(body.code || "").trim();
    if (!code) {
      return NextResponse.json({ error: "Enter the 6-digit code." }, { status: 400 });
    }

    if (!admin.totpSecret) {
      return NextResponse.json({ error: "2FA not initialized. Log in again." }, { status: 400 });
    }

    // Setup mode: must confirm with authenticator app (backup codes not accepted yet)
    if (!admin.twoFactorEnabled) {
      if (verifyTotpCode(admin.totpSecret, code)) {
        await db.admin.update({ where: { id: admin.id }, data: { twoFactorEnabled: true } });
        await createSession(admin.id, admin.email);
        return NextResponse.json({ ok: true, firstLogin: true });
      }
      return NextResponse.json(
        { error: "Incorrect code. Check your authenticator app and try again." },
        { status: 401 }
      );
    }

    // Regular login: TOTP or backup recovery code
    if (!body.isBackup && verifyTotpCode(admin.totpSecret, code)) {
      await createSession(admin.id, admin.email);
      return NextResponse.json({ ok: true });
    }

    if (body.isBackup) {
      const used = sha256(code);
      const list: string[] = JSON.parse(admin.backupCodes || "[]");
      if (list.includes(used)) {
        const remaining = list.filter((c) => c !== used);
        await db.admin.update({
          where: { id: admin.id },
          data: { backupCodes: JSON.stringify(remaining) },
        });
        await createSession(admin.id, admin.email);
        return NextResponse.json({
          ok: true,
          backupUsed: true,
          remainingBackups: remaining.length,
        });
      }
      return NextResponse.json({ error: "Invalid backup code." }, { status: 401 });
    }

    return NextResponse.json(
      { error: "Incorrect code. Check your authenticator app or use a backup code." },
      { status: 401 }
    );
  }

  return NextResponse.json({ error: "Unknown step." }, { status: 400 });
}

/** Logout — clears the session cookie. */
export async function DELETE() {
  await clearSession();
  return NextResponse.json({ ok: true });
}
