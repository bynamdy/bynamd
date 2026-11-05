import type { Metadata } from "next";
import Link from "next/link";
import { Gamepad2, Search } from "lucide-react";
import { db } from "@/lib/db";
import { PLATFORMS } from "@/lib/site";
import { CopyCodeButton } from "@/components/copy-code-button";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Cheat Codes for PC, PlayStation, Xbox & Mobile",
  description:
    "Search working cheat codes by game title and platform — PC, PlayStation, Xbox and Mobile. God mode, money, unlocks and more, curated daily by Bnamdy.",
  alternates: { canonical: "/codes" },
  openGraph: {
    title: "Cheat Codes for PC, PlayStation, Xbox & Mobile | Bynamdy",
    description: "Search working cheat codes by game title and platform. God mode, money, unlocks and more.",
    type: "website",
  },
};

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

export default async function CodesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; platform?: string }>;
}) {
  const { q = "", platform = "all" } = await searchParams;
  const query = q.trim();

  const allCodes = await db.cheatCode.findMany({ orderBy: [{ gameTitle: "asc" }, { effect: "asc" }] });

  const codes = allCodes.filter((c) => {
    const matchesPlatform = platform === "all" || c.platform === platform;
    if (!matchesPlatform) return false;
    if (!query) return true;
    const hay = `${c.gameTitle} ${c.effect} ${c.code}`.toLowerCase();
    return query.toLowerCase().split(/\s+/).every((word) => hay.includes(word));
  });

  const grouped = codes.reduce<Record<string, typeof codes>>((acc, c) => {
    (acc[c.gameTitle] ||= []).push(c);
    return acc;
  }, {});

  return (
    <div className="fade-up mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:py-16">
      <div className="flex flex-col gap-2">
        <p className="kicker">Unlock everything</p>
        <h1 className="font-display text-3xl font-bold uppercase sm:text-5xl">
          Cheat <span className="text-primary text-glow">Codes</span>
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          Search by game title or effect, then filter by platform. Tap any code for full details.
        </p>
      </div>

      {/* search + filters */}
      <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-center">
        <form action="/codes" method="get" className="relative flex-1" role="search">
          {platform !== "all" && <input type="hidden" name="platform" value={platform} />}
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <input
            type="search"
            name="q"
            defaultValue={query}
            placeholder="Search game title, e.g. GTA, EA FC, COD…"
            className="h-12 w-full border border-border bg-background/70 pl-10 pr-4 text-sm outline-none transition-all placeholder:text-muted-foreground/60 focus:border-primary focus:shadow-[0_0_18px_rgba(230,20,45,0.25)] clip-corner-sm"
            aria-label="Search cheat codes"
          />
        </form>
        <nav className="flex flex-wrap gap-2" aria-label="Platform filter">
          {["all", ...PLATFORMS].map((p) => (
            <Link
              key={p}
              href={`/codes?${p === "all" ? "" : `platform=${p}&`}${query ? `q=${encodeURIComponent(query)}` : ""}`.replace(/[?&]$/, "") || "/codes"}
              className={cn(
                "border px-4 py-2 font-display text-xs font-semibold uppercase tracking-widest transition-all clip-corner-sm",
                platform === p
                  ? "border-primary bg-primary text-primary-foreground shadow-[0_0_16px_rgba(230,20,45,0.45)]"
                  : "border-border text-muted-foreground hover:border-primary/60 hover:text-primary"
              )}
            >
              {p === "all" ? "All Platforms" : p}
            </Link>
          ))}
        </nav>
      </div>

      <p className="mt-6 text-xs uppercase tracking-widest text-muted-foreground">
        {codes.length} code{codes.length === 1 ? "" : "s"} found{query && ` for “${query}”`}
      </p>

      {codes.length === 0 ? (
        <div className="mt-10 flex flex-col items-center gap-4 border border-dashed border-border py-20 text-center clip-corner">
          <Gamepad2 className="h-10 w-10 text-muted-foreground/50" aria-hidden />
          <p className="text-sm text-muted-foreground">
            No codes matched your search. Try a different game title or platform.
          </p>
          <Link href="/codes" className="text-sm font-display uppercase tracking-widest text-primary hover:underline">
            Reset search
          </Link>
        </div>
      ) : (
        <div className="mt-6 space-y-10">
          {Object.entries(grouped).map(([game, gameCodes]) => (
            <section key={game} aria-label={`Cheat codes for ${game}`}>
              <div className="flex items-center gap-3">
                <h2 className="font-display text-xl font-bold uppercase tracking-wide">{game}</h2>
                <span className="h-px flex-1 bg-gradient-to-r from-primary/60 to-transparent" aria-hidden />
                <span className="border border-border px-2 py-0.5 text-[10px] font-display uppercase tracking-widest text-muted-foreground">
                  {gameCodes[0].platform}
                </span>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {gameCodes.map((c) => (
                  <div key={c.id} className="glow-hover flex flex-col border border-border bg-card clip-corner-sm">
                    <div className="flex-1 p-4">
                      <p className="text-sm font-medium text-foreground">{c.effect}</p>
                      <code className="mt-3 block truncate bg-secondary px-3 py-2 font-mono text-xs text-primary" title={c.code}>
                        {c.code}
                      </code>
                    </div>
                    <div className="flex items-center justify-between border-t border-border px-4 py-2.5">
                      <Link
                        href={`/codes/${c.slug}`}
                        className="text-xs font-display uppercase tracking-widest text-muted-foreground transition-colors hover:text-primary"
                      >
                        Details
                      </Link>
                      <CopyCodeButton code={c.code} />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
