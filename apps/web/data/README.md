# Generated content: do not edit by hand

`data/` and `content/` are exported from the legacy site's database by
[`tools/export`](https://github.com/sken/quer-durch-asien/tree/main/tools/export)
in `sken/quer-durch-asien`. Re-running the export replaces these files, so
changes made here by hand would be lost.

| File | Content |
|---|---|
| `data/images.json` | 2,551 photos: file, title, country, date, size, description, GPS |
| `data/keywords.json` | 179 keywords with their legacy URL slug and photo ids |
| `data/colors.json` | colour palette per photo (r,g,b triplets) for the colour search |
| `data/route.geojson` | GPS track, one simplified line per day |
| `data/days.json` | the 46 day galleries |
| `data/export-info.json` | counts of the last export |
| `../content/tagebuch/*.md` | 46 diary entries |
| `../content/blog/*.md` | 68 blog posts, with `legacyUrl` for redirects |

No personal data: users, comments, options and authors are never exported,
and the export refuses to write anything containing an e-mail address.

`[nggallery]` shortcodes in old posts became
`<div class="qda-day-gallery" data-day="YYYY-MM-DD">`: the site is expected to
fill these with the photos of that day.

To regenerate (needs the legacy Docker stack with a database dump, see the
legacy repo's README):

```bash
cd quer-durch-asien/tools/export
npm ci
node export.mjs --out ../../../quer-durch-asien-next/apps/web
```
