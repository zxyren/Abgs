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

export interface FontMetadata {
  copyright?: string;
  version?: string;
  designer?: string;
  manufacturer?: string;
  trademark?: string;
  description?: string;
  vendorURL?: string;
  designerURL?: string;
  license?: string;
  licenseURL?: string;
  createdAt?: number;
  modifiedAt?: number;
}

const MAC_EPOCH_MS = Date.UTC(1904, 0, 1, 0, 0, 0, 0);

function getString(data: Uint8Array, isUtf16Be: boolean) {
  if (isUtf16Be) {
    let text = "";
    for (let i = 0; i + 1 < data.length; i += 2) {
      text += String.fromCharCode((data[i] << 8) | data[i + 1]);
    }
    return text.replace(/\u0000+$/, "");
  }

  return String.fromCharCode(...data).replace(/\u0000+$/, "");
}

function readUint64(view: DataView, offset: number) {
  const hi = view.getUint32(offset);
  const lo = view.getUint32(offset + 4);
  return hi * 2 ** 32 + lo;
}

export function parseFontMetadata(data: ArrayBuffer): FontMetadata {
  const view = new DataView(data);
  const signature = view.getUint32(0);
  if (signature !== 0x00010000 && signature !== 0x4f54544f) {
    return {};
  }

  const tableCount = view.getUint16(4);
  let nameOffset = -1;
  let headOffset = -1;

  for (let i = 0; i < tableCount; i += 1) {
    const recordOffset = 12 + i * 16;
    const tag = String.fromCharCode(
      view.getUint8(recordOffset),
      view.getUint8(recordOffset + 1),
      view.getUint8(recordOffset + 2),
      view.getUint8(recordOffset + 3),
    );
    const offset = view.getUint32(recordOffset + 8);

    if (tag === "name") {
      nameOffset = offset;
    }
    if (tag === "head") {
      headOffset = offset;
    }
  }

  const metadata: FontMetadata = {};

  if (nameOffset >= 0 && nameOffset + 6 <= data.byteLength) {
    const count = view.getUint16(nameOffset + 2);
    const stringOffset = view.getUint16(nameOffset + 4);
    const nameRecords: Array<{
      nameId: number;
      platformId: number;
      encodingId: number;
      bytes: Uint8Array;
    }> = [];

    for (let i = 0; i < count; i += 1) {
      const recordOffset = nameOffset + 6 + i * 12;
      if (recordOffset + 12 > data.byteLength) break;

      const platformId = view.getUint16(recordOffset);
      const encodingId = view.getUint16(recordOffset + 2);
      const nameId = view.getUint16(recordOffset + 6);
      const length = view.getUint16(recordOffset + 8);
      const offset = view.getUint16(recordOffset + 10);
      const stringStart = nameOffset + stringOffset + offset;

      if (stringStart + length > data.byteLength) continue;
      const bytes = new Uint8Array(data, stringStart, length);
      nameRecords.push({ nameId, platformId, encodingId, bytes });
    }

    const preferred = new Map<number, { score: number; text: string }>();
    const scoreFor = (platformId: number) =>
      platformId === 3 ? 3 : platformId === 0 ? 2 : platformId === 1 ? 1 : 0;

    for (const record of nameRecords) {
      const isUtf16 = record.platformId === 3 || record.platformId === 0;
      const text = getString(record.bytes, isUtf16);
      const score = scoreFor(record.platformId);
      const existing = preferred.get(record.nameId);
      if (!existing || score > existing.score) {
        preferred.set(record.nameId, { score, text });
      }
    }

    const values = Object.fromEntries(
      Array.from(preferred.entries(), ([nameId, entry]) => [
        nameId,
        entry.text,
      ]),
    ) as Record<number, string>;

    metadata.copyright = values[0];
    metadata.version = values[5];
    metadata.trademark = values[7];
    metadata.manufacturer = values[8];
    metadata.designer = values[9];
    metadata.description = values[10];
    metadata.vendorURL = values[11];
    metadata.designerURL = values[12];
    metadata.license = values[13];
    metadata.licenseURL = values[14];
  }

  if (headOffset >= 0 && headOffset + 24 <= data.byteLength) {
    const createdSeconds = readUint64(view, headOffset + 8);
    const modifiedSeconds = readUint64(view, headOffset + 16);
    if (createdSeconds)
      metadata.createdAt = MAC_EPOCH_MS + createdSeconds * 1000;
    if (modifiedSeconds)
      metadata.modifiedAt = MAC_EPOCH_MS + modifiedSeconds * 1000;
  }

  return metadata;
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
