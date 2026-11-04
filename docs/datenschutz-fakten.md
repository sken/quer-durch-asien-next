# Facts for the Datenschutzerklärung (not legal text)

What the new static site (`apps/web`) processes and sends where, checked in
the code and in the browser. This is the factual basis for the privacy
statement; the legal text itself should come from a trusted generator or a
lawyer. Keep this file in sync when the site changes.

*Status: after "Karte anzeigen" and GeoNames-at-build-time (PR "Photo page
without third-party requests"). Checked 2026-11-03.*

## What a visitor's browser loads

| What | From | When | Personal data sent |
|---|---|---|---|
| Pages, scripts, styles, fonts, site graphics | the site's own host | every visit | IP address, user agent, requested URL (normal web server logs) |
| Photos | `quer-durch-asien.de` (legacy server, same owner) | every page with photos | IP address, user agent, referrer |
| Map tiles (photo pages) | `tile.openstreetmap.org` (OpenStreetMap Foundation, UK) | **only after clicking "Karte anzeigen"** | IP address, user agent, referrer |

Not loaded at all:

- No Google services (no Google Fonts: Source Serif 4 and Caveat are
  self-hosted via `next/font`; no Google Maps; no Google Analytics).
- No GeoNames requests: nearby places are fetched once at export time
  (`tools/export/geonames-places.mjs` in the legacy repo) and written into the
  pages.
- No Facebook, no social media buttons, no embeds, no comments, no contact
  form, no newsletter.
- No analytics, no tracking, no ads.

## Cookies and storage

- The site sets **no cookies** and uses no `localStorage`/`sessionStorage`.

## Hosting

| Site | Host | Location | Notes |
|---|---|---|---|
| `next.quer-durch-asien.de` (since 2026-11-04) and, after cutover, `quer-durch-asien.de` | ALL-INKL.COM (Neue Medien Münnich) | Germany | web server logs, retention per hosting settings (KAS); no US provider involved in serving the site |

The site was first served by Vercel Inc. (USA) until 2026-11-03; it is no
longer used for hosting. The build runs on GitHub Actions (GitHub Inc., USA),
which handles the source code only, not visitor data.

## Content with personal data

- Photos show the four travellers and, incidentally, other people. Consent
  of the travellers is a question for the owner; strangers are mostly
  incidental. Not a privacy-statement topic, but a publishing decision.
- Diary and blog texts name the travellers by first name.
- No reader data is stored: comments were not exported (`tools/export` never
  reads users, comments or e-mail addresses).

## What the statement probably needs to cover

1. Who is responsible (same as the Impressum).
2. Hosting and server logs (which data, purpose, retention, legal basis).
3. OpenStreetMap tiles, loaded only on request (recipient, transfer to the
   UK, link to the OSMF privacy policy).
4. That there are no cookies, no tracking and no third-party fonts.
5. Visitors' rights (access, deletion, objection, complaint to a supervisory
   authority).

## The old site (`quer-durch-asien.de`, PHP), for comparison

The old site currently loads, without asking:

- Google Maps JavaScript API on the route and photo pages (sends visitor data
  to Google),
- jQuery and jQuery UI from `ajax.googleapis.com`,
- GeoNames from the visitor's browser on photo pages,
- CodeIgniter session cookies (`ci_session`).

As far as visible it has an Impressum but no privacy statement. Until the
cutover, that is the bigger gap.
