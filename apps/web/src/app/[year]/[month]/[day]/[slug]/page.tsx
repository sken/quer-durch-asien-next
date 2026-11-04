import type { Metadata } from "next";
import Link from "next/link";
import { categoryLabel, getBlog, getPost, tagLabel } from "@/lib/content";
import { longDate } from "@/lib/format";

// Blog posts keep their old WordPress permalinks: /2008/07/23/reiseblog-gestartet/
export const dynamicParams = false;

export function generateStaticParams() {
  return getBlog().map((p) => ({ year: p.parts[0], month: p.parts[1], day: p.parts[2], slug: p.parts[3] }));
}

type Params = Promise<{ year: string; month: string; day: string; slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { year, month, day, slug } = await params;
  const p = getPost(year, month, day, slug)!;
  return { title: `${p.title} (Reiseblog)`, description: p.excerpt };
}

export default async function BlogPostPage({ params }: { params: Params }) {
  const { year, month, day, slug } = await params;
  const all = getBlog(); // newest first
  const idx = all.findIndex((p) => p.parts.join("/") === [year, month, day, slug].join("/"));
  const p = all[idx];
  const newer = all[idx - 1];
  const older = all[idx + 1];

  return (
    <div className="wrap page" style={{ gap: 28 }}>
      <nav className="breadcrumbs" aria-label="Brotkrumen">
        <Link href="/blog/">Reiseblog</Link>
        <span aria-hidden="true">›</span>
        <span>{p.title}</span>
      </nav>

      <article className="sheet diary-entry" aria-labelledby="postTitle">
        <header>
          <p className="muted">
            {longDate(p.date)}
            {p.categories.length ? ` · ${p.categories.map(categoryLabel).join(", ")}` : ""}
          </p>
          <h1 id="postTitle">{p.title}</h1>
        </header>
        {/* Our own exported text (see lib/content.ts), not user input. */}
        <div className="entry-body" dangerouslySetInnerHTML={{ __html: p.html }} />
        {p.tags.length ? (
          <div className="pills" style={{ marginTop: 24 }}>
            <span className="muted small">Stichworte</span>
            {p.tags.map((t) => (
              <Link key={t} href={`/tag/${t}/`} className="pill">{tagLabel(t)}</Link>
            ))}
          </div>
        ) : null}
      </article>

      <nav className="entry-nav" aria-label="Weitere Beiträge">
        {older ? (
          <Link href={older.path} rel="prev">
            <span className="muted">‹ älter</span>
            {older.title}
          </Link>
        ) : <span />}
        {newer ? (
          <Link href={newer.path} rel="next" style={{ textAlign: "right" }}>
            <span className="muted">neuer ›</span>
            {newer.title}
          </Link>
        ) : <span />}
      </nav>
    </div>
  );
}
