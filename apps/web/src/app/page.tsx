import Link from "next/link";
import { COUNTRIES, getExportInfo, getPhotos } from "@/lib/data";
import { num, shortDate } from "@/lib/format";
import { isSoon } from "@/lib/sections";
import RandomPhotos, { type Candidate } from "./RandomPhotos";

/** A start-page card; sections that are not built yet render without a link. */
function Card({ href, kind, children }: { href: string; kind: string; children: React.ReactNode }) {
  if (isSoon(href)) {
    return <div className={`card card-${kind} soon`} title="kommt bald"><span>{children} <small>(bald)</small></span></div>;
  }
  return <Link href={href} className={`card card-${kind}`}><span>{children}</span></Link>;
}

export default function StartPage() {
  const photos = getPhotos();
  const info = getExportInfo();
  const days = info.days; // the 46 day galleries; one photo is dated 2009 (edited later)

  // Random-photo candidates: up to 24 landscape photos per country.
  const groups: Candidate[][] = COUNTRIES.map((c) =>
    photos
      .filter((p) => p.country === c.slug && p.width > p.height)
      .filter((_, i, all) => i % Math.max(1, Math.floor(all.length / 24)) === 0)
      .slice(0, 24)
      .map((p) => ({ slug: p.slug, country: p.country, countryName: c.name, file: p.file, date: shortDate(p.date) })),
  );

  return (
    <div className="wrap page stack-lg">
      <section className="intro">
        <div>
          <p className="hand">oder auch Hallo.</p>
          <h1>Сайн уу?</h1>
          <p>Wer sich denkt, dass sind aber komische Buchstaben, sollte zunächst versuchen, sie auszusprechen, dann kommt einem das Geschriebene doch relativ einfach vor.</p>
          <p>Quer-durch-Asien.de ist eine Seite, die mit Inhalt glänzt, welcher üblicherweise nach einer Reise im Schuhkarton landet. Um das zu verhindern und natürlich auch mit unserer Reise protzen zu können, ist diese Seite entstanden.</p>
          <p>Schnell gesagt fand die Reise vom 15.8. bis 29.9.2008 statt. Von München nach Delhi in 6 Wochen auf russischen Gleisen, über mongolische „Straßen“, in chinesischer Überwachung, über tibetische Pässe, durch nepalesischen Regen und indischen Nepp.</p>
        </div>
        <figure>
          <img src="/site/start-photo.png" width={552} height={370} alt="Die vier Reisenden springen vor einer Bergkulisse in die Luft" />
        </figure>
      </section>

      <section className="stats" aria-label="Die Reise in Zahlen">
        <div className="stat"><strong>{COUNTRIES.length}</strong><span>Länder</span></div>
        <div className="stat"><strong>{days}</strong><span>Tage, 15.8.–29.9.2008</span></div>
        <div className="stat"><strong>{num(info.images)}</strong><span>Fotos</span></div>
        <div className="stat"><strong>{num(info.routePoints.stored)}</strong><span>GPS-Punkte</span></div>
      </section>

      <section aria-labelledby="explore">
        <h2 id="explore" style={{ marginBottom: 24 }}>Zum Sehen, Lesen und große Augen machen</h2>
        <div className="cards">
          <Link href="/bilder/russland/" className="card card-images"><span><strong>Bilder</strong>, Bilder und auch Fotos</span></Link>
          <Card href="/unsere-reise/" kind="route">Die <strong>Reiseroute</strong>: links, rechts, rauf und runter</Card>
          <Card href="/tagebuch/" kind="diary">Das <strong>Tagebuch</strong>: fleißig geschrieben, jeden einzelnen Tag</Card>
          <Card href="/blog/" kind="blog">Der <strong>Reiseblog</strong>: ja, in der Mongolei gibt es auch Internet</Card>
        </div>
      </section>

      <section className="sheet teaser" aria-labelledby="routeTitle">
        <div>
          <h2 id="routeTitle" style={{ marginBottom: 12 }}>Unsere Reise</h2>
          <p style={{ margin: "0 0 20px" }}>Moskau, Irkutsk, Baikalsee, Ulaanbaatar, die Gobi, Peking, Lhasa, Kathmandu, Delhi: der ganze Weg, aufgezeichnet von einem GPS-Logger, Tag für Tag zum Nachfahren.</p>
          {isSoon("/unsere-reise/") ? <span className="muted">Die interaktive Karte kommt bald.</span> : <Link href="/unsere-reise/" className="btn">Route ansehen</Link>}
        </div>
        <img src="/site/route-map.png" width={800} height={380} alt="Karte der GPS-Route von Moskau über die Mongolei und Peking bis Nepal" loading="lazy" />
      </section>

      <section aria-labelledby="randomTitle">
        <div className="title-row" style={{ justifyContent: "space-between", marginBottom: 20 }}>
          <h2 id="randomTitle">Zufallsbilder</h2>
          <span className="hand" style={{ fontSize: 24 }}>eins aus jedem Land</span>
        </div>
        <RandomPhotos groups={groups} />
      </section>
    </div>
  );
}
