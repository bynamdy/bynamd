import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { TOTP as Totp, Secret } from "otpauth";
import crypto from "crypto";
import { cookies } from "next/headers";

const encoder = new TextEncoder();
const secretKey = encoder.encode(
  process.env.SESSION_SECRET || "bynamdy-dev-secret-change-in-production-32ch"
);

export const SESSION_COOKIE = "bd_session";
export const PREAUTH_COOKIE = "bd_preauth";
const SESSION_TTL = "7d";
const PREAUTH_TTL = "10m";

export type SessionPayload = {
  sub: string;
  email: string;
  stage: "full" | "mfa";
};

/* ---------------- passwords ---------------- */

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 12);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

/* ---------------- tokens ---------------- */

export async function signToken(payload: SessionPayload, ttl: string): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(ttl)
    .sign(secretKey);
}

export async function verifyToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey);
    if (!payload.sub || !payload.stage) return null;
    return {
      sub: payload.sub as string,
      email: payload.email as string,
      stage: payload.stage as "full" | "mfa",
    };
  } catch {
    return null;
  }
}

export async function createSession(adminId: string, email: string) {
  const token = await signToken({ sub: adminId, email, stage: "full" }, SESSION_TTL);
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  // clear the pre-auth cookie
  jar.set(PREAUTH_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
}

export async function createPreAuth(adminId: string, email: string) {
  const token = await signToken({ sub: adminId, email, stage: "mfa" }, PREAUTH_TTL);
  const jar = await cookies();
  jar.set(PREAUTH_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 10,
  });
}

export async function getSession(): Promise<SessionPayload | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const payload = await verifyToken(token);
  if (!payload || payload.stage !== "full") return null;
  return payload;
}

export async function getPreAuth(): Promise<SessionPayload | null> {
  const jar = await cookies();
  const token = jar.get(PREAUTH_COOKIE)?.value;
  if (!token) return null;
  const payload = await verifyToken(token);
  if (!payload || payload.stage !== "mfa") return null;
  return payload;
}

export async function clearSession() {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
}

/* ---------------- TOTP (authenticator app) ---------------- */

export function createTotp(email: string, secretHex?: string): Totp {
  return new Totp({
    issuer: "Bynamdy",
    label: email,
    algorithm: "SHA1",
    digits: 6,
    period: 30,
    secret: secretHex ? Secret.fromHex(secretHex) : new Secret({ size: 20 }),
  });
}

export function verifyTotpCode(secretHex: string, code: string): boolean {
  const totp = createTotp("", secretHex);
  // allow ±1 period window for clock drift
  const delta = totp.validate({ token: code.replace(/\s/g, ""), window: 1 });
  return delta !== null;
}

/* ---------------- backup recovery codes ---------------- */

export function generateBackupCodes(): { plain: string[]; hashed: string[] } {
  const plain: string[] = [];
  const hashed: string[] = [];
  for (let i = 0; i < 10; i++) {
    const code = crypto.randomBytes(5).toString("hex").toUpperCase().match(/.{1,5}/g)!.join("-");
    plain.push(code);
    hashed.push(sha256(code));
  }
  return { plain, hashed };
}

export function sha256(input: string): string {
  return crypto.createHash("sha256").update(input.trim().toUpperCase()).digest("hex");
}

/* ---------------- password strength ---------------- */

export function isStrongPassword(pw: string): boolean {
  return typeof pw === "string" && pw.length >= 8;
}
