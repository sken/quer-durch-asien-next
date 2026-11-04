import Link from "next/link";
import PhotoCard from "@/components/PhotoCard";
import { AlbumFilters } from "@/components/AlbumView";
import { countryName, KEYWORD_PAGE_SIZE, keywordPages, photosOfKeyword, type Keyword } from "@/lib/data";
import { dayMonth, num } from "@/lib/format";

export const keywordHref = (slug: string, page = 1) =>
  page === 1 ? `/album/stichworte/${slug}/` : `/album/stichworte/${slug}/seite/${page}/`;

/** One page of a keyword's photos: 28 per page, as on the old site. */
export default function KeywordView({ keyword, page }: { keyword: Keyword; page: number }) {
  const photos = photosOfKeyword(keyword);
  const pages = keywordPages(keyword);
  const shown = photos.slice((page - 1) * KEYWORD_PAGE_SIZE, page * KEYWORD_PAGE_SIZE);

  return (
    <div className="wrap page">
      <AlbumFilters current="stichworte" />
      <nav className="breadcrumbs" aria-label="Brotkrumen">
        <Link href="/album/stichworte/">Stichworte</Link>
        <span aria-hidden="true">›</span>
        <span>{keyword.name}</span>
      </nav>
      <div className="title-row">
        <h1>{keyword.name}</h1>
        <span className="muted">
          {num(photos.length)} {photos.length === 1 ? "Foto" : "Fotos"}
          {pages > 1 ? ` · Seite ${page} von ${pages}` : ""}
        </span>
      </div>

      {photos.length === 0 ? (
        <p>Zu diesem Stichwort gibt es keine Fotos. <Link href="/album/stichworte/">Alle Stichworte</Link></p>
      ) : (
        <div className="photo-grid">
          {shown.map((p, i) => (
            <PhotoCard
              key={p.id}
              slug={p.slug}
              country={p.country}
              file={p.file}
              alt={p.description ? `${p.description} (${countryName(p.country)}, ${dayMonth(p.date)})` : `${countryName(p.country)}, ${dayMonth(p.date)}`}
              left={p.description ?? p.title}
              right={`${countryName(p.country)}, ${dayMonth(p.date)}`}
              eager={i < 4}
            />
          ))}
        </div>
      )}

      {pages > 1 ? (
        <nav className="pager" aria-label="Seiten">
          {page > 1 ? <Link href={keywordHref(keyword.slug, page - 1)} rel="prev">‹ Zurück</Link> : <span />}
          <span className="page-numbers">
            {Array.from({ length: pages }, (_, i) => i + 1).map((n) =>
              n === page ? (
                <span key={n} aria-current="page">{n}</span>
              ) : (
                <Link key={n} href={keywordHref(keyword.slug, n)} aria-label={`Seite ${n}`}>{n}</Link>
              ),
            )}
          </span>
          {page < pages ? <Link href={keywordHref(keyword.slug, page + 1)} rel="next">Weiter ›</Link> : <span />}
        </nav>
      ) : null}
    </div>
  );
}
