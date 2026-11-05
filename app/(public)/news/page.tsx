import type { Metadata } from "next";
import Link from "next/link";
import { Newspaper } from "lucide-react";
import { db } from "@/lib/db";
import { ArticleCard } from "@/components/article-card";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Game News, Updates & Releases",
  description:
    "The latest gaming news, patch updates and release dates for PC, PlayStation, Xbox and Mobile — curated by Bynamdy for gamers worldwide and in Nigeria.",
  alternates: { canonical: "/news" },
  openGraph: {
    title: "Game News, Updates & Releases | Bynamdy",
    description:
      "The latest gaming news, patch updates and release dates for PC, PlayStation, Xbox and Mobile.",
    type: "website",
  },
};

const CATEGORIES = [
  { value: "all", label: "All" },
  { value: "news", label: "Game News" },
  { value: "updates", label: "Updates" },
  { value: "releases", label: "Releases" },
];

export default async function NewsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category = "all" } = await searchParams;
  const active = CATEGORIES.find((c) => c.value === category) ? category : "all";

  const articles = await db.article.findMany({
    where: { published: true, ...(active !== "all" ? { category: active } : {}) },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="fade-up mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:py-16">
      <div className="flex flex-col gap-2">
        <p className="kicker">Stay in the game</p>
        <h1 className="font-display text-3xl font-bold uppercase sm:text-5xl">
          Gaming <span className="text-primary text-glow">News</span>
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          Breaking stories, patch notes and release info across PC, PlayStation, Xbox and Mobile.
        </p>
      </div>

      {/* category tabs */}
      <nav className="mt-8 flex flex-wrap gap-2" aria-label="News categories">
        {CATEGORIES.map((c) => (
          <Link
            key={c.value}
            href={c.value === "all" ? "/news" : `/news?category=${c.value}`}
            className={cn(
              "border px-4 py-2 font-display text-xs font-semibold uppercase tracking-widest transition-all clip-corner-sm",
              active === c.value
                ? "border-primary bg-primary text-primary-foreground shadow-[0_0_16px_rgba(230,20,45,0.45)]"
                : "border-border text-muted-foreground hover:border-primary/60 hover:text-primary"
            )}
            aria-current={active === c.value ? "page" : undefined}
          >
            {c.label}
          </Link>
        ))}
      </nav>

      {articles.length === 0 ? (
        <div className="mt-16 flex flex-col items-center gap-4 border border-dashed border-border py-20 text-center clip-corner">
          <Newspaper className="h-10 w-10 text-muted-foreground/50" aria-hidden />
          <p className="text-sm text-muted-foreground">No articles in this category yet. Check back soon!</p>
        </div>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((a) => (
            <ArticleCard key={a.id} article={a} />
          ))}
        </div>
      )}
    </div>
  );
}
