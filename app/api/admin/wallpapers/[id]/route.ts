import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";
import { slugify } from "@/lib/utils";
import { WALLPAPER_CATEGORIES } from "@/lib/site";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  try {
    const b = await req.json();
    const title = String(b.title || "").trim();
    const imageUrl = String(b.imageUrl || "").trim();
    if (!title || !imageUrl) {
      return NextResponse.json({ error: "Title and image are required." }, { status: 400 });
    }
    const current = await db.wallpaper.findUnique({ where: { id } });
    if (!current) return NextResponse.json({ error: "Not found" }, { status: 404 });

    let slug = slugify(String(b.slug || "") || title);
    if (slug !== current.slug) {
      const exists = await db.wallpaper.findUnique({ where: { slug } });
      if (exists) slug = `${slug}-${Date.now().toString(36)}`;
    }
    const wallpaper = await db.wallpaper.update({
      where: { id },
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
    return NextResponse.json({ error: "Could not update wallpaper." }, { status: 500 });
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
    await db.wallpaper.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Could not delete." }, { status: 500 });
  }
}
