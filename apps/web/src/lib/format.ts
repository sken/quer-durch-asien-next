// Formatting helpers. Dates are the local times recorded on the trip; they are
// formatted as written, never shifted by the visitor's or the server's time zone.

export const PHOTO_BASE = "https://quer-durch-asien.de/assets/images/final";

/** URL of a photo file on the legacy host (the photo pipeline comes later). */
export function photoUrl(country: string, file: string, size: "files" | "thumb_210" = "files"): string {
  return `${PHOTO_BASE}/${country}/${size}/${file}`;
}

function parts(iso: string) {
  const [d, t = "00:00:00"] = iso.split("T");
  const [y, m, day] = d.split("-").map(Number);
  const [hh, mm] = t.split(":");
  return { y, m, day, hh, mm };
}

const WEEKDAYS = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];
const MONTHS = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];

/** "15.08.2008" */
export function shortDate(iso: string): string {
  const { y, m, day } = parts(iso);
  return `${String(day).padStart(2, "0")}.${String(m).padStart(2, "0")}.${y}`;
}

/** "15.08." */
export function dayMonth(iso: string): string {
  const { m, day } = parts(iso);
  return `${String(day).padStart(2, "0")}.${String(m).padStart(2, "0")}.`;
}

/** "Freitag, 15. August 2008" (calendar date, no time zone involved) */
export function longDate(iso: string): string {
  const { y, m, day } = parts(iso);
  const weekday = WEEKDAYS[new Date(Date.UTC(y, m - 1, day)).getUTCDay()];
  return `${weekday}, ${day}. ${MONTHS[m - 1]} ${y}`;
}

/** "05:06" */
export function time(iso: string): string {
  const { hh, mm } = parts(iso);
  return `${hh}:${mm}`;
}

/** German number formatting: 2551 -> "2.551", 53.1457 -> "53,1457" */
export function num(n: number, digits = 0): string {
  return n.toLocaleString("de-DE", { minimumFractionDigits: digits, maximumFractionDigits: digits });
}
