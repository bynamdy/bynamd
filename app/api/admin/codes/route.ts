import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";
import { slugify } from "@/lib/utils";
import { PLATFORMS } from "@/lib/site";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const codes = await db.cheatCode.findMany({ orderBy: { gameTitle: "asc" } });
  return NextResponse.json({ codes });
}

export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const b = await req.json();
    const gameTitle = String(b.gameTitle || "").trim();
    const code = String(b.code || "").trim();
    const effect = String(b.effect || "").trim();
    if (!gameTitle || !code || !effect) {
      return NextResponse.json({ error: "Game title, code and effect are required." }, { status: 400 });
    }
    let slug = slugify(String(b.slug || "") || `${gameTitle} ${effect}`);
    const exists = await db.cheatCode.findUnique({ where: { slug } });
    if (exists) slug = `${slug}-${Date.now().toString(36)}`;
    const created = await db.cheatCode.create({
      data: {
        gameTitle,
        slug,
        platform: PLATFORMS.includes(b.platform) ? b.platform : "PC",
        code,
        effect,
        details: b.details ? String(b.details) : null,
      },
    });
    return NextResponse.json({ code: created });
  } catch {
    return NextResponse.json({ error: "Could not create cheat code." }, { status: 500 });
  }
}
