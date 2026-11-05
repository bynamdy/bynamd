import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const rl = checkRateLimit(`contact:${ip}`, 5, 10 * 60 * 1000);
  if (!rl.ok) {
    return NextResponse.json(
      { error: `Too many messages. Please try again in ${rl.retryAfterSec}s.` },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const name = String(body.name || "").trim().slice(0, 100);
    const email = String(body.email || "").trim().slice(0, 200);
    const subject = String(body.subject || "").trim().slice(0, 150);
    const message = String(body.message || "").trim().slice(0, 5000);

    if (!name || !email || !message) {
      return NextResponse.json({ error: "Name, email and message are required." }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }

    await db.contactMessage.create({ data: { name, email, subject: subject || null, message } });
    return NextResponse.json({ ok: true, message: "Message received! We'll get back to you within 48 hours." });
  } catch {
    return NextResponse.json({ error: "Could not send message. Please try again." }, { status: 500 });
  }
}
