import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";
import { slugify } from "@/lib/utils";
import { WALLPAPER_CATEGORIES } from "@/lib/site";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const wallpapers = await db.wallpaper.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ wallpapers });
}

export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const b = await req.json();
    const title = String(b.title || "").trim();
    const imageUrl = String(b.imageUrl || "").trim();
    if (!title || !imageUrl) {
      return NextResponse.json({ error: "Title and image are required." }, { status: 400 });
    }
    let slug = slugify(String(b.slug || "") || title);
    const exists = await db.wallpaper.findUnique({ where: { slug } });
    if (exists) slug = `${slug}-${Date.now().toString(36)}`;
    const wallpaper = await db.wallpaper.create({
      data: {
        title,
        slug,
        category: WALLPAPER_CATEGORIES.includes(b.category) ? b.category : "Games",
        imageUrl,
        tags: b.tags ? String(b.tags) : "",
        resolution: b.resolution ? String(b.resolution).slice(0, 20) : "3840x2160",
        featured: Boolean(b.featured),
      },
    });
    return NextResponse.json({ wallpaper });
  } catch {
    return NextResponse.json({ error: "Could not create wallpaper." }, { status: 500 });
  }
}
