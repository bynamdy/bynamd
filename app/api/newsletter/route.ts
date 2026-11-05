import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const rl = checkRateLimit(`newsletter:${ip}`, 8, 10 * 60 * 1000);
  if (!rl.ok) {
    return NextResponse.json(
      { error: `Too many attempts. Please try again in ${rl.retryAfterSec}s.` },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const email = String(body.email || "").trim().toLowerCase().slice(0, 200);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }
    await db.newsletterSubscriber.upsert({
      where: { email },
      create: { email },
      update: {},
    });
    return NextResponse.json({ ok: true, message: "You're in! Watch your inbox for the weekly drop." });
  } catch {
    return NextResponse.json({ error: "Could not subscribe. Please try again." }, { status: 500 });
  }
}
