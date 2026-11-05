import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";
import { CONTENT_DEFAULTS, CONTENT_LABELS } from "@/lib/site";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const rows = await db.pageContent.findMany();
  const map: Record<string, string> = { ...CONTENT_DEFAULTS };
  for (const r of rows) map[r.key] = r.value;
  return NextResponse.json({ content: map, labels: CONTENT_LABELS });
}

export async function PUT(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const b = await req.json();
    const updates = b.updates || {};
    for (const [key, value] of Object.entries(updates)) {
      if (!(key in CONTENT_DEFAULTS)) continue; // only allow known keys
      await db.pageContent.upsert({
        where: { key },
        create: { key, value: String(value) },
        update: { value: String(value) },
      });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Could not save page text." }, { status: 500 });
  }
}
