import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ChevronRight, Eye } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { db } from "@/lib/db";
import { CopyCodeButton } from "@/components/copy-code-button";

export const dynamic = "force-dynamic";

async function getCode(slug: string) {
  try {
    return await db.cheatCode.findUnique({ where: { slug } });
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
  const code = await getCode(slug);
  if (!code) return { title: "Cheat Code Not Found" };
  const title = `${code.code} — ${code.effect} | ${code.gameTitle} (${code.platform})`;
  const description = `Cheat code for ${code.gameTitle} on ${code.platform}: ${code.effect}. Code: ${code.code}. Full details and how to use it on Bynamdy.`;
  return {
    title,
    description,
    alternates: { canonical: `/codes/${code.slug}` },
    openGraph: { title, description, type: "article" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function CodeDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const code = await getCode(slug);
  if (!code) notFound();

  db.cheatCode
    .update({ where: { id: code.id }, data: { views: { increment: 1 } } })
    .catch(() => {});

  const sameGame = await db.cheatCode.findMany({
    where: { gameTitle: code.gameTitle, id: { not: code.id } },
    orderBy: { effect: "asc" },
    take: 8,
  });

  return (
    <div className="fade-up mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:py-16">
      <nav className="flex items-center gap-1.5 text-xs text-muted-foreground" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-primary">Home</Link>
        <ChevronRight className="h-3 w-3" aria-hidden />
        <Link href="/codes" className="hover:text-primary">Cheat Codes</Link>
        <ChevronRight className="h-3 w-3" aria-hidden />
        <span className="truncate text-foreground/70">{code.gameTitle}</span>
      </nav>

      <div className="mt-8 border border-border bg-card clip-corner">
        <div className="border-b border-border bg-gradient-to-r from-primary/15 to-transparent p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-3">
            <span className="bg-primary px-3 py-1 font-display text-[11px] font-semibold uppercase tracking-widest text-primary-foreground clip-corner-sm">
              {code.platform}
            </span>
            <h1 className="font-display text-2xl font-bold uppercase tracking-wide sm:text-3xl">
              {code.gameTitle}
            </h1>
          </div>
          <p className="mt-3 text-base text-muted-foreground">{code.effect}</p>
        </div>

        <div className="p-6 sm:p-8">
          <h2 className="kicker">The Code</h2>
          <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center">
            <code className="flex-1 border border-primary/40 bg-secondary px-5 py-4 font-mono text-lg tracking-wider text-primary shadow-[0_0_20px_rgba(230,20,45,0.15)] clip-corner-sm">
              {code.code}
            </code>
            <CopyCodeButton code={code.code} className="px-5 py-3 text-sm" />
          </div>

          {code.details && (
            <>
              <h2 className="kicker mt-10">How to use it</h2>
              <div className="mt-4 text-sm leading-relaxed text-foreground/85 [&_h2]:mb-2 [&_h2]:mt-6 [&_h2]:font-display [&_h2]:text-lg [&_h2]:font-bold [&_li]:ml-5 [&_li]:list-disc [&_ol]:list-decimal [&_p]:mb-3 [&_strong]:text-foreground [&_ul]:mb-4 [&_ul]:mt-2">
                <ReactMarkdown>{code.details}</ReactMarkdown>
              </div>
            </>
          )}

          <div className="mt-10 flex items-center justify-between border-t border-border pt-5 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Eye className="h-3.5 w-3.5 text-primary" aria-hidden />
              {(code.views + 1).toLocaleString()} views
            </span>
            <Link href="/codes" className="inline-flex items-center gap-1 font-display uppercase tracking-widest transition-colors hover:text-primary">
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden /> All cheat codes
            </Link>
          </div>
        </div>
      </div>

      {sameGame.length > 0 && (
        <section className="mt-12">
          <h2 className="font-display text-xl font-bold uppercase">
            More <span className="text-primary">{code.gameTitle}</span> Codes
          </h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {sameGame.map((c) => (
              <Link
                key={c.id}
                href={`/codes/${c.slug}`}
                className="glow-hover group flex items-center justify-between gap-3 border border-border bg-card px-4 py-3 clip-corner-sm"
              >
                <span className="min-w-0">
                  <span className="block truncate text-sm text-foreground group-hover:text-primary">{c.effect}</span>
                  <code className="block truncate font-mono text-xs text-muted-foreground">{c.code}</code>
                </span>
                <ChevronRight className="h-4 w-4 shrink-0 text-primary" aria-hidden />
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
