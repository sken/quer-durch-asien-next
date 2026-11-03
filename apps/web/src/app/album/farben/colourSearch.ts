// The colour search of the old site (Image_model::get_images_by_color_rgb),
// now running in the browser on a static index instead of in MySQL:
//   1. keep palette colours within ±50 of the picked colour on R, G and B
//   2. keep photos with at least 2 such colours
//   3. sort by |(r+g+b) − (R+G+B)| of the closest matching colour

/** One photo: [slug, country, day, file, flat r,g,b palette]. */
export type IndexRow = [string, string, string, string, number[]];

export interface Match { slug: string; country: string; day: string; file: string; diff: number }

export const RANGE = 50;
export const MIN_MATCHES = 2;

export function searchByColour(index: IndexRow[], r: number, g: number, b: number): Match[] {
  const target = r + g + b;
  const out: Match[] = [];
  for (const [slug, country, day, file, pal] of index) {
    let hits = 0;
    let best = Infinity;
    for (let i = 0; i + 2 < pal.length; i += 3) {
      const pr = pal[i], pg = pal[i + 1], pb = pal[i + 2];
      if (Math.abs(pr - r) <= RANGE && Math.abs(pg - g) <= RANGE && Math.abs(pb - b) <= RANGE) {
        hits++;
        best = Math.min(best, Math.abs(pr + pg + pb - target));
      }
    }
    if (hits >= MIN_MATCHES) out.push({ slug, country, day, file, diff: best });
  }
  return out.sort((a, b2) => a.diff - b2.diff || a.slug.localeCompare(b2.slug));
}

export function hexToRgb(hex: string): [number, number, number] | null {
  const m = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex.trim());
  return m ? [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)] : null;
}

export function rgbToHex(r: number, g: number, b: number): string {
  return "#" + [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("");
}

/** "?rgb=200,40,30" -> [200, 40, 30]; anything invalid -> null */
export function parseRgbParam(search: string): [number, number, number] | null {
  const v = new URLSearchParams(search).get("rgb");
  if (!v) return null;
  const parts = v.split(",").map((x) => Number(x));
  return parts.length === 3 && parts.every((x) => Number.isInteger(x) && x >= 0 && x <= 255)
    ? (parts as [number, number, number])
    : null;
}
