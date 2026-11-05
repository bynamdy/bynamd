import { NextResponse } from "next/server";
import { db } from "@/lib/db";

/** Public page-view tracker for the admin traffic counter. */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const path = typeof body.path === "string" ? body.path.slice(0, 200) : null;
    if (!path || path.startsWith("/admin")) {
      return NextResponse.json({ ok: true });
    }
    const day = new Date().toISOString().slice(0, 10);
    await db.pageView.upsert({
      where: { day_path: { day, path } },
      create: { day, path, count: 1 },
      update: { count: { increment: 1 } },
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true });
  }
}
