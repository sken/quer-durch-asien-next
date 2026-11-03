import type { Metadata } from "next";
import Link from "next/link";
import { countryDays, countryName, getPhoto, getPhotos, isTravelDay, keywordsOf, paletteOf, placesOf, routeOfDay } from "@/lib/data";
import { longDate, num, photoUrl, time } from "@/lib/format";
import PhotoMap from "./PhotoMap";

export const dynamicParams = false;

export function generateStaticParams() {
  return getPhotos().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = getPhoto(slug)!;
  return { title: p.description ? `${p.description} (${p.title})` : `${p.title}, ${countryName(p.country)}` };
}

const Arrow = ({ d }: { d: string }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={d} />
  </svg>
);

export default async function PhotoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const all = getPhotos();
  const idx = all.findIndex((p) => p.slug === slug);
  const p = all[idx];
  const prev = all[idx - 1];
  const next = all[idx + 1];
  const name = countryName(p.country);
  const day = isTravelDay(p.day) ? countryDays(p.country).find((d) => d.day === p.day) : undefined;
  const keywords = keywordsOf(p.id);
  const palette = paletteOf(p.id);
  const strip = [all[idx - 2], all[idx - 1], all[idx + 1], all[idx + 2]].filter(Boolean);
  const portrait = p.height > p.width;
  const title = p.description ?? p.title;
  const places = placesOf(p.id);

  return (
    <div className="wrap page" style={{ gap: 28 }}>
      <nav className="breadcrumbs" aria-label="Brotkrumen">
        <Link href={`/bilder/${p.country}/`}>{name}</Link>
        {day ? (<><span aria-hidden="true">›</span><Link href={`/bilder/${p.country}/${p.day}/`}>Tag {day.index}</Link></>) : null}
        <span aria-hidden="true">›</span>
        <span>{p.title}</span>
      </nav>

      <figure className="photo-frame">
        <div className="stage">
          <img src={photoUrl(p.country, p.file)} width={p.width} height={p.height} className={portrait ? "portrait" : undefined}
            alt={p.description ? `${p.description}, ${name}, ${longDate(p.date)}` : `Foto ${p.title}, ${name}, ${longDate(p.date)}`} />
          {prev ? <Link href={`/bild/${prev.slug}/`} className="arrow prev" aria-label="Vorheriges Foto"><Arrow d="M15 18l-6-6 6-6" /></Link> : null}
          {next ? <Link href={`/bild/${next.slug}/`} className="arrow next" aria-label="Nächstes Foto"><Arrow d="M9 18l6-6-6-6" /></Link> : null}
        </div>
        <figcaption>
          <span className="hand">{title}</span>
          <span className="muted">{longDate(p.date)}, {time(p.date)} Uhr · {name}{day ? `, Tag ${day.index}` : ""}</span>
        </figcaption>
      </figure>

      {strip.length > 0 ? (
        <section className="strip" aria-label="Davor und danach">
          {strip.map((s) => (
            <Link key={s.id} href={`/bild/${s.slug}/`}>
              <img src={photoUrl(s.country, s.file)} alt={`Foto ${s.title}, ${countryName(s.country)}`} loading="lazy" width={240} height={160} />
              <span>{all.indexOf(s) < idx ? "‹ davor" : "danach ›"} {s.title}</span>
            </Link>
          ))}
        </section>
      ) : null}

      <div className="photo-info">
        <section className="sheet" aria-labelledby="aboutTitle">
          <h2 id="aboutTitle">Zum Bild</h2>
          {keywords.length > 0 ? (
            <div>
              <h3>Stichworte</h3>
              <div className="pills">
                {keywords.map((k) => <span key={k.id} className="pill">{k.name}</span>)}
              </div>
            </div>
          ) : null}
          {palette.length > 0 ? (
            <div>
              <h3>Farben in diesem Bild</h3>
              <div className="swatches">
                {palette.map((hex) => {
                  const rgb = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)).join(",");
                  return <Link key={hex} href={`/album/farben/?rgb=${rgb}`} className="swatch" style={{ background: hex }} title={hex} aria-label={`Fotos in der Farbe ${hex}`} />;
                })}
              </div>
              <p className="small" style={{ marginTop: 10 }}>Eine Farbe antippen: Fotos in ähnlichen Farben</p>
            </div>
          ) : null}
        </section>

        {p.gps ? (
          <section className="sheet" aria-labelledby="whereTitle">
            <h2 id="whereTitle">Wo war das?</h2>
            <PhotoMap lat={p.gps.lat} lng={p.gps.lng} track={routeOfDay(p.day)} />
            <dl className="coords">
              <div><dt>Breitengrad</dt><dd>{num(Math.abs(p.gps.lat), 4)}° {p.gps.lat >= 0 ? "N" : "S"}</dd></div>
              <div><dt>Längengrad</dt><dd>{num(Math.abs(p.gps.lng), 4)}° {p.gps.lng >= 0 ? "O" : "W"}</dd></div>
              {p.gps.alt !== null ? <div><dt>Höhe</dt><dd>{num(p.gps.alt)} m</dd></div> : null}
            </dl>
            {places ? (
              <>
                <div className="places">
                  {places.near.length > 0 ? (
                    <div>
                      <h3>Orte in der Nähe</h3>
                      <ul>{places.near.map(([n, d]) => <li key={n}>{n} ({num(d, 2)} km)</li>)}</ul>
                    </div>
                  ) : null}
                  {places.wiki.length > 0 ? (
                    <div>
                      <h3>Bei Wikipedia</h3>
                      <ul>{places.wiki.map(([t, d, url]) => <li key={t}><a href={`https://${url}`}>{t}</a> ({num(d, 2)} km)</li>)}</ul>
                    </div>
                  ) : null}
                </div>
                <p className="small">Ortsangaben aus der <a href="https://www.geonames.org/">GeoNames</a>-Datenbank (CC BY 4.0)</p>
              </>
            ) : null}
          </section>
        ) : null}
      </div>
    </div>
  );
}
