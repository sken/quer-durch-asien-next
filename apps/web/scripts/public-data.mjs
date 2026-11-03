// Writes the small JSON files the browser needs (only for interactive parts)
// from apps/web/data into public/data. Runs before every build.
import fs from 'node:fs';
import path from 'node:path';

const here = path.dirname(new URL(import.meta.url).pathname);
const dataDir = path.join(here, '..', 'data');
const outDir = path.join(here, '..', 'public', 'data');
fs.mkdirSync(outDir, { recursive: true });

const images = JSON.parse(fs.readFileSync(path.join(dataDir, 'images.json'), 'utf8'));
const { images: palettes } = JSON.parse(fs.readFileSync(path.join(dataDir, 'colors.json'), 'utf8'));

// Colour search index: one row per photo [slug, country, day, file, flat r,g,b list].
const rows = images
  .filter((i) => palettes[i.id])
  .map((i) => [path.parse(i.file).name, i.country, i.day, i.file, palettes[i.id]]);
fs.writeFileSync(path.join(outDir, 'colour-index.json'), JSON.stringify(rows));
console.log(`public/data/colour-index.json: ${rows.length} photos`);
