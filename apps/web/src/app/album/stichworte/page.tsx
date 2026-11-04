import type { Metadata } from "next";
import Link from "next/link";
import { AlbumFilters } from "@/components/AlbumView";
import { getKeywords } from "@/lib/data";
import { num } from "@/lib/format";

export const metadata: Metadata = {
  title: "Bilder nach Stichworten",
  description: "Alle Fotos der Reise nach Stichworten: Orte, Menschen, Essen, Züge, Klöster und mehr.",
};

export default function KeywordIndex() {
  const keywords = getKeywords()
    .filter((k) => k.images.length > 0)
    .sort((a, b) => a.name.localeCompare(b.name, "de"));
  const byLetter = new Map<string, typeof keywords>();
  for (const k of keywords) {
    const letter = k.name.charAt(0).toLocaleUpperCase("de").replace(/[ÄÖÜ]/, (c) => ({ Ä: "A", Ö: "O", Ü: "U" })[c]!);
    const key = /[A-Z]/.test(letter) ? letter : "#";
    byLetter.set(key, [...(byLetter.get(key) ?? []), k]);
  }

  return (
    <div className="wrap page">
      <AlbumFilters current="stichworte" />
      <div className="title-row">
        <h1>Bilder nach Stichworten</h1>
        <span className="muted">{keywords.length} Stichworte</span>
      </div>
      <div className="sheet keyword-index">
        {[...byLetter.entries()].map(([letter, ks]) => (
          <section key={letter} aria-label={`Stichworte mit ${letter}`}>
            <h2>{letter}</h2>
            <div className="pills">
              {ks.map((k) => (
                <Link key={k.id} href={`/album/stichworte/${k.slug}/`} className="pill">
                  {k.name} <span className="count">{num(k.images.length)}</span>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
