import type { Metadata } from "next";
import { AlbumFilters } from "@/components/AlbumView";
import ColourSearch from "./ColourSearch";

export const metadata: Metadata = { title: "Bilder nach Farben" };

export default function ColoursPage() {
  return (
    <div className="wrap page">
      <AlbumFilters current="farben" />
      <div className="title-row">
        <h1>Bilder nach Farben</h1>
        <span className="hand">eine Farbe wählen, die Reise in dieser Farbe sehen</span>
      </div>
      <ColourSearch />
      <noscript>
        <p>Die Farbsuche läuft im Browser und braucht JavaScript.</p>
      </noscript>
    </div>
  );
}
