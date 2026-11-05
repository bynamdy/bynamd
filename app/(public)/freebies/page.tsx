import type { Metadata } from "next";
import Image from "next/image";
import { Gift, ExternalLink, Clock } from "lucide-react";
import { db } from "@/lib/db";
import { getContent } from "@/lib/site";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Free Games, Giveaways & Deals",
  description:
    "Free games this week, gaming giveaways and hot deals across Epic, Steam, GOG, Prime Gaming and more — updated daily by Bynamdy.",
  alternates: { canonical: "/freebies" },
  openGraph: {
    title: "Free Games, Giveaways & Deals | Bynamdy",
    description: "Free games this week, gaming giveaways and hot deals across every major store.",
    type: "website",
  },
};

const typeStyle: Record<string, { label: string; className: string }> = {
  free: { label: "Free Game", className: "border-emerald-400/50 text-emerald-300 bg-emerald-400/10" },
  giveaway: { label: "Giveaway", className: "border-amber-400/50 text-amber-300 bg-amber-400/10" },
  deal: { label: "Deal", className: "border-primary/60 text-primary bg-primary/10" },
};

export default async function FreebiesPage() {
  const [content, freebies] = await Promise.all([
    getContent(),
    db.freebie.findMany({ where: { active: true }, orderBy: { createdAt: "desc" } }),
  ]);

  const free = freebies.filter((f) => f.type === "free");
  const giveaways = freebies.filter((f) => f.type === "giveaway");
  const deals = freebies.filter((f) => f.type === "deal");

  const sections = [
    { title: "Free Games This Week", items: free },
    { title: "Active Giveaways", items: giveaways },
    { title: "Hot Deals", items: deals },
  ].filter((s) => s.items.length > 0);

  return (
    <div className="fade-up mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:py-16">
      <div className="flex flex-col gap-2">
        <p className="kicker">Don&apos;t pay if you don&apos;t have to</p>
        <h1 className="font-display text-3xl font-bold uppercase sm:text-5xl">
          Freebies &amp; <span className="text-primary text-glow">Deals</span>
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          {content.freebies_note}
        </p>
      </div>

      {sections.length === 0 && (
        <div className="mt-12 flex flex-col items-center gap-4 border border-dashed border-border py-20 text-center clip-corner">
          <Gift className="h-10 w-10 text-muted-foreground/50" aria-hidden />
          <p className="text-sm text-muted-foreground">No live freebies right now. Check back soon!</p>
        </div>
      )}

      <div className="mt-10 space-y-12">
        {sections.map((section) => (
          <section key={section.title} aria-label={section.title}>
            <h2 className="font-display text-2xl font-bold uppercase">{section.title}</h2>
            <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {section.items.map((f) => {
                const style = typeStyle[f.type] || typeStyle.deal;
                const expired = f.endsAt ? new Date(f.endsAt) < new Date() : false;
                return (
                  <div key={f.id} className="glow-hover flex flex-col overflow-hidden border border-border bg-card clip-corner">
                    {f.imageUrl && (
                      <div className="relative aspect-[16/9] overflow-hidden">
                        <Image
                          src={f.imageUrl}
                          alt={f.title}
                          fill
                          unoptimized
                          className="img-cover"
                          sizes="(max-width: 768px) 100vw, 400px"
                        />
                      </div>
                    )}
                    <div className="flex flex-1 flex-col p-5">
                      <div className="flex items-center gap-2">
                        <span className={`border px-2 py-0.5 text-[10px] font-display font-semibold uppercase tracking-widest ${style.className}`}>
                          {style.label}
                        </span>
                        {f.platform && (
                          <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{f.platform}</span>
                        )}
                      </div>
                      <h3 className="mt-3 font-display text-lg font-semibold leading-snug">{f.title}</h3>
                      <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{f.description}</p>
                      <div className="mt-4 flex items-center justify-between gap-3">
                        <div className="text-sm">
                          {f.priceOriginal && (
                            <span className="mr-2 text-muted-foreground line-through">{f.priceOriginal}</span>
                          )}
                          {f.priceDeal && <span className="font-display font-bold text-primary">{f.priceDeal}</span>}
                        </div>
                        {f.endsAt && (
                          <span className={`inline-flex items-center gap-1 text-xs ${expired ? "text-muted-foreground" : "text-amber-300"}`}>
                            <Clock className="h-3.5 w-3.5" aria-hidden />
                            {expired ? "Expired" : `Ends ${formatDate(f.endsAt)}`}
                          </span>
                        )}
                      </div>
                      <a
                        href={f.url}
                        target="_blank"
                        rel="sponsored noopener noreferrer"
                        className="btn-glow mt-4 inline-flex items-center justify-center gap-2 bg-primary px-5 py-3 font-display text-sm font-semibold uppercase tracking-widest text-primary-foreground clip-corner-sm"
                      >
                        Claim Offer <ExternalLink className="h-4 w-4" aria-hidden />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
