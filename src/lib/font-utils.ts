const SUPPORTED = ["ttf", "otf", "woff", "woff2", "eot", "ttc", "fon"];

export function isFontFile(name: string) {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  return SUPPORTED.includes(ext);
}

export function fontFormat(name: string) {
  return (name.split(".").pop() ?? "").toLowerCase();
}

export function sanitizeFamily(name: string) {
  return name.replace(/\.[^.]+$/, "").replace(/[^a-zA-Z0-9_-]+/g, "_");
}

export function humanSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

const loaded = new Map<string, FontFace>();

export async function loadFont(family: string, data: ArrayBuffer) {
  if (loaded.has(family)) return;
  try {
    const face = new FontFace(family, data);
    await face.load();
    const doc = document as Document & { fonts: FontFaceSet };
    doc.fonts.add(face);
    loaded.set(family, face);
  } catch (e) {
    console.warn("Failed to load font", family, e);
  }
}

export function unloadFont(family: string) {
  const face = loaded.get(family);
  if (face) {
    const doc = document as Document & { fonts: FontFaceSet };
    doc.fonts.delete(face);
    loaded.delete(family);
  }
}
