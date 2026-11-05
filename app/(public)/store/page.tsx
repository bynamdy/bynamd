import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, ExternalLink, Star } from "lucide-react";
import { db } from "@/lib/db";
import { getContent } from "@/lib/site";
import { cn, formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Gaming Gear Store — Headsets, Keyboards, Mice & More",
  description:
    "Hand-picked gaming gear: headsets, keyboards, mice, controllers and more. Great prices for gamers worldwide and in Nigeria — curated by Bnamdy.",
  alternates: { canonical: "/store" },
  openGraph: {
    title: "Gaming Gear Store | Bynamdy",
    description: "Hand-picked gaming gear: headsets, keyboards, mice, controllers and more.",
    type: "website",
  },
};

export default async function StorePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category = "all" } = await searchParams;
  const [content, products] = await Promise.all([
    getContent(),
    db.product.findMany({ orderBy: [{ featured: "desc" }, { createdAt: "desc" }] }),
  ]);

  const categories = ["all", ...Array.from(new Set(products.map((p) => p.category)))];
  const filtered = category === "all" ? products : products.filter((p) => p.category === category);

  return (
    <div className="fade-up mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:py-16">
      <div className="flex flex-col gap-2">
        <p className="kicker">Gear that wins games</p>
        <h1 className="font-display text-3xl font-bold uppercase sm:text-5xl">
          Bynamdy <span className="text-primary text-glow">Store</span>
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          Hand-picked gaming gear we actually rate. Every purchase through our links supports the site
          at zero extra cost to you.
        </p>
      </div>

      {/* category chips */}
      <nav className="mt-8 flex flex-wrap gap-2" aria-label="Store categories">
        {categories.map((c) => (
          <Link
            key={c}
            href={c === "all" ? "/store" : `/store?category=${encodeURIComponent(c)}`}
            className={cn(
              "border px-4 py-2 font-display text-xs font-semibold uppercase tracking-widest transition-all clip-corner-sm",
              category === c
                ? "border-primary bg-primary text-primary-foreground shadow-[0_0_16px_rgba(230,20,45,0.45)]"
                : "border-border text-muted-foreground hover:border-primary/60 hover:text-primary"
            )}
          >
            {c === "all" ? "All Gear" : c}
          </Link>
        ))}
      </nav>

      {filtered.length === 0 ? (
        <div className="mt-12 flex flex-col items-center gap-4 border border-dashed border-border py-20 text-center clip-corner">
          <ShoppingBag className="h-10 w-10 text-muted-foreground/50" aria-hidden />
          <p className="text-sm text-muted-foreground">No products in this category yet.</p>
        </div>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <div key={p.id} className="glow-hover flex flex-col overflow-hidden border border-border bg-card clip-corner">
              <div className="relative aspect-square overflow-hidden bg-secondary">
                {p.imageUrl ? (
                  <Image
                    src={p.imageUrl}
                    alt={p.name}
                    fill
                    unoptimized
                    className="img-cover transition-transform duration-500 hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 400px"
                  />
                ) : (
                  <div className="img-cover bg-grid flex items-center justify-center">
                    <ShoppingBag className="h-12 w-12 text-primary/30" aria-hidden />
                  </div>
                )}
                {p.featured && (
                  <span className="absolute left-3 top-3 bg-primary px-2.5 py-1 font-display text-[10px] font-semibold uppercase tracking-widest text-primary-foreground clip-corner-sm shadow-[0_0_14px_rgba(230,20,45,0.5)]">
                    Top Pick
                  </span>
                )}
              </div>
              <div className="flex flex-1 flex-col p-5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-display uppercase tracking-widest text-muted-foreground">
                    {p.brand || p.category}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs text-amber-300">
                    <Star className="h-3.5 w-3.5 fill-amber-300" aria-hidden /> 4.{(p.id.length % 5) + 4}
                  </span>
                </div>
                <h3 className="mt-2 font-display text-lg font-semibold leading-snug">{p.name}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground line-clamp-3">
                  {p.description}
                </p>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="font-display text-2xl font-bold text-primary">
                    {formatPrice(p.price, p.currency)}
                  </span>
                  {p.oldPrice && p.oldPrice > p.price && (
                    <span className="text-sm text-muted-foreground line-through">
                      {formatPrice(p.oldPrice, p.currency)}
                    </span>
                  )}
                </div>
                <a
                  href={p.affiliateUrl}
                  target="_blank"
                  rel="sponsored noopener noreferrer"
                  className="btn-glow mt-4 inline-flex items-center justify-center gap-2 bg-primary px-5 py-3 font-display text-sm font-semibold uppercase tracking-widest text-primary-foreground clip-corner-sm"
                >
                  Buy Now <ExternalLink className="h-4 w-4" aria-hidden />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="mt-10 border border-border bg-card/60 px-5 py-4 text-xs leading-relaxed text-muted-foreground clip-corner-sm">
        {content.store_note}
      </p>
    </div>
  );
}
