"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Download, Expand, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type WallpaperItem = {
  id: string;
  slug: string;
  title: string;
  category: string;
  imageUrl: string;
  resolution: string;
  downloads: number;
};

export function WallpaperGallery({ wallpapers }: { wallpapers: WallpaperItem[] }) {
  const categories = useMemo(
    () => ["All", ...Array.from(new Set(wallpapers.map((w) => w.category)))],
    [wallpapers]
  );
  const [active, setActive] = useState("All");
  const [preview, setPreview] = useState<WallpaperItem | null>(null);
  const [downloading, setDownloading] = useState<string | null>(null);

  const filtered = active === "All" ? wallpapers : wallpapers.filter((w) => w.category === active);

  async function trackDownload(id: string) {
    try {
      await fetch(`/api/wallpapers/${id}/download`, { method: "POST" });
    } catch {
      /* ignore */
    }
  }

  async function download(w: WallpaperItem) {
    setDownloading(w.id);
    await trackDownload(w.id);
    try {
      const res = await fetch(w.imageUrl);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${w.slug}-${w.resolution}.jpg`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      window.open(w.imageUrl, "_blank");
    } finally {
      setDownloading(null);
    }
  }

  return (
    <div>
      {/* category chips */}
      <nav className="flex flex-wrap gap-2" aria-label="Wallpaper categories">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setActive(c)}
            className={cn(
              "border px-4 py-2 font-display text-xs font-semibold uppercase tracking-widest transition-all clip-corner-sm",
              active === c
                ? "border-primary bg-primary text-primary-foreground shadow-[0_0_16px_rgba(230,20,45,0.45)]"
                : "border-border text-muted-foreground hover:border-primary/60 hover:text-primary"
            )}
          >
            {c}
          </button>
        ))}
      </nav>

      {/* grid */}
      <div className="mt-8 columns-1 gap-4 sm:columns-2 lg:columns-3">
        {filtered.map((w) => (
          <figure
            key={w.id}
            className="group glow-hover relative mb-4 break-inside-avoid overflow-hidden border border-border clip-corner"
          >
            <Image
              src={w.imageUrl}
              alt={`${w.title} wallpaper`}
              width={1280}
              height={720}
              unoptimized
              className="w-full transition-transform duration-500 group-hover:scale-[1.04]"
            />
            <figcaption className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-gradient-to-t from-black/90 to-transparent p-3 pt-8">
              <span className="min-w-0">
                <span className="block truncate font-display text-sm font-semibold uppercase tracking-wide text-white">
                  {w.title}
                </span>
                <span className="block text-[10px] uppercase tracking-widest text-white/60">
                  {w.category} &middot; {w.resolution}
                </span>
              </span>
              <span className="flex shrink-0 gap-1.5">
                <button
                  onClick={() => setPreview(w)}
                  aria-label={`View ${w.title} full size`}
                  className="flex h-9 w-9 items-center justify-center border border-white/20 bg-black/50 text-white backdrop-blur transition-all hover:border-primary hover:text-primary clip-corner-sm"
                >
                  <Expand className="h-4 w-4" />
                </button>
                <button
                  onClick={() => download(w)}
                  disabled={downloading === w.id}
                  aria-label={`Download ${w.title}`}
                  className="flex h-9 w-9 items-center justify-center border border-primary/60 bg-primary/90 text-primary-foreground backdrop-blur transition-all hover:shadow-[0_0_16px_rgba(230,20,45,0.7)] clip-corner-sm"
                >
                  <Download className="h-4 w-4" />
                </button>
              </span>
            </figcaption>
          </figure>
        ))}
      </div>

      {/* lightbox */}
      {preview && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label={preview.title}
          onClick={() => setPreview(null)}
        >
          <div className="relative max-h-full max-w-6xl" onClick={(e) => e.stopPropagation()}>
            <Image
              src={preview.imageUrl}
              alt={`${preview.title} full size`}
              width={1920}
              height={1080}
              unoptimized
              className="max-h-[80vh] w-auto max-w-full object-contain"
            />
            <div className="mt-4 flex items-center justify-between gap-4">
              <div>
                <p className="font-display text-lg font-bold uppercase tracking-wide text-white">
                  {preview.title}
                </p>
                <p className="text-xs uppercase tracking-widest text-white/60">
                  {preview.category} &middot; {preview.resolution} &middot; {preview.downloads.toLocaleString()} downloads
                </p>
              </div>
              <button
                onClick={() => download(preview)}
                disabled={downloading === preview.id}
                className="btn-glow inline-flex items-center gap-2 bg-primary px-6 py-3 font-display text-sm font-semibold uppercase tracking-widest text-primary-foreground clip-corner-sm"
              >
                <Download className="h-4 w-4" aria-hidden /> Download
              </button>
            </div>
            <button
              onClick={() => setPreview(null)}
              aria-label="Close preview"
              className="absolute -top-3 right-0 flex h-10 w-10 items-center justify-center border border-white/20 bg-black/70 text-white transition-colors hover:border-primary hover:text-primary clip-corner-sm sm:-top-12"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
