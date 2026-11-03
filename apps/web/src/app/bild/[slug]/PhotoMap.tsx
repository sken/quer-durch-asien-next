"use client";

import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";

/** Small Leaflet + OpenStreetMap map: the day's GPS track and where the photo was taken. */
export default function PhotoMap({ lat, lng, track }: { lat: number; lng: number; track: [number, number][] }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let map: import("leaflet").Map | undefined;
    let cancelled = false;
    import("leaflet").then((L) => {
      if (cancelled || !ref.current) return;
      map = L.map(ref.current, { scrollWheelZoom: false }).setView([lat, lng], 10);
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 18,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);
      if (track.length > 1) {
        const line = L.polyline(track, { color: "#a8332a", weight: 3, opacity: 0.85 }).addTo(map);
        map.fitBounds(line.getBounds().extend([lat, lng]), { padding: [24, 24], maxZoom: 12 });
      }
      L.circleMarker([lat, lng], { radius: 9, color: "#2b2b2b", weight: 3, fillColor: "#ffffff", fillOpacity: 1 })
        .addTo(map)
        .bindTooltip("Hier entstand das Foto");
    });
    return () => {
      cancelled = true;
      map?.remove();
    };
  }, [lat, lng, track]);

  return <div ref={ref} className="mini-map" role="img" aria-label="Karte mit dem Aufnahmeort und der Route des Tages" />;
}
