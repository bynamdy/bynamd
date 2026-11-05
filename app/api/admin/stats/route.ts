import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const today = new Date().toISOString().slice(0, 10);
  const since = new Date(Date.now() - 13 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  const [
    totalViews,
    todayViews,
    daily,
    topPaths,
    articles,
    codes,
    wallpapers,
    freebies,
    products,
    unread,
    subscribers,
    recentMessages,
  ] = await Promise.all([
    db.pageView.aggregate({ _sum: { count: true } }),
    db.pageView.aggregate({ _sum: { count: true }, where: { day: today } }),
    db.pageView.findMany({ where: { day: { gte: since } } }),
    db.pageView.groupBy({ by: ["path"], _sum: { count: true }, orderBy: { _sum: { count: "desc" } }, take: 8 }),
    db.article.count(),
    db.cheatCode.count(),
    db.wallpaper.count(),
    db.freebie.count({ where: { active: true } }),
    db.product.count(),
    db.contactMessage.count({ where: { read: false } }),
    db.newsletterSubscriber.count(),
    db.contactMessage.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
  ]);

  // build last-14-day series
  const series: { day: string; count: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    series.push({ day: d, count: 0 });
  }
  for (const row of daily) {
    const s = series.find((x) => x.day === row.day);
    if (s) s.count += row.count;
  }

  return NextResponse.json({
    totalViews: totalViews._sum.count || 0,
    todayViews: todayViews._sum.count || 0,
    series,
    topPaths: topPaths.map((t) => ({ path: t.path, count: t._sum.count || 0 })),
    content: { articles, codes, wallpapers, freebies, products },
    unreadMessages: unread,
    subscribers,
    recentMessages,
  });
}
