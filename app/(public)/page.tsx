import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  ChevronRight,
  Download,
  Images,
  Newspaper,
  Sparkles,
  Store,
  Trophy,
} from "lucide-react";
import { getContent } from "@/lib/site";
import { db } from "@/lib/db";
import { ArticleCard } from "@/components/article-card";
import { CopyCodeButton } from "@/components/copy-code-button";
import { NewsletterForm } from "@/components/newsletter-form";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const content = await getContent();

  const [articles, codes, wallpapers, articleCount, codeCount, wallpaperCount] =
    await Promise.all([
      db.article.findMany({
        where: { published: true },
        orderBy: { createdAt: "desc" },
        take: 7,
      }),
      db.cheatCode.findMany({ orderBy: { views: "desc" }, take: 6 }),
      db.wallpaper.findMany({ orderBy: [{ featured: "desc" }, { createdAt: "desc" }], take: 6 }),
      db.article.count({ where: { published: true } }),
      db.cheatCode.count(),
      db.wallpaper.count(),
    ]);

  const featuredArticle = articles[0];
  const moreArticles = articles.slice(1, 7);

  const platformColor = (p: string) => {
    switch (p) {
      case "PC":
        return "border-primary/60 text-primary bg-primary/10";
      case "PlayStation":
        return "border-slate-400/40 text-slate-200 bg-slate-400/10";
      case "Xbox":
        return "border-emerald-400/40 text-emerald-300 bg-emerald-400/10";
      default:
        return "border-amber-400/40 text-amber-300 bg-amber-400/10";
    }
  };

  return (
    <div className="fade-up">
      {/* ================= HERO ================= */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0">
          <Image
            src="/images/hero.png"
            alt="Gaming setup with red neon lights"
            fill
            priority
            unoptimized
            className="img-cover opacity-40"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/40" />
          <div className="absolute inset-0 bg-grid opacity-60" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:py-36">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 border border-primary/50 bg-primary/10 px-3.5 py-1.5 text-xs font-display uppercase tracking-widest text-primary clip-corner-sm">
              <span className="live-dot inline-block h-2 w-2 rounded-full bg-primary" aria-hidden />
              {content.hero_badge}
            </span>
            <h1 className="mt-6 font-display text-4xl font-bold uppercase leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
              {content.hero_title.split(" ").slice(0, -2).join(" ")}{" "}
              <span className="text-primary text-glow">
                {content.hero_title.split(" ").slice(-2).join(" ")}
              </span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              {content.hero_subtitle}
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/news"
                className="btn-glow inline-flex items-center gap-2 bg-primary px-7 py-3.5 font-display text-sm font-semibold uppercase tracking-widest text-primary-foreground clip-corner-sm"
              >
                <Newspaper className="h-4 w-4" aria-hidden /> Latest News
              </Link>
              <Link
                href="/store"
                className="inline-flex items-center gap-2 border border-border bg-background/50 px-7 py-3.5 font-display text-sm font-semibold uppercase tracking-widest text-foreground backdrop-blur transition-all hover:border-primary hover:text-primary hover:shadow-[0_0_20px_rgba(230,20,45,0.35)] clip-corner-sm"
              >
                <Store className="h-4 w-4" aria-hidden /> Explore Store
              </Link>
            </div>

            {/* stats */}
            <dl className="mt-12 grid max-w-lg grid-cols-3 gap-px border border-border bg-border clip-corner-sm">
              {[
                { label: "News Articles", value: articleCount, icon: Newspaper },
                { label: "Cheat Codes", value: codeCount, icon: Trophy },
                { label: "Wallpapers", value: wallpaperCount, icon: Images },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} className="flex flex-col items-center bg-background/90 px-3 py-4 text-center">
                  <Icon className="h-4 w-4 text-primary" aria-hidden />
                  <dt className="mt-1.5 order-2 text-[10px] font-display uppercase tracking-widest text-muted-foreground">
                    {label}
                  </dt>
                  <dd className="order-1 font-display text-2xl font-bold text-foreground">{value}+</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* ================= TICKER ================= */}
      <section className="overflow-hidden border-b border-border bg-card/60 py-2.5" aria-hidden>
        <div className="flex w-max animate-ticker gap-8 whitespace-nowrap">
          {[...articles.slice(0, 5), ...articles.slice(0, 5)].map((a, i) => (
            <span key={i} className="inline-flex items-center gap-2 text-xs font-display uppercase tracking-widest text-muted-foreground">
              <Sparkles className="h-3 w-3 text-primary" />
              {a.title}
            </span>
          ))}
        </div>
      </section>

      {/* ================= LATEST NEWS ================= */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-20">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="kicker">Fresh off the press</p>
            <h2 className="mt-2 font-display text-3xl font-bold uppercase sm:text-4xl">
              {content.news_section_title}
            </h2>
          </div>
          <Link
            href="/news"
            className="hidden items-center gap-1 font-display text-sm uppercase tracking-widest text-muted-foreground transition-colors hover:text-primary sm:inline-flex"
          >
            View all <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>

        {featuredArticle && (
          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <ArticleCard article={featuredArticle} featured />
            <div className="grid gap-6 sm:grid-cols-2">
              {moreArticles.slice(0, 2).map((a) => (
                <ArticleCard key={a.id} article={a} />
              ))}
              {moreArticles.slice(2, 4).map((a) => (
                <ArticleCard key={a.id} article={a} className="sm:col-span-2 sm:flex-row" />
              ))}
            </div>
          </div>
        )}
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {moreArticles.slice(4, 7).map((a) => (
            <ArticleCard key={a.id} article={a} />
          ))}
        </div>
        <Link
          href="/news"
          className="mt-8 inline-flex items-center gap-1 font-display text-sm uppercase tracking-widest text-primary sm:hidden"
        >
          View all news <ChevronRight className="h-4 w-4" aria-hidden />
        </Link>
      </section>

      {/* ================= TRENDING CHEAT CODES ================= */}
      <section className="border-y border-border bg-card/40 py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="kicker">Most searched</p>
              <h2 className="mt-2 font-display text-3xl font-bold uppercase sm:text-4xl">
                {content.codes_section_title}
              </h2>
            </div>
            <Link
              href="/codes"
              className="hidden items-center gap-1 font-display text-sm uppercase tracking-widest text-muted-foreground transition-colors hover:text-primary sm:inline-flex"
            >
              All codes <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {codes.map((code) => (
              <div
                key={code.id}
                className="glow-hover flex flex-col border border-border bg-background clip-corner"
              >
                <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
                  <Link
                    href={`/codes/${code.slug}`}
                    className="font-display text-sm font-semibold uppercase tracking-wide transition-colors hover:text-primary"
                  >
                    {code.gameTitle}
                  </Link>
                  <span className={`border px-2 py-0.5 text-[10px] font-display uppercase tracking-widest ${platformColor(code.platform)}`}>
                    {code.platform}
                  </span>
                </div>
                <div className="flex flex-1 flex-col gap-3 p-4">
                  <p className="text-sm text-muted-foreground">{code.effect}</p>
                  <div className="mt-auto flex items-center justify-between gap-2">
                    <code className="truncate bg-secondary px-3 py-1.5 font-mono text-xs text-foreground" title={code.code}>
                      {code.code}
                    </code>
                    <CopyCodeButton code={code.code} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= FEATURED WALLPAPERS ================= */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-20">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="kicker">Deck your screens</p>
            <h2 className="mt-2 font-display text-3xl font-bold uppercase sm:text-4xl">
              {content.wallpapers_section_title}
            </h2>
          </div>
          <Link
            href="/wallpapers"
            className="hidden items-center gap-1 font-display text-sm uppercase tracking-widest text-muted-foreground transition-colors hover:text-primary sm:inline-flex"
          >
            Gallery <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-3">
          {wallpapers.map((w) => (
            <Link
              key={w.id}
              href="/wallpapers"
              className="group glow-hover relative aspect-video overflow-hidden border border-border clip-corner"
            >
              {w.imageUrl ? (
                <Image
                  src={w.imageUrl}
                  alt={w.title}
                  fill
                  unoptimized
                  className="img-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 50vw, 33vw"
                />
              ) : (
                <div className="img-cover bg-grid flex items-center justify-center bg-secondary" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent" />
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between p-3">
                <span className="truncate font-display text-xs font-semibold uppercase tracking-wider text-white">
                  {w.title}
                </span>
                <Download className="h-4 w-4 shrink-0 text-primary" aria-hidden />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ================= NEWSLETTER ================= */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
        <div className="relative overflow-hidden border border-primary/40 bg-gradient-to-br from-primary/15 via-card to-background p-8 clip-corner sm:p-12">
          <div className="absolute inset-0 bg-grid opacity-40" aria-hidden />
          <div className="relative grid items-center gap-8 lg:grid-cols-2">
            <div>
              <p className="kicker">Weekly drop</p>
              <h2 className="mt-2 font-display text-3xl font-bold uppercase text-glow sm:text-4xl">
                {content.newsletter_title}
              </h2>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
                {content.newsletter_text}
              </p>
            </div>
            <NewsletterForm source="home" />
          </div>
        </div>
      </section>
    </div>
  );
}
