import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { siteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();

  const staticRoutes: MetadataRoute.Sitemap = ([
    { url: `${base}/`, changeFrequency: "daily", priority: 1 },
    { url: `${base}/news`, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/codes`, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/wallpapers`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/freebies`, changeFrequency: "daily", priority: 0.8 },
    { url: `${base}/store`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/about`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/contact`, changeFrequency: "monthly", priority: 0.5 },
  ] as MetadataRoute.Sitemap).map((r) => ({ ...r, lastModified: new Date() }));

  try {
    const [articles, codes] = await Promise.all([
      db.article.findMany({ where: { published: true }, select: { slug: true, updatedAt: true } }),
      db.cheatCode.findMany({ select: { slug: true, updatedAt: true } }),
    ]);

    return [
      ...staticRoutes,
      ...articles.map((a) => ({
        url: `${base}/news/${a.slug}`,
        lastModified: a.updatedAt,
        changeFrequency: "weekly" as const,
        priority: 0.7,
      })),
      ...codes.map((c) => ({
        url: `${base}/codes/${c.slug}`,
        lastModified: c.updatedAt,
        changeFrequency: "monthly" as const,
        priority: 0.6,
      })),
    ];
  } catch {
    return staticRoutes;
  }
}
