const EXT = /\.(ttf|otf|woff2?|eot|svg)$/i;

/** Filename tokens we don't want in the preview label. */
const SKIP = new Set(
  [
    "regular",
    "variable",
    "variablefont",
    "oblique",
    "italic",
    "wght",
    "slnt",
    "wdth",
    "opsz",
    "ital",
    "grad",
    "bold",
    "light",
    "thin",
    "black",
    "medium",
    "semibold",
    "extrabold",
    "extralight",
    "condensed",
    "expanded",
    "narrow",
    "wide",
    "xtra",
    "xopq",
    "yopq",
    "ytlc",
    "ytuc",
    "ytas",
    "ytde",
    "ytfi",
    "ytos",
  ].map((s) => s.toLowerCase()),
);

function isNoise(part: string) {
  const key = part.toLowerCase();
  if (SKIP.has(key)) return true;
  if (/^v\d/i.test(part)) return true;
  if (/^\d+(\.\d+)?$/.test(part)) return true;
  return false;
}

/** Turn a font filename into a readable preview label (e.g. "Gluten"). */
export function cleanFontName(filename: string): string {
  const base = filename.replace(EXT, "").replace(/[\[(][^\])]*[\])]/g, "");

  const parts = base.split(/[-_+,\s]+/).filter(Boolean);
  const kept = parts.filter((p) => !isNoise(p));

  if (kept.length) return kept.join(" ");
  return base.replace(/[-_+,\s]+/g, " ").trim();
}
