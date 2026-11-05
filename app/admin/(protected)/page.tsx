"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Eye,
  TrendingUp,
  MousePointerClick,
  Newspaper,
  Trophy,
  Images,
  Gift,
  ShoppingBag,
  Inbox,
  Users,
  Loader2,
} from "lucide-react";
import { cn, formatDate } from "@/lib/utils";

type Stats = {
  totalViews: number;
  todayViews: number;
  series: { day: string; count: number }[];
  topPaths: { path: string; count: number }[];
  content: { articles: number; codes: number; wallpapers: number; freebies: number; products: number };
  unreadMessages: number;
  subscribers: number;
  recentMessages: { id: string; name: string; subject: string | null; createdAt: string; read: boolean }[];
};

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("Failed to load"))))
      .then(setStats)
      .catch((e) => setError(e.message));
  }, []);

  if (error) return <p className="text-sm text-red-400">{error}</p>;
  if (!stats)
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" aria-label="Loading dashboard" />
      </div>
    );

  const maxCount = Math.max(1, ...stats.series.map((s) => s.count));

  const cards = [
    { label: "Total Page Views", value: stats.totalViews.toLocaleString(), icon: Eye },
    { label: "Views Today", value: stats.todayViews.toLocaleString(), icon: TrendingUp },
    { label: "Subscribers", value: stats.subscribers.toLocaleString(), icon: Users },
    { label: "Unread Messages", value: stats.unreadMessages.toLocaleString(), icon: Inbox },
  ];

  const contentCards = [
    { label: "Articles", value: stats.content.articles, icon: Newspaper, href: "/admin/news" },
    { label: "Cheat Codes", value: stats.content.codes, icon: Trophy, href: "/admin/codes" },
    { label: "Wallpapers", value: stats.content.wallpapers, icon: Images, href: "/admin/wallpapers" },
    { label: "Live Freebies", value: stats.content.freebies, icon: Gift, href: "/admin/freebies" },
    { label: "Products", value: stats.content.products, icon: ShoppingBag, href: "/admin/store" },
  ];

  return (
    <div className="fade-up mx-auto max-w-6xl space-y-8">
      <div>
        <p className="kicker">Control room</p>
        <h1 className="mt-1 font-display text-2xl font-bold uppercase sm:text-3xl">Dashboard</h1>
      </div>

      {/* traffic */}
      <section aria-label="Traffic overview">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map(({ label, value, icon: Icon }) => (
            <div key={label} className="border border-border bg-card p-5 clip-corner-sm">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-display uppercase tracking-widest text-muted-foreground">{label}</p>
                <Icon className="h-4 w-4 text-primary" aria-hidden />
              </div>
              <p className="mt-2 font-display text-3xl font-bold">{value}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 border border-border bg-card p-5 clip-corner-sm">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-sm font-bold uppercase tracking-widest">Page views — last 14 days</h2>
            <MousePointerClick className="h-4 w-4 text-primary" aria-hidden />
          </div>
          <div className="mt-4 flex h-36 items-end gap-1.5" role="img" aria-label="Bar chart of page views over the last 14 days">
            {stats.series.map((s) => (
              <div key={s.day} className="group relative flex h-full flex-1 flex-col items-center justify-end">
                <span className="pointer-events-none absolute -top-7 hidden whitespace-nowrap bg-background border border-border px-2 py-0.5 text-[10px] group-hover:block">
                  {s.count} · {s.day.slice(5)}
                </span>
                <div
                  className={cn(
                    "w-full rounded-t-sm transition-all",
                    s.count > 0
                      ? "bg-primary/80 shadow-[0_0_12px_rgba(230,20,45,0.35)] group-hover:bg-primary"
                      : "bg-border"
                  )}
                  style={{ height: `${Math.max(3, (s.count / maxCount) * 90)}%` }}
                />
                <span className="mt-1.5 text-[9px] text-muted-foreground">{s.day.slice(8)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 border border-border bg-card p-5 clip-corner-sm">
          <h2 className="font-display text-sm font-bold uppercase tracking-widest">Top pages</h2>
          {stats.topPaths.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">
              No traffic recorded yet — visit the public site to start counting.
            </p>
          ) : (
            <ul className="mt-3 space-y-2">
              {stats.topPaths.map((t) => {
                const max = stats.topPaths[0].count || 1;
                return (
                  <li key={t.path} className="flex items-center gap-3 text-sm">
                    <span className="w-40 shrink-0 truncate text-muted-foreground">{t.path}</span>
                    <span className="h-2 flex-1 overflow-hidden rounded-full bg-border">
                      <span
                        className="block h-full rounded-full bg-primary shadow-[0_0_8px_rgba(230,20,45,0.6)]"
                        style={{ width: `${Math.max(3, (t.count / max) * 100)}%` }}
                      />
                    </span>
                    <span className="w-14 shrink-0 text-right font-display font-semibold">{t.count.toLocaleString()}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>

      {/* content overview */}
      <section aria-label="Content overview">
        <h2 className="font-display text-sm font-bold uppercase tracking-widest text-muted-foreground">Content</h2>
        <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {contentCards.map(({ label, value, icon: Icon, href }) => (
            <Link
              key={label}
              href={href}
              className="glow-hover flex flex-col items-center gap-1 border border-border bg-card p-4 text-center clip-corner-sm"
            >
              <Icon className="h-5 w-5 text-primary" aria-hidden />
              <span className="font-display text-2xl font-bold">{value}</span>
              <span className="text-[10px] font-display uppercase tracking-widest text-muted-foreground">{label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* recent messages */}
      <section aria-label="Recent messages">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-sm font-bold uppercase tracking-widest text-muted-foreground">
            Recent messages
          </h2>
          <Link href="/admin/messages" className="text-xs font-display uppercase tracking-widest text-primary hover:underline">
            View all
          </Link>
        </div>
        {stats.recentMessages.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">No messages yet.</p>
        ) : (
          <ul className="mt-3 divide-y divide-border border border-border bg-card clip-corner-sm">
            {stats.recentMessages.map((m) => (
              <li key={m.id} className="flex items-center gap-3 px-4 py-3">
                {!m.read && <span className="h-2 w-2 shrink-0 rounded-full bg-primary live-dot" aria-label="unread" />}
                <span className="flex-1 truncate text-sm">{m.subject || m.name}</span>
                <span className="shrink-0 text-xs text-muted-foreground">{formatDate(m.createdAt)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
