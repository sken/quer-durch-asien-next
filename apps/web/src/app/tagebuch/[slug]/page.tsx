import type { Metadata } from "next";
import Link from "next/link";
import { countryDays, countryName, getPhotos, isTravelDay } from "@/lib/data";
import { getDiary, getDiaryEntry } from "@/lib/content";
import { longDate, photoUrl, shortDate } from "@/lib/format";

export const dynamicParams = false;

export function generateStaticParams() {
  return getDiary().map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const e = getDiaryEntry(slug)!;
  return { title: `${e.title} (Tagebuch, ${shortDate(e.day)})`, description: e.excerpt };
}

export default async function DiaryEntryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const all = getDiary();
  const idx = all.findIndex((e) => e.slug === slug);
  const e = all[idx];
  const prev = all[idx - 1];
  const next = all[idx + 1];
  const name = e.country ? countryName(e.country) : null;
  const albumDay = e.country && isTravelDay(e.day) ? countryDays(e.country).find((d) => d.day === e.day) : undefined;
  // The day's photos, unless the entry already shows them as a gallery.
  const photos = e.html.includes('class="day-gallery"') ? [] : getPhotos().filter((p) => p.day === e.day).slice(0, 6);

  return (
    <div className="wrap page" style={{ gap: 28 }}>
      <nav className="breadcrumbs" aria-label="Brotkrumen">
        <Link href="/tagebuch/">Tagebuch</Link>
        <span aria-hidden="true">›</span>
        <span>Tag {e.tripDay}</span>
      </nav>

      <article className="sheet diary-entry" aria-labelledby="entryTitle">
        <header>
          <p className="muted">
            {longDate(e.day)} · Tag {e.tripDay}{name ? ` · ${name}` : ""}
          </p>
          <h1 id="entryTitle">{e.title}</h1>
        </header>
        {/* Our own exported text (see lib/content.ts), not user input. */}
        <div className="entry-body" dangerouslySetInnerHTML={{ __html: e.html }} />
      </article>

      {photos.length > 0 ? (
        <section aria-labelledby="dayPhotos">
          <div className="title-row" style={{ marginBottom: 14 }}>
            <h2 id="dayPhotos" style={{ fontSize: 20 }}>Fotos von diesem Tag</h2>
            {albumDay && e.country ? (
              <Link href={`/bilder/${e.country}/${e.day}/`}>alle {albumDay.count} Fotos ansehen</Link>
            ) : null}
          </div>
          <div className="strip">
            {photos.map((p) => (
              <Link key={p.id} href={`/bild/${p.slug}/`}>
                <img src={photoUrl(p.country, p.file)} alt={p.description ?? `Foto ${p.title}`} loading="lazy" width={240} height={160} />
                <span>{p.description ?? p.title}</span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <nav className="entry-nav" aria-label="Weitere Einträge">
        {prev ? (
          <Link href={`/tagebuch/${prev.slug}/`} rel="prev">
            <span className="muted">‹ Tag {prev.tripDay}</span>
            {prev.title}
          </Link>
        ) : <span />}
        {next ? (
          <Link href={`/tagebuch/${next.slug}/`} rel="next" style={{ textAlign: "right" }}>
            <span className="muted">Tag {next.tripDay} ›</span>
            {next.title}
          </Link>
        ) : <span />}
      </nav>
    </div>
  );
}
