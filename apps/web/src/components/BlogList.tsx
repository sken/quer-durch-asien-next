import Link from "next/link";
import { blogPages, categoryLabel, getBlog, postsOnPage } from "@/lib/content";
import { longDate } from "@/lib/format";

export const pageHref = (n: number) => (n === 1 ? "/blog/" : `/blog/page/${n}/`);

/** One page of the blog: 5 posts, newest first, as on the old WordPress blog. */
export default function BlogList({ page }: { page: number }) {
  const posts = postsOnPage(page);
  const pages = blogPages();
  return (
    <div className="wrap page">
      <div className="title-row">
        <h1>Reiseblog</h1>
        <span className="hand">vor, während und nach der Reise</span>
      </div>
      <p className="muted" style={{ marginTop: -16 }}>
        {getBlog().length} Beiträge von 2008 bis 2009{page > 1 ? ` · Seite ${page} von ${pages}` : ""}
      </p>

      <ol className="post-list">
        {posts.map((p) => (
          <li key={p.path} className="sheet">
            <p className="muted small">
              {longDate(p.date)}
              {p.categories.length ? ` · ${p.categories.map(categoryLabel).join(", ")}` : ""}
            </p>
            <h2>
              <Link href={p.path}>{p.title}</Link>
            </h2>
            <p>{p.excerpt}</p>
            <Link href={p.path} className="more" aria-label={`Weiterlesen: ${p.title}`}>Weiterlesen ›</Link>
          </li>
        ))}
      </ol>

      <nav className="pager" aria-label="Seiten">
        {page > 1 ? <Link href={pageHref(page - 1)} rel="prev">‹ Neuere Beiträge</Link> : <span />}
        <span className="muted">Seite {page} von {pages}</span>
        {page < pages ? <Link href={pageHref(page + 1)} rel="next">Ältere Beiträge ›</Link> : <span />}
      </nav>
    </div>
  );
}
