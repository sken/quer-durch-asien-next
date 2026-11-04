"use client";

import { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import { COUNTRY_COLOURS } from "@/lib/countryColours";

export interface DayLink {
  day: string;
  label: string; // "Russland, Tag 3 · 17.08.2008"
  album?: string;
  diary?: string;
}


interface RouteFeature {
  properties: { day: string; country: string };
  geometry: { coordinates: [number, number][] };
}

/**
 * The whole trip on OpenStreetMap, one line per day, coloured by country.
 * Tiles and the track load only after the visitor asks for the map.
 */
export default function RouteMap({ days }: { days: DayLink[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!show) return;
    let map: import("leaflet").Map | undefined;
    let cancelled = false;
    const byDay = new Map(days.map((d) => [d.day, d]));
    Promise.all([import("leaflet"), fetch("/data/route.geojson").then((r) => (r.ok ? r.json() : Promise.reject(r.status)))])
      .then(([L, route]: [typeof import("leaflet"), { features: RouteFeature[] }]) => {
        if (cancelled || !ref.current) return;
        map = L.map(ref.current, { scrollWheelZoom: false });
        L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 18,
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        }).addTo(map);
        const bounds = L.latLngBounds([]);
        for (const f of route.features) {
          const pts = f.geometry.coordinates.map(([lng, lat]) => L.latLng(lat, lng));
          if (pts.length < 2) continue;
          const line = L.polyline(pts, { color: COUNTRY_COLOURS[f.properties.country] ?? "#2b2b2b", weight: 4, opacity: 0.9 }).addTo(map);
          bounds.extend(line.getBounds());
          const d = byDay.get(f.properties.day);
          if (d) {
            const links = [d.album ? `<a href="${d.album}">Fotos</a>` : "", d.diary ? `<a href="${d.diary}">Tagebuch</a>` : ""].filter(Boolean).join(" · ");
            line.bindPopup(`<strong>${d.label}</strong>${links ? `<br>${links}` : ""}`);
          }
        }
        if (bounds.isValid()) map.fitBounds(bounds, { padding: [20, 20] });
      })
      .catch(() => setFailed(true));
    return () => {
      cancelled = true;
      map?.remove();
    };
  }, [show, days]);

  if (!show) {
    return (
      <div className="route-map map-consent">
        <button type="button" className="btn" onClick={() => setShow(true)}>Karte anzeigen</button>
        <p className="small">Lädt Kartenkacheln von OpenStreetMap; dabei wird die IP-Adresse an die OpenStreetMap Foundation übertragen.</p>
      </div>
    );
  }
  if (failed) return <p className="route-map map-consent">Die Route konnte nicht geladen werden.</p>;
  return <div ref={ref} className="route-map" role="region" aria-label="Karte der Reiseroute, eine Linie pro Tag" />;
}
