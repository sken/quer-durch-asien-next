import type { Metadata } from "next";
import Link from "next/link";
import { getTags, tagLabel } from "@/lib/content";
import { longDate } from "@/lib/format";

// The old WordPress tag archives: /tag/<slug>/
export const dynamicParams = false;

export function generateStaticParams() {
  return [...getTags().keys()].map((tag) => ({ tag }));
}

export async function generateMetadata({ params }: { params: Promise<{ tag: string }> }): Promise<Metadata> {
  const { tag } = await params;
  return { title: `Stichwort „${tagLabel(tag)}“ (Reiseblog)` };
}

export default async function TagPage({ params }: { params: Promise<{ tag: string }> }) {
  const { tag } = await params;
  const posts = getTags().get(tag)!;
  return (
    <div className="wrap page">
      <nav className="breadcrumbs" aria-label="Brotkrumen">
        <Link href="/blog/">Reiseblog</Link>
        <span aria-hidden="true">›</span>
        <span>Stichwort</span>
      </nav>
      <div className="title-row">
        <h1>„{tagLabel(tag)}“</h1>
        <span className="muted">{posts.length} {posts.length === 1 ? "Beitrag" : "Beiträge"}</span>
      </div>
      <ol className="post-list">
        {posts.map((p) => (
          <li key={p.path} className="sheet">
            <p className="muted small">{longDate(p.date)}</p>
            <h2><Link href={p.path}>{p.title}</Link></h2>
            <p>{p.excerpt}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
