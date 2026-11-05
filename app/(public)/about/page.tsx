import type { Metadata } from "next";
import { Gamepad2, Newspaper, Trophy, Images, Gift, ShoppingBag } from "lucide-react";
import { getContent } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Bynamdy is a gaming media hub for players worldwide and in Nigeria — game news, cheat codes, wallpapers, freebies and gear. Learn our story.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About Bnamdy | Bynamdy",
    description: "A gaming media hub for players worldwide and in Nigeria — news, codes, wallpapers, freebies and gear.",
    type: "website",
  },
};

export default async function AboutPage() {
  const content = await getContent();
  const paragraphs = content.about_body.split("\n").filter((p) => p.trim() !== "");

  const pillars = [
    { icon: Newspaper, title: "News That Matters", text: "Release dates, patch notes and breaking stories — no clickbait, no filler." },
    { icon: Trophy, title: "Working Cheat Codes", text: "Every code is checked and tagged by platform: PC, PlayStation, Xbox and Mobile." },
    { icon: Images, title: "Free 4K Wallpapers", text: "Fresh wallpapers for desktop and mobile, free to download — always." },
    { icon: Gift, title: "Freebies & Deals", text: "We track free games, giveaways and price drops across every major store." },
    { icon: ShoppingBag, title: "Gear We Rate", text: "Affiliate-picked headsets, keyboards, mice and more — honest picks only." },
    { icon: Gamepad2, title: "For Every Gamer", text: "From Lagos to Los Angeles — console, PC and mobile players, one squad." },
  ];

  return (
    <div className="fade-up mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:py-16">
      <div className="flex flex-col gap-2">
        <p className="kicker">Who we are</p>
        <h1 className="font-display text-3xl font-bold uppercase sm:text-5xl">
          About <span className="text-primary text-glow">Bynamdy</span>
        </h1>
      </div>

      <div className="mt-8 space-y-5 text-base leading-relaxed text-foreground/85">
        {paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>

      <div className="mt-14">
        <h2 className="font-display text-2xl font-bold uppercase">
          What we <span className="text-primary">do</span>
        </h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {pillars.map(({ icon: Icon, title, text }) => (
            <div key={title} className="glow-hover border border-border bg-card p-5 clip-corner-sm">
              <Icon className="h-6 w-6 text-primary" aria-hidden />
              <h3 className="mt-3 font-display text-base font-semibold uppercase tracking-wide">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{text}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-14 border border-primary/40 bg-gradient-to-br from-primary/15 via-card to-background p-8 clip-corner">
        <h2 className="font-display text-xl font-bold uppercase">Our promise</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          No paywalls. No fake leaks. No spam. Just a fast, sharp gaming hub that respects your time —
          whether you&apos;re grinding ranked on mobile data in Lagos or streaming 4K in New York.
        </p>
      </div>
    </div>
  );
}
