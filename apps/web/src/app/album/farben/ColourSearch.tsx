"use client";

import ColorPicker from "@sken/color-picker/ColorPicker";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import PhotoCard from "@/components/PhotoCard";
import { hexToRgb, parseRgbParam, rgbToHex, searchByColour, type IndexRow } from "./colourSearch";

const PAGE = 24;
const COUNTRY: Record<string, string> = {
  russland: "Russland", mongolei: "Mongolei", china: "China", tibet: "Tibet", nepal: "Nepal", indien: "Indien",
};
const PRESETS: { name: string; rgb: [number, number, number] }[] = [
  { name: "Rot", rgb: [200, 40, 30] },
  { name: "Blau", rgb: [40, 90, 170] },
  { name: "Gelb", rgb: [230, 170, 40] },
  { name: "Grün", rgb: [60, 110, 50] },
];

function fmtDay(day: string) {
  const [y, m, d] = day.split("-");
  return `${d}.${m}.${y}`;
}

export default function ColourSearch() {
  const [index, setIndex] = useState<IndexRow[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [rgb, setRgb] = useState<[number, number, number]>(PRESETS[0].rgb);
  const [shown, setShown] = useState(PAGE);
  // The colour the picker starts from. Kept separate from `rgb` and only
  // replaced on purpose (preset, URL): the picker resets itself whenever this
  // object changes, so a new object per render would loop forever.
  const [seed, setSeed] = useState({ r: PRESETS[0].rgb[0], g: PRESETS[0].rgb[1], b: PRESETS[0].rgb[2] });
  // The picker reports a colour on mount and on every internal change; only
  // colours the user picks inside it (pointer or keyboard) change the search.
  const userPicking = useRef(false);
  const rgbRef = useRef(rgb);
  rgbRef.current = rgb;

  useEffect(() => {
    const fromUrl = parseRgbParam(window.location.search);
    if (fromUrl) {
      setRgb(fromUrl);
      setSeed({ r: fromUrl[0], g: fromUrl[1], b: fromUrl[2] });
    }
    fetch("/data/colour-index.json")
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then(setIndex)
      .catch(() => setFailed(true));
  }, []);

  const choose = useCallback((next: [number, number, number], fromPicker = false) => {
    setRgb(next);
    setShown(PAGE);
    if (!fromPicker) {
      userPicking.current = false;
      setSeed({ r: next[0], g: next[1], b: next[2] }); // move the picker to the new colour
    }
    const url = new URL(window.location.href);
    url.searchParams.set("rgb", next.join(","));
    window.history.replaceState(null, "", url);
  }, []);

  const onPicked = useCallback(
    (h: string) => {
      const v = hexToRgb(h);
      if (userPicking.current && v && v.join() !== rgbRef.current.join()) choose(v, true);
    },
    [choose],
  );

  const results = useMemo(() => (index ? searchByColour(index, ...rgb) : []), [index, rgb]);
  const hex = rgbToHex(...rgb);
  const name = PRESETS.find((p) => p.rgb.join() === rgb.join())?.name;

  return (
    <>
      <section className="stroke" aria-label="Farbe wählen">
        <div
          className="picker-box"
          onPointerDown={() => (userPicking.current = true)}
          onKeyDown={() => (userPicking.current = true)}
        >
          <ColorPicker initialRGB={seed} onColorSelect={onPicked} />
        </div>
        <div className="presets" role="group" aria-label="Schnellauswahl">
          {PRESETS.map((p) => (
            <button key={p.name} type="button" className="preset" aria-pressed={p.rgb.join() === rgb.join()} onClick={() => choose(p.rgb)}>
              <span className="dot" aria-hidden="true" style={{ background: rgbToHex(...p.rgb) }} />
              {p.name}
            </button>
          ))}
        </div>
      </section>

      <section aria-labelledby="resultTitle" aria-live="polite">
        <div className="result-head" style={{ marginBottom: 20 }}>
          <h2 id="resultTitle">
            {failed ? "Die Farbsuche konnte nicht geladen werden" : index ? `${results.length} ${results.length === 1 ? "Foto" : "Fotos"} in ${name ?? "dieser Farbe"}` : "Farbsuche wird geladen …"}
          </h2>
          <span className="muted" style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 15 }}>
            <span className="dot" aria-hidden="true" style={{ background: hex }} />
            {hex}, rgb({rgb.join(", ")})
          </span>
        </div>
        {index && results.length === 0 ? <p>Keine Fotos in dieser Farbe. Eine andere Farbe versuchen?</p> : null}
        <div className="photo-grid">
          {results.slice(0, shown).map((m) => (
            <PhotoCard key={m.slug} slug={m.slug} country={m.country} file={m.file}
              alt={`Foto aus ${COUNTRY[m.country] ?? m.country}, ${fmtDay(m.day)}`}
              left={`${COUNTRY[m.country] ?? m.country}, ${fmtDay(m.day)}`} />
          ))}
        </div>
        {results.length > shown ? (
          <div className="center" style={{ marginTop: 32 }}>
            <button type="button" className="btn-outline" onClick={() => setShown((s) => s + PAGE)}>
              Weitere {Math.min(PAGE, results.length - shown)} von {results.length - shown} Fotos zeigen
            </button>
          </div>
        ) : null}
      </section>
    </>
  );
}
