import Link from "next/link";
import PhotoCard from "@/components/PhotoCard";
import { COUNTRIES, countryDays, countryName, photosOf } from "@/lib/data";
import { dayMonth, longDate, num, time } from "@/lib/format";

const FIRST_BATCH = 24;

export function AlbumFilters({ current }: { current: "land" | "farben" }) {
  return (
    <div className="pills">
      <span className="muted" style={{ fontSize: 15 }}>Bilder nach</span>
      <Link href="/bilder/russland/" className="pill" aria-current={current === "land" ? "page" : undefined}>Land &amp; Tag</Link>
      <Link href="/album/farben/" className="pill" aria-current={current === "farben" ? "page" : undefined}>Farben</Link>
    </div>
  );
}

export default function AlbumView({ country, day }: { country: string; day: string }) {
  const days = countryDays(country);
  const current = days.find((d) => d.day === day) ?? days[0];
  const photos = photosOf(country, current.day);
  const name = countryName(country);
  const first = photos.slice(0, FIRST_BATCH);
  const rest = photos.slice(FIRST_BATCH);

  const card = (p: (typeof photos)[number], i: number) => (
    <PhotoCard
      key={p.id}
      slug={p.slug}
      country={p.country}
      file={p.file}
      alt={p.description ? `${p.description} (${name}, ${time(p.date)} Uhr)` : `${name}, ${dayMonth(p.date)}, ${time(p.date)} Uhr`}
      left={p.description ?? p.title}
      right={`${time(p.date)} Uhr`}
      eager={i < 4}
    />
  );

  return (
    <div className="wrap page">
      <AlbumFilters current="land" />

      <nav className="country-tabs" aria-label="Länder">
        {COUNTRIES.map((c) => (
          <Link key={c.slug} href={`/bilder/${c.slug}/`} className="country-tab" aria-current={c.slug === country ? "page" : undefined}>
            <img src={`/site/flag-${c.slug}.png`} alt="" width={24} height={16} />
            <span className="name">{c.name}</span>
            <span className="count">{num(photosOf(c.slug).length)}</span>
          </Link>
        ))}
      </nav>

      <section className="sheet" aria-labelledby="daysTitle" style={{ padding: 20 }}>
        <h2 id="daysTitle" style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>{name}, Tag für Tag</h2>
        <div className="day-strip">
          {days.map((d) => (
            <Link key={d.day} href={`/bilder/${country}/${d.day}/`} className="day-chip" aria-current={d.day === current.day ? "page" : undefined}>
              <strong>Tag {d.index}</strong>
              <span>{dayMonth(d.day)} · {d.count} Fotos</span>
            </Link>
          ))}
        </div>
      </section>

      <section aria-labelledby="dayTitle">
        <div className="title-row" style={{ marginBottom: 20 }}>
          <h1 id="dayTitle">{name}, Tag {current.index}</h1>
          <span className="muted">{longDate(current.day)} · {current.count} Fotos</span>
          {current.description ? <span className="hand">{current.description}</span> : null}
        </div>
        <div className="photo-grid">{first.map(card)}</div>
        {rest.length > 0 ? (
          // <details> works without JavaScript and keeps the first page light.
          <details style={{ marginTop: 32 }}>
            <summary className="btn-outline" style={{ listStyle: "none", margin: "0 auto 24px", width: "fit-content" }}>
              Weitere {rest.length} Fotos von Tag {current.index} zeigen
            </summary>
            <div className="photo-grid">{rest.map((p, i) => card(p, i + FIRST_BATCH))}</div>
          </details>
        ) : null}
      </section>
    </div>
  );
}
