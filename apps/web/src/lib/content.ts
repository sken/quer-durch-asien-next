// Build-time access to the exported diary and blog (apps/web/content/*.md).
// The files hold YAML front matter written as JSON values, then HTML.
import fs from "node:fs";
import path from "node:path";
import { countryName, getDayInfos, getPhotos, isTravelDay, type CountrySlug } from "./data";
import { photoUrl } from "./format";

const CONTENT_DIR = path.join(process.cwd(), "content");

/** Old site; still hosts the photos and WordPress uploads. */
export const LEGACY_HOST = "https://quer-durch-asien.de";

interface Raw {
  fields: Record<string, unknown>;
  html: string;
}

function readMarkdown(file: string): Raw {
  const raw = fs.readFileSync(file, "utf8");
  const m = /^---\n([\s\S]*?)\n---\n?([\s\S]*)$/.exec(raw);
  if (!m) throw new Error(`no front matter: ${file}`);
  const fields: Record<string, unknown> = {};
  for (const line of m[1].split("\n")) {
    const i = line.indexOf(": ");
    if (i > 0) fields[line.slice(0, i)] = JSON.parse(line.slice(i + 2));
  }
  return { fields, html: m[2].trim() };
}

function readDir(sub: string): Raw[] {
  const dir = path.join(CONTENT_DIR, sub);
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .sort()
    .map((f) => readMarkdown(path.join(dir, f)));
}

/**
 * Make legacy HTML work on the new site: WordPress uploads come from the old
 * host, links to the old domain become site-relative, and images and links to
 * hosts that no longer exist (a university web space, a local test server)
 * are dropped instead of showing as broken.
 */
export function fixLegacyHtml(html: string): string {
  return html
    .replace(/(src|href)="\/(?:webseiten\/)?(wp-content\/uploads\/[^"]+)"/g, `$1="${LEGACY_HOST}/$2"`)
    .replace(/href="https?:\/\/(?:www\.)?quer-durch-asien\.de(\/[^"]*)?"/g, (_, p) => `href="${p ?? "/"}"`)
    .replace(/<a\b[^>]*href="http:\/\/localhost[^"]*"[^>]*>([\s\S]*?)<\/a>/g, "$1")
    .replace(/<img\b[^>]*src="http:\/\/(?:localhost|www-nw\.uni-regensburg\.de)[^"]*"[^>]*\/?>/g, "");
}

// ---------- diary ----------

export interface DiaryEntry {
  slug: string;
  title: string;
  date: string; // "2008-08-15T13:08:18"
  day: string; // "2008-08-15"
  /** 1 = 14 August 2008, the day of departure */
  tripDay: number;
  country: CountrySlug | null;
  html: string;
  /** plain-text start of the entry, for lists */
  excerpt: string;
}

const TRIP_START = Date.UTC(2008, 7, 14);

function tripDayOf(day: string): number {
  const [y, m, d] = day.split("-").map(Number);
  return Math.round((Date.UTC(y, m - 1, d) - TRIP_START) / 86400000) + 1;
}

