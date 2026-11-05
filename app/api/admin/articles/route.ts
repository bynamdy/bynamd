import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";
import { slugify } from "@/lib/utils";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const articles = await db.article.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ articles });
}

export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const b = await req.json();
    const title = String(b.title || "").trim();
    const content = String(b.content || "").trim();
    if (!title || !content) {
      return NextResponse.json({ error: "Title and content are required." }, { status: 400 });
    }
    let slug = slugify(String(b.slug || "") || title);
    const exists = await db.article.findUnique({ where: { slug } });
    if (exists) slug = `${slug}-${Date.now().toString(36)}`;
    const article = await db.article.create({
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
    return NextResponse.json({ error: "Could not create article." }, { status: 500 });
  }
}
