import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";
import { slugify } from "@/lib/utils";
import { PLATFORMS } from "@/lib/site";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  try {
    const b = await req.json();
    const gameTitle = String(b.gameTitle || "").trim();
    const code = String(b.code || "").trim();
    const effect = String(b.effect || "").trim();
    if (!gameTitle || !code || !effect) {
      return NextResponse.json({ error: "Game title, code and effect are required." }, { status: 400 });
    }
    const current = await db.cheatCode.findUnique({ where: { id } });
    if (!current) return NextResponse.json({ error: "Not found" }, { status: 404 });

    let slug = slugify(String(b.slug || "") || `${gameTitle} ${effect}`);
    if (slug !== current.slug) {
      const exists = await db.cheatCode.findUnique({ where: { slug } });
      if (exists) slug = `${slug}-${Date.now().toString(36)}`;
    }
    const updated = await db.cheatCode.update({
      where: { id },
      data: {
        gameTitle,
        slug,
        platform: PLATFORMS.includes(b.platform) ? b.platform : "PC",
        code,
        effect,
        details: b.details ? String(b.details) : null,
      },
    });
    return NextResponse.json({ code: updated });
  } catch {
    return NextResponse.json({ error: "Could not update cheat code." }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  try {
    await db.cheatCode.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Could not delete." }, { status: 500 });
  }
}
