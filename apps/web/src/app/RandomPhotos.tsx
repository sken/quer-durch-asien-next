"use client";

import { useEffect, useState } from "react";
import PhotoCard from "@/components/PhotoCard";

export interface Candidate {
  slug: string;
  country: string;
  countryName: string;
  file: string;
  date: string;
}

/**
 * One photo per country. The static HTML shows the first candidate of each
 * country; after loading, the browser picks a random one, so the page stays
 * static but still shows something new on every visit.
 */
export default function RandomPhotos({ groups }: { groups: Candidate[][] }) {
  const [picked, setPicked] = useState<Candidate[]>(() => groups.map((g) => g[0]));
  useEffect(() => {
    setPicked(groups.map((g) => g[Math.floor(Math.random() * g.length)]));
  }, [groups]);
  return (
    <div className="photo-grid">
      {picked.map((p) => (
        <PhotoCard key={p.country} slug={p.slug} country={p.country} file={p.file} alt={`Foto aus ${p.countryName}, ${p.date}`} left={`${p.countryName}, ${p.date}`} />
      ))}
    </div>
  );
}
