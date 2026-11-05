import type { Metadata } from "next";
import { Images } from "lucide-react";
import { db } from "@/lib/db";
import { WallpaperGallery } from "@/components/wallpaper-gallery";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "4K Gaming Wallpapers — Free Download",
  description:
    "Browse and download free 4K gaming wallpapers: games, cars, sci-fi, abstract and anime. Curated by Bnamdy for desktop and mobile screens.",
  alternates: { canonical: "/wallpapers" },
  openGraph: {
    title: "4K Gaming Wallpapers — Free Download | Bynamdy",
    description: "Browse and download free 4K gaming wallpapers: games, cars, sci-fi, abstract and anime.",
    type: "website",
  },
};

export default async function WallpapersPage() {
  const wallpapers = await db.wallpaper.findMany({
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
  });

  return (
    <div className="fade-up mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:py-16">
      <div className="flex flex-col gap-2">
        <p className="kicker">Fresh drops weekly</p>
        <h1 className="font-display text-3xl font-bold uppercase sm:text-5xl">
          Gaming <span className="text-primary text-glow">Wallpapers</span>
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          Hand-picked 4K wallpapers for your desktop, phone and battle station. Click any wallpaper to
          view full size, then hit download.
        </p>
      </div>

      <div className="mt-10">
        {wallpapers.length === 0 ? (
          <div className="flex flex-col items-center gap-4 border border-dashed border-border py-20 text-center clip-corner">
            <Images className="h-10 w-10 text-muted-foreground/50" aria-hidden />
            <p className="text-sm text-muted-foreground">No wallpapers yet. Check back soon!</p>
          </div>
        ) : (
          <WallpaperGallery wallpapers={wallpapers} />
        )}
      </div>
    </div>
  );
}
