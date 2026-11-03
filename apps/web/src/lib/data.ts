// Build-time access to the exported content in apps/web/data.
// Only used by server components; nothing here reaches the browser bundle.
import fs from "node:fs";
import path from "node:path";

const DATA_DIR = path.join(process.cwd(), "data");

function readJson<T>(file: string): T {
  return JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), "utf8")) as T;
}

export type CountrySlug = "russland" | "mongolei" | "china" | "tibet" | "nepal" | "indien";

export const COUNTRIES: { slug: CountrySlug; name: string }[] = [
  { slug: "russland", name: "Russland" },
  { slug: "mongolei", name: "Mongolei" },
  { slug: "china", name: "China" },
  { slug: "tibet", name: "Tibet" },
  { slug: "nepal", name: "Nepal" },
  { slug: "indien", name: "Indien" },
];

export function countryName(slug: string): string {
  return COUNTRIES.find((c) => c.slug === slug)?.name ?? slug;
}

export interface Photo {
  id: number;
  /** URL slug: the file name without extension (unique; some titles are not). */
  slug: string;
  file: string;
  title: string;
  country: CountrySlug;
  date: string; // local time as recorded, "2008-08-21T05:06:16"
  day: string; // "2008-08-21"
  width: number;
  height: number;
  description: string | null;
  gps: { lat: number; lng: number; alt: number | null } | null;
}

interface RawPhoto extends Omit<Photo, "slug"> {}

export interface Keyword {
  id: number;
  name: string;
  slug: string;
  images: number[];
}

export interface DayInfo {
  day: string;
  title: string;
  description: string | null;
  country: CountrySlug | null;
  previewImage: number | null;
  images: number;
}

export interface CountryDay {
  day: string;
  /** "Tag 3": counted within the country, in travel order. */
  index: number;
  count: number;
  description: string | null;
}

let photosCache: Photo[] | null = null;

export function getPhotos(): Photo[] {
  if (!photosCache) {
    photosCache = readJson<RawPhoto[]>("images.json").map((p) => ({
      ...p,
      slug: path.parse(p.file).name,
      description: p.description ? p.description.replace(/\r/g, "").trim() || null : null,
    }));
  }
  return photosCache;
}

export function getPhoto(slug: string): Photo | undefined {
  return getPhotos().find((p) => p.slug === slug);
}

export function photosOf(country: string, day?: string): Photo[] {
  return getPhotos().filter((p) => p.country === country && (!day || p.day === day));
}

let keywordsCache: Keyword[] | null = null;
export function getKeywords(): Keyword[] {
  if (!keywordsCache) keywordsCache = readJson<Keyword[]>("keywords.json");
  return keywordsCache;
}

export function keywordsOf(photoId: number): Keyword[] {
  return getKeywords().filter((k) => k.images.includes(photoId));
}

let daysCache: DayInfo[] | null = null;
export function getDayInfos(): DayInfo[] {
  if (!daysCache) daysCache = readJson<DayInfo[]>("days.json");
  return daysCache;
}

/** The days a country has photos for, numbered "Tag 1…n" within that country. */
export function countryDays(country: string): CountryDay[] {
  const counts = new Map<string, number>();
  // Two HDR composites carry the date they were made (2009): not a travel day.
  for (const p of photosOf(country)) if (isTravelDay(p.day)) counts.set(p.day, (counts.get(p.day) ?? 0) + 1);
  const infos = new Map(getDayInfos().map((d) => [d.day, d]));
  return [...counts.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([day, count], i) => {
      const info = infos.get(day);
      // A gallery description belongs to the country the gallery was made for.
      const description = info && info.country === country ? cleanText(info.description) : null;
      return { day, index: i + 1, count, description };
    });
}

let palettesCache: Record<string, number[]> | null = null;
/** The photo's colour palette as hex strings. */
export function paletteOf(photoId: number): string[] {
  if (!palettesCache) palettesCache = readJson<{ images: Record<string, number[]> }>("colors.json").images;
  const flat = palettesCache[String(photoId)] ?? [];
  const out: string[] = [];
  for (let i = 0; i + 2 < flat.length; i += 3) {
    out.push("#" + [flat[i], flat[i + 1], flat[i + 2]].map((v) => v.toString(16).padStart(2, "0")).join(""));
  }
  return out;
}

export interface ExportInfo {
  images: number;
  imagesWithGps: number;
  routePoints: { stored: number; exported: number };
  days: number;
}
export function getExportInfo(): ExportInfo {
  return readJson<ExportInfo>("export-info.json");
}

interface RouteFeature {
  properties: { day: string; country: string };
  geometry: { coordinates: [number, number][] };
}
let routeCache: RouteFeature[] | null = null;
/** The GPS track of one day as [lat, lng] pairs (Leaflet order). */
export function routeOfDay(day: string): [number, number][] {
  if (!routeCache) routeCache = readJson<{ features: RouteFeature[] }>("route.geojson").features;
  const f = routeCache.find((x) => x.properties.day === day);
  return f ? f.geometry.coordinates.map(([lng, lat]) => [lat, lng]) : [];
}

/** The trip: 14 August to 30 September 2008. */
export function isTravelDay(day: string): boolean {
  return day >= "2008-08-14" && day <= "2008-09-30";
}

function cleanText(s: string | null): string | null {
  if (!s) return null;
  const t = s.replace(/\r/g, "").replace(/\s*\n\s*/g, " ").trim();
  return t || null;
}
