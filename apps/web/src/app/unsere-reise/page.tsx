import type { Metadata } from "next";
import Link from "next/link";
import { COUNTRIES, countryDays, getExportInfo } from "@/lib/data";
import { getDiary } from "@/lib/content";
import { dayMonth, num, shortDate } from "@/lib/format";
import { COUNTRY_COLOURS } from "@/lib/countryColours";
import RouteMap, { type DayLink } from "./RouteMap";

// The old URL of the route page, kept.
export const metadata: Metadata = {
  title: "Unsere Reise",
  description: "Die Reiseroute 2008: München, Moskau, Transsib nach Irkutsk und Olchon, Mongolei, Peking, Skytrain nach Lhasa, Tibet, Kathmandu, Delhi. Mit GPS-Track auf der Karte.",
};

export default function RoutePage() {
  const diary = new Map(getDiary().map((e) => [e.day, `/tagebuch/${e.slug}/`]));
  const countries = COUNTRIES.map((c) => ({
    ...c,
    days: countryDays(c.slug).map((d) => ({
      ...d,
      album: `/bilder/${c.slug}/${d.day}/`,
      diary: diary.get(d.day),
    })),
  }));
  const links: DayLink[] = countries.flatMap((c) =>
    c.days.map((d) => ({ day: d.day, label: `${c.name}, Tag ${d.index} · ${shortDate(d.day)}`, album: d.album, diary: d.diary })),
  );
  const info = getExportInfo();

  return (
    <div className="wrap page">
      <div className="title-row">
        <h1>Unsere Reise</h1>
        <span className="hand">von Moskau nach Delhi, und zurück</span>
      </div>

      {/* The route in short, word for word from the old page ("kurz und knapp"). */}
      <section className="sheet route-text" aria-label="Die Route in Kürze">
        <p>Start war in München - Flug nach Moskau - Zugfahrt nach Irkutsk (mit Zug Nummer 2 der Transsibirischen Eisenbahn).</p>
        <p>Ab zur Insel Olchon im Baikalsee. Nach drei Tagen zurück nach Irkutsk und von dort aus weiter nach Ulan Bator (mit Zug Nummer 6).</p>
        <p>Ulan Bator war Ausgangspunkt unserer 12-tägigen Mongoleitour (mit russischen Tatrabus und mongolischen Rallyfahrer: „<i>Danke Gambda, nervenstark und pflegeleicht</i>“).</p>
        <p>Nach dieser Offroad Erfahrung ab nach Peking. Chinesische Mauer, Himmelstempel etc. abgearbeitet. Der Skytrain brachte uns nach Lhasa.</p>
        <p>Von Lhasa gings weiter nach Nepal (mit japanischen Jeep und tibetischen Guide: „<i>Danke Jimmy, Jayesja</i>“). Auf dem Weg kurz bei allen Klostern vorbeigeschaut, die auf dem Weg lagen und die Besichtigung ausländischen Touristen erlaubt war (mit ausreichendem Permit, registriertem Guide, im richtigen zugeteilten Zeitfenster und ohne aus Versehen zu lachen, versteht sich: „<i>Danke China</i>“). Everest Base Camp wurde auch noch mitgenommen.</p>
        <p>In Nepal blieben wir in Kathmandu, um von dortaus nach Delhi zu fliegen. In Delhi kurzer Abstecher nach Agra (Taj Mahal). Dann nach Hause.</p>
      </section>

      <section aria-labelledby="mapTitle" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div className="title-row">
          <h2 id="mapTitle" style={{ fontSize: 22 }}>Die Route auf der Karte</h2>
          <span className="muted">GPS-Track, {num(info.routePoints.stored)} aufgezeichnete Punkte</span>
        </div>
        <RouteMap days={links} />
        <ul className="route-legend" aria-label="Farben der Länder">
          {COUNTRIES.map((c) => (
            <li key={c.slug}><span className="dot" style={{ background: COUNTRY_COLOURS[c.slug] }} aria-hidden="true" />{c.name}</li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="daysTitle" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <h2 id="daysTitle" style={{ fontSize: 22 }}>Tag für Tag</h2>
        {countries.map((c) => (
          <div key={c.slug} className="sheet" style={{ padding: 20 }}>
            <h3 className="route-country" style={{ borderColor: COUNTRY_COLOURS[c.slug] }}>{c.name}</h3>
            <ol className="route-days">
              {c.days.map((d) => (
                <li key={d.day}>
                  <span className="when">Tag {d.index} · {dayMonth(d.day)}</span>
                  <Link href={d.album}>{d.count} Fotos</Link>
                  {d.diary ? <Link href={d.diary}>Tagebuch</Link> : null}
                </li>
              ))}
            </ol>
          </div>
        ))}
      </section>
    </div>
  );
}
