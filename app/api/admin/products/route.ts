import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";
import { slugify } from "@/lib/utils";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const products = await db.product.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ products });
}

export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const b = await req.json();
    const name = String(b.name || "").trim();
    const description = String(b.description || "").trim();
    const affiliateUrl = String(b.affiliateUrl || "").trim();
    const price = Number(b.price);
    if (!name || !description || !affiliateUrl || !Number.isFinite(price) || price <= 0) {
      return NextResponse.json(
        { error: "Name, description, price and affiliate link are required." },
        { status: 400 }
      );
    }
    let slug = slugify(String(b.slug || "") || name);
    const exists = await db.product.findUnique({ where: { slug } });
    if (exists) slug = `${slug}-${Date.now().toString(36)}`;
    const product = await db.product.create({
      data: {
        name,
        slug,
        description,
        price,
        oldPrice: b.oldPrice && Number(b.oldPrice) > 0 ? Number(b.oldPrice) : null,
        currency: ["USD", "NGN", "GBP", "EUR"].includes(b.currency) ? b.currency : "USD",
        imageUrl: b.imageUrl ? String(b.imageUrl) : null,
        affiliateUrl: /^https?:\/\//.test(affiliateUrl) ? affiliateUrl : `https://${affiliateUrl}`,
        category: b.category ? String(b.category).slice(0, 60) : "Accessories",
        brand: b.brand ? String(b.brand).slice(0, 60) : "",
        featured: Boolean(b.featured),
      },
    });
    return NextResponse.json({ product });
  } catch {
    return NextResponse.json({ error: "Could not create product." }, { status: 500 });
  }
}
