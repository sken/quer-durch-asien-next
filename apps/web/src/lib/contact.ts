// The site owner's contact details for Impressum and Datenschutz.
// They come from the IMPRESSUM build variable (a repository secret in the
// deploy workflow), not from this public repository. One line per row:
//   Name / street / postcode and town / "E-Mail: ..."
// Without it (local builds), a placeholder is shown; the deploy refuses to
// publish without it.
export const CONTACT_PLACEHOLDER = "[Kontaktangaben werden beim Veröffentlichen eingesetzt]";

export function contactLines(): string[] {
  const raw = process.env.IMPRESSUM?.trim();
  if (!raw) return [CONTACT_PLACEHOLDER];
  return raw.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
}
