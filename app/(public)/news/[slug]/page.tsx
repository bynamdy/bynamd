import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { CalendarDays, ChevronRight, Eye, Tag } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { db } from "@/lib/db";
import { siteUrl, ARTICLE_CATEGORIES } from "@/lib/site";
import { ArticleCard } from "@/components/article-card";
import { categoryLabel, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

async function getArticle(slug: string) {
  try {
    return await db.article.findUnique({ where: { slug } });
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article || !article.published) {
    return { title: "Article Not Found" };
  }
  const title = article.seoTitle || article.title;
  const description = article.seoDescription || article.excerpt;
  return {
    title,
    description,
    alternates: { canonical: `/news/${article.slug}` },
    openGraph: {
      title,
      description,
      type: "article",
      url: `${siteUrl()}/news/${article.slug}`,
      images: article.coverImage ? [{ url: article.coverImage }] : undefined,
      publishedTime: article.createdAt.toISOString(),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: article.coverImage ? [article.coverImage] : undefined,
    },
  };
}

const mdComponents = {
  h2: (p: React.ComponentProps<"h2">) => (
    <h2 className="mt-10 mb-3 font-display text-2xl font-bold uppercase tracking-wide text-foreground" {...p} />
  ),
  h3: (p: React.ComponentProps<"h3">) => (
    <h3 className="mt-8 mb-2 font-display text-xl font-semibold text-foreground" {...p} />
  ),
  p: (p: React.ComponentProps<"p">) => <p className="mb-4 leading-relaxed text-foreground/85" {...p} />,
  ul: (p: React.ComponentProps<"ul">) => <ul className="mb-4 list-disc space-y-2 pl-6 text-foreground/85" {...p} />,
  ol: (p: React.ComponentProps<"ol">) => <ol className="mb-4 list-decimal space-y-2 pl-6 text-foreground/85" {...p} />,
  blockquote: (p: React.ComponentProps<"blockquote">) => (
    <blockquote className="my-6 border-l-4 border-primary bg-primary/5 px-5 py-3 text-foreground/90 italic" {...p} />
  ),
  a: (p: React.ComponentProps<"a">) => <a className="text-primary underline underline-offset-4 hover:text-glow" {...p} />,
  strong: (p: React.ComponentProps<"strong">) => <strong className="font-semibold text-foreground" {...p} />,
};

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article || !article.published) notFound();

  // fire-and-forget view increment
  db.article
    .update({ where: { id: article.id }, data: { views: { increment: 1 } } })
    .catch(() => {});

  const related = await db.article.findMany({
    where: { published: true, category: article.category, id: { not: article.id } },
    orderBy: { createdAt: "desc" },
    take: 3,
  });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    description: article.seoDescription || article.excerpt,
    image: article.coverImage ? [article.coverImage] : undefined,
    datePublished: article.createdAt.toISOString(),
    dateModified: article.updatedAt.toISOString(),
    publisher: { "@type": "Organization", name: "Bynamdy" },
    mainEntityOfPage: `${siteUrl()}/news/${article.slug}`,
  };

  return (
    <article className="fade-up">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* hero */}
      <div className="relative border-b border-border">
        <div className="absolute inset-0">
          {article.coverImage ? (
            <Image src={article.coverImage} alt="" fill priority unoptimized className="img-cover opacity-25" sizes="100vw" />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/85 to-background/50" />
        </div>
        <div className="relative mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:py-20">
          <nav className="flex items-center gap-1.5 text-xs text-muted-foreground" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-primary">Home</Link>
            <ChevronRight className="h-3 w-3" aria-hidden />
            <Link href="/news" className="hover:text-primary">News</Link>
            <ChevronRight className="h-3 w-3" aria-hidden />
            <span className="truncate text-foreground/70">{article.title}</span>
          </nav>
          <span className="mt-6 inline-flex items-center gap-1.5 bg-primary px-3 py-1 font-display text-[11px] font-semibold uppercase tracking-widest text-primary-foreground clip-corner-sm">
            <Tag className="h-3 w-3" aria-hidden /> {categoryLabel(article.category)}
          </span>
          <h1 className="mt-4 font-display text-3xl font-bold uppercase leading-tight sm:text-5xl">
            {article.title}
          </h1>
          <div className="mt-5 flex flex-wrap items-center gap-5 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="h-4 w-4 text-primary" aria-hidden /> {formatDate(article.createdAt)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Eye className="h-4 w-4 text-primary" aria-hidden /> {(article.views + 1).toLocaleString()} views
            </span>
          </div>
        </div>
      </div>

      {/* body */}
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
        <p className="mb-8 border-l-2 border-primary pl-4 text-base italic text-muted-foreground sm:text-lg">
          {article.excerpt}
        </p>
        <div className="article-content">
          <ReactMarkdown components={mdComponents}>{article.content}</ReactMarkdown>
        </div>

        <div className="mt-10 flex items-center justify-between border-t border-border pt-6 text-sm">
          <Link href="/news" className="font-display uppercase tracking-widest text-muted-foreground transition-colors hover:text-primary">
            &larr; Back to News
          </Link>
          <span className="text-xs text-muted-foreground">
            Category: {ARTICLE_CATEGORIES.find((c) => c.value === article.category)?.label || article.category}
          </span>
        </div>
      </div>

      {related.length > 0 && (
        <section className="border-t border-border bg-card/40 py-14">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <h2 className="font-display text-2xl font-bold uppercase">
              More <span className="text-primary">{categoryLabel(article.category)}</span>
            </h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((a) => (
                <ArticleCard key={a.id} article={a} />
              ))}
            </div>
          </div>
        </section>
      )}
    </article>
  );
}
