import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";
import { slugify } from "@/lib/utils";

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
    const content = String(b.content || "").trim();
    if (!title || !content) {
      return NextResponse.json({ error: "Title and content are required." }, { status: 400 });
    }
    const current = await db.article.findUnique({ where: { id } });
    if (!current) return NextResponse.json({ error: "Not found" }, { status: 404 });

    let slug = slugify(String(b.slug || "") || title);
    if (slug !== current.slug) {
      const exists = await db.article.findUnique({ where: { slug } });
      if (exists) slug = `${slug}-${Date.now().toString(36)}`;
    }
    const article = await db.article.update({
      where: { id },
      data: {
        title,
        slug,
        category: ["news", "updates", "releases"].includes(b.category) ? b.category : "news",
        excerpt: String(b.excerpt || "").slice(0, 400) || content.slice(0, 197) + "...",
        content,
        coverImage: b.coverImage ? String(b.coverImage) : null,
        seoTitle: b.seoTitle ? String(b.seoTitle).slice(0, 200) : null,
        seoDescription: b.seoDescription ? String(b.seoDescription).slice(0, 300) : null,
        published: Boolean(b.published),
      },
    });
    return NextResponse.json({ article });
  } catch {
    return NextResponse.json({ error: "Could not update article." }, { status: 500 });
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
    await db.article.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Could not delete." }, { status: 500 });
  }
}
