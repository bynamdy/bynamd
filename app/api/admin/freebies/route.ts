import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const freebies = await db.freebie.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ freebies });
}

export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const b = await req.json();
    const title = String(b.title || "").trim();
    const url = String(b.url || "").trim();
    const description = String(b.description || "").trim();
    if (!title || !url || !description) {
      return NextResponse.json({ error: "Title, description and link are required." }, { status: 400 });
    }
    const freebie = await db.freebie.create({
      data: {
        title,
        type: ["free", "giveaway", "deal"].includes(b.type) ? b.type : "free",
        description,
        platform: b.platform ? String(b.platform).slice(0, 60) : "Multi",
        url: /^https?:\/\//.test(url) ? url : `https://${url}`,
        imageUrl: b.imageUrl ? String(b.imageUrl) : null,
        priceOriginal: b.priceOriginal ? String(b.priceOriginal).slice(0, 30) : null,
        priceDeal: b.priceDeal ? String(b.priceDeal).slice(0, 30) : null,
        endsAt: b.endsAt ? new Date(b.endsAt) : null,
        active: b.active === undefined ? true : Boolean(b.active),
      },
    });
    return NextResponse.json({ freebie });
  } catch {
    return NextResponse.json({ error: "Could not create freebie." }, { status: 500 });
  }
}
