import type { Metadata } from "next";
import Link from "next/link";
import { countryName } from "@/lib/data";
import { getDiary, type DiaryEntry } from "@/lib/content";
import { shortDate } from "@/lib/format";

export const metadata: Metadata = {
  title: "Tagebuch",
  description: "Das Reisetagebuch: 46 Tage von München über Moskau, die Mongolei, Peking und Tibet bis nach Delhi, Tag für Tag aufgeschrieben.",
};

/** Consecutive entries in the same country form one group, in travel order. */
function groups(entries: DiaryEntry[]) {
  const out: { country: string; entries: DiaryEntry[] }[] = [];
  for (const e of entries) {
    const label = e.country ? countryName(e.country) : "Unterwegs";
    const last = out[out.length - 1];
    if (last && last.country === label) last.entries.push(e);
    else out.push({ country: label, entries: [e] });
  }
  return out;
}

export default function DiaryIndex() {
  const entries = getDiary();
  return (
    <div className="wrap page">
      <div className="title-row">
        <h1>Tagebuch</h1>
        <span className="hand">fleißig geschrieben, jeden einzelnen Tag</span>
      </div>
      <p className="muted" style={{ marginTop: -16 }}>
        {entries.length} Einträge, vom {shortDate(entries[0].day)} bis zum {shortDate(entries[entries.length - 1].day)}.
      </p>

      {groups(entries).map((g, i) => (
        <section key={`${g.country}-${i}`} className="sheet" aria-labelledby={`g${i}`}>
          <h2 id={`g${i}`}>{g.country}</h2>
          <ol className="diary-list">
            {g.entries.map((e) => (
              <li key={e.slug}>
                <Link href={`/tagebuch/${e.slug}/`}>
                  <span className="when">Tag {e.tripDay} · {shortDate(e.day)}</span>
                  <strong>{e.title}</strong>
                  <span className="excerpt">{e.excerpt}</span>
                </Link>
              </li>
            ))}
          </ol>
        </section>
      ))}
    </div>
  );
}
