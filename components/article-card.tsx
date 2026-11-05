import Link from "next/link";
import Image from "next/image";
import { CalendarDays, Eye, Flame } from "lucide-react";
import { cn, categoryLabel, formatDate } from "@/lib/utils";

export type ArticleCardData = {
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  coverImage: string | null;
  views: number;
  createdAt: Date;
};

export function ArticleCard({
  article,
  featured = false,
  className,
}: {
  article: ArticleCardData;
  featured?: boolean;
  className?: string;
}) {
  return (
    <Link
      href={`/news/${article.slug}`}
      className={cn(
        "group glow-hover flex flex-col overflow-hidden border border-border bg-card clip-corner",
        className
      )}
    >
      <div className={cn("relative overflow-hidden", featured ? "aspect-[16/9]" : "aspect-[16/10]")}>
        {article.coverImage ? (
          <Image
            src={article.coverImage}
            alt={article.title}
            fill
            unoptimized
            className="img-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 400px"
          />
        ) : (
          <div className="img-cover bg-grid flex items-center justify-center bg-secondary">
            <span className="font-display text-3xl font-bold text-primary/40">BD</span>
          </div>
        )}
        <span className="absolute left-3 top-3 bg-primary px-2.5 py-1 font-display text-[10px] font-semibold uppercase tracking-widest text-primary-foreground clip-corner-sm shadow-[0_0_14px_rgba(230,20,45,0.5)]">
          {categoryLabel(article.category)}
        </span>
      </div>
      <div className={cn("flex flex-1 flex-col p-4", featured && "p-5")}>
        <h3
          className={cn(
            "font-display font-semibold leading-snug text-foreground transition-colors group-hover:text-primary",
            featured ? "text-xl sm:text-2xl" : "text-base"
          )}
        >
          {article.title}
        </h3>
        <p className={cn("mt-2 flex-1 text-sm leading-relaxed text-muted-foreground", featured ? "line-clamp-3" : "line-clamp-2")}>
          {article.excerpt}
        </p>
        <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5 text-primary" aria-hidden />
            {formatDate(article.createdAt)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Eye className="h-3.5 w-3.5 text-primary" aria-hidden />
            {article.views.toLocaleString()} views
          </span>
        </div>
      </div>
    </Link>
  );
}

export function TrendingTag() {
  return (
    <span className="inline-flex items-center gap-1 bg-primary/15 px-2 py-0.5 text-[10px] font-display font-semibold uppercase tracking-widest text-primary">
      <Flame className="h-3 w-3" aria-hidden /> Trending
    </span>
  );
}