/** Country of a day: the day gallery's country, else where most photos of that day were taken. */
function countryOfDay(day: string): CountrySlug | null {
  const info = getDayInfos().find((d) => d.day === day);
  if (info?.country) return info.country;
  const counts = new Map<CountrySlug, number>();
  for (const p of getPhotos()) if (p.day === day) counts.set(p.country, (counts.get(p.country) ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
}

/** Titles and excerpts are rendered as text, so HTML entities from WordPress are decoded. */
export function decodeEntities(s: string): string {
  return s
    .replace(/&nbsp;/g, " ")
    .replace(/&quot;/g, '"')
    .replace(/&#0*39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&amp;/g, "&");
}

export function plainText(html: string): string {
  return decodeEntities(
    html
      .replace(/<div class="qda-day-gallery"[^>]*><\/div>/g, " ")
      .replace(/<br\s*\/?>/g, " ")
      .replace(/<[^>]+>/g, ""),
  )
    .replace(/\s+/g, " ")
    .trim();
}

function excerptOf(html: string, words = 32): string {
  const w = plainText(html).split(" ");
  return w.length > words ? w.slice(0, words).join(" ") + " …" : w.join(" ");
}

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");

/**
 * The export turned old NextGEN gallery shortcodes into
 * <div class="qda-day-gallery" data-day="…">: fill them with that day's photos.
 */
function fillDayGalleries(html: string): string {
  return html.replace(/<div class="qda-day-gallery" data-day="(\d{4}-\d{2}-\d{2})"[^>]*><\/div>/g, (_, day: string) => {
    const photos = getPhotos().filter((p) => p.day === day);
    if (photos.length === 0) return "";
    const shown = photos.slice(0, 8);
    const country = countryOfDay(day) ?? photos[0].country;
    const items = shown
      .map((p) => `<a href="/bild/${esc(p.slug)}/"><img src="${esc(photoUrl(p.country, p.file))}" alt="${esc(p.description ?? `Foto ${p.title}`)}" loading="lazy" width="240" height="160"></a>`)
      .join("");
    const more = isTravelDay(day)
      ? `<p class="small"><a href="/bilder/${country}/${day}/">Alle ${photos.length} Fotos dieses Tages (${esc(countryName(country))})</a></p>`
      : "";
    return `<div class="day-gallery">${items}</div>${more}`;
  });
}

let diaryCache: DiaryEntry[] | null = null;

/** All diary entries, oldest first. */
export function getDiary(): DiaryEntry[] {
  if (!diaryCache) {
    diaryCache = readDir("tagebuch").map(({ fields, html }) => {
      const day = String(fields.day);
      const fixed = fillDayGalleries(fixLegacyHtml(html));
      return {
        slug: String(fields.slug),
        title: decodeEntities(String(fields.title)),
        date: String(fields.date),
        day,
        tripDay: tripDayOf(day),
        country: countryOfDay(day),
        html: fixed,
        excerpt: excerptOf(html),
      };
    });
  }
  return diaryCache;
}

export function getDiaryEntry(slug: string): DiaryEntry | undefined {
  return getDiary().find((e) => e.slug === slug);
}

// ---------- blog ----------

export interface BlogPost {
  slug: string;
  title: string;
  date: string; // "2008-07-23T11:03:12"
  /** "/2008/07/23/reiseblog-gestartet/": the old permalink, kept as the URL */
  path: string;
  /** [year, month, day, slug] for the route */
  parts: [string, string, string, string];
  categories: string[];
  tags: string[];
  html: string;
  excerpt: string;
}

/** The old blog shows 5 posts per page; keeping that keeps /blog/page/N stable. */
export const POSTS_PER_PAGE = 5;

let blogCache: BlogPost[] | null = null;

/** All blog posts, newest first (as on the old blog). */
export function getBlog(): BlogPost[] {
  if (!blogCache) {
    blogCache = readDir("blog")
      .map(({ fields, html }) => {
        const legacy = String(fields.legacyUrl).replace(/\/$/, "");
        const m = /^\/(\d{4})\/(\d{2})\/(\d{2})\/([^/]+)$/.exec(legacy);
        if (!m) throw new Error(`unexpected blog URL ${legacy}`);
        const parts: [string, string, string, string] = [m[1], m[2], m[3], m[4]];
        return {
          slug: String(fields.slug),
          title: decodeEntities(String(fields.title)),
          date: String(fields.date),
          path: `${legacy}/`,
          parts,
          categories: (fields.categories as string[] | undefined) ?? [],
          tags: (fields.tags as string[] | undefined) ?? [],
          html: fixLegacyHtml(html),
          excerpt: excerptOf(html, 55),
        };
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }
  return blogCache;
}

export function getPost(year: string, month: string, day: string, slug: string): BlogPost | undefined {
  return getBlog().find((p) => p.parts.join("/") === [year, month, day, slug].join("/"));
}

export function blogPages(): number {
  return Math.ceil(getBlog().length / POSTS_PER_PAGE);
}

export function postsOnPage(page: number): BlogPost[] {
  return getBlog().slice((page - 1) * POSTS_PER_PAGE, page * POSTS_PER_PAGE);
}

/** Tag slug -> posts (newest first). */
export function getTags(): Map<string, BlogPost[]> {
  const tags = new Map<string, BlogPost[]>();
  for (const p of getBlog()) for (const t of p.tags) tags.set(t, [...(tags.get(t) ?? []), p]);
  return tags;
}

/** The export kept tag slugs only: "jorg-aus-luneburg" -> "jorg aus luneburg". */
export const tagLabel = (slug: string) => decodeURIComponent(slug).replace(/-/g, " ");

const CATEGORY_LABELS: Record<string, string> = {
  zuhause: "Zuhause",
  reiseblog: "Reiseblog",
  russland: "Russland",
  mongolei: "Mongolei",
  china: "China",
  tibet: "Tibet",
  nepal: "Nepal",
  indien: "Indien",
};
export const categoryLabel = (slug: string) => CATEGORY_LABELS[slug] ?? tagLabel(slug);
