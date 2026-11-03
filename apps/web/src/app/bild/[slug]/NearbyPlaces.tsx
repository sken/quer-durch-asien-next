"use client";

import { useEffect, useState } from "react";

interface Place { name: string; km: string; url?: string }

const GEONAMES = "https://secure.geonames.org";
const USER = "sken";

function km(d: string | number): string {
  return Number(d).toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " km";
}

/** Places and Wikipedia articles near the photo, from GeoNames (as on the old site). */
export default function NearbyPlaces({ lat, lng }: { lat: number; lng: number }) {
  const [places, setPlaces] = useState<Place[] | null>(null);
  const [wiki, setWiki] = useState<Place[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const q = `lat=${lat}&lng=${lng}&lang=de&username=${USER}`;
    let alive = true;
    Promise.all([
      fetch(`${GEONAMES}/findNearbyJSON?${q}&radius=50&maxRows=5`).then((r) => r.json()),
      fetch(`${GEONAMES}/findNearbyWikipediaJSON?${q}&radius=20&maxRows=5`).then((r) => r.json()),
    ])
      .then(([near, w]) => {
        if (!alive) return;
        setPlaces((near.geonames ?? []).map((g: { name: string; distance: string }) => ({ name: g.name, km: km(g.distance) })));
        setWiki(
          (w.geonames ?? []).map((g: { title: string; distance: string; wikipediaUrl: string }) => ({
            name: g.title,
            km: km(g.distance),
            url: "https://" + String(g.wikipediaUrl).replace(/^https?:\/\//, ""),
          })),
        );
      })
      .catch(() => alive && setFailed(true));
    return () => {
      alive = false;
    };
  }, [lat, lng]);

  if (failed) return <p className="small">Orte in der Nähe konnten gerade nicht geladen werden.</p>;
  if (!places || !wiki) return <p className="small" aria-live="polite">Orte in der Nähe werden geladen …</p>;
  if (places.length === 0 && wiki.length === 0) return null;

  return (
    <>
      <div className="places">
        {places.length > 0 ? (
          <div>
            <h3>Orte in der Nähe</h3>
            <ul>{places.map((p) => <li key={p.name}>{p.name} ({p.km})</li>)}</ul>
          </div>
        ) : null}
        {wiki.length > 0 ? (
          <div>
            <h3>Bei Wikipedia</h3>
            <ul>{wiki.map((p) => <li key={p.name}><a href={p.url}>{p.name}</a> ({p.km})</li>)}</ul>
          </div>
        ) : null}
      </div>
      <p className="small">Ortsangaben aus der <a href="https://www.geonames.org/">GeoNames</a>-Datenbank</p>
    </>
  );
}
