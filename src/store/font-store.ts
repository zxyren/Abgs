import { create } from "zustand";
import {
  get as idbGet,
  set as idbSet,
  del as idbDel,
  keys as idbKeys,
} from "idb-keyval";
import {
  isFontFile,
  sanitizeFamily,
  fontFormat,
  loadFont,
  parseFontMetadata,
  unloadFont,
  type FontMetadata,
} from "@/lib/font-utils";

export interface FontItem {
  id: string;
  family: string;
  originalName: string;
  format: string;
  size: number;
  addedAt: number;
  tags: string[];
  metadata?: FontMetadata;
}

export type ViewMode = "grid" | "list" | "compact";
export type SortKey = "name" | "recent" | "size";

interface State {
  fonts: FontItem[];
  hydrated: boolean;
  previewText: string;
  fontSize: number;
  lineHeight: number;
  letterSpacing: number;
  weight: number;
  align: "left" | "center" | "right";
  theme: "light" | "dark";
  view: ViewMode;
  search: string;
  sort: SortKey;
  filterFormat: string | null;
  selected: string[]; // for comparison
  paletteOpen: boolean;

  hydrate: () => Promise<void>;
  addFiles: (files: File[]) => Promise<void>;
  remove: (id: string) => Promise<void>;
  rename: (id: string, family: string) => void;
  downloadFont: (id: string) => Promise<void>;
  toggleSelected: (id: string) => void;
  clearSelected: () => void;
  resetPreview: () => void;
  set: (patch: Partial<State>) => void;
}

const META_KEY = "abgs:fonts";
const DATA_PREFIX = "abgs:data:";

export const useFontStore = create<State>((set, get) => ({
  fonts: [],
  hydrated: false,
  previewText: "The quick brown fox jumps over the lazy dog",
  fontSize: 32,
  lineHeight: 1.3,
  letterSpacing: 0,
  weight: 400,
  align: "left",
  theme:
    typeof window !== "undefined" &&
    localStorage.getItem("abgs:theme") === "dark"
      ? "dark"
      : "light",
  view: "grid",
  search: "",
  sort: "recent",
  filterFormat: null,
  selected: [],
  paletteOpen: false,

  set: (patch) => set(patch),

  hydrate: async () => {
    if (get().hydrated) return;
    const meta = ((await idbGet(META_KEY)) as FontItem[] | undefined) ?? [];

    const loadedFonts = await Promise.all(
      meta.map(async (f) => {
        const data = (await idbGet(DATA_PREFIX + f.id)) as
          | ArrayBuffer
          | undefined;

        if (!data) return f;

        if (!f.metadata) {
          f = { ...f, metadata: parseFontMetadata(data) };
        }

        await loadFont(f.family, data);
        return f;
      }),
    );

    await idbSet(META_KEY, loadedFonts);
    set({ fonts: loadedFonts, hydrated: true });
  },

  addFiles: async (files) => {
    const fontFiles = files.filter((f) => isFontFile(f.name));
    const existing = get().fonts;
    const additions: FontItem[] = [];
    for (const file of fontFiles) {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      const familyBase = sanitizeFamily(file.name);
      const family = `${familyBase}_${id.slice(-4)}`;
      const data = await file.arrayBuffer();
      await loadFont(family, data);
      await idbSet(DATA_PREFIX + id, data);
      additions.push({
        id,
        family,
        originalName: file.name,
        format: fontFormat(file.name),
        size: file.size,
        addedAt: Date.now(),
        tags: [],
        metadata: parseFontMetadata(data),
      });
    }
    const next = [...additions, ...existing];
    await idbSet(META_KEY, next);
    set({ fonts: next });
  },

  remove: async (id) => {
    const f = get().fonts.find((x) => x.id === id);
    if (f) unloadFont(f.family);
    await idbDel(DATA_PREFIX + id);
    const next = get().fonts.filter((x) => x.id !== id);
    await idbSet(META_KEY, next);
    set({ fonts: next, selected: get().selected.filter((s) => s !== id) });
  },

  rename: (id, family) => {
    const next = get().fonts.map((f) => (f.id === id ? { ...f, family } : f));
    set({ fonts: next });
    idbSet(META_KEY, next);
  },

  downloadFont: async (id) => {
    const f = get().fonts.find((x) => x.id === id);
    if (!f) return;
    const data = (await idbGet(DATA_PREFIX + id)) as ArrayBuffer | undefined;
    if (!data) return;
    const blob = new Blob([data], { type: "font/" + f.format });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = f.originalName;
    a.click();
    URL.revokeObjectURL(url);
  },

  toggleSelected: (id) => {
    const s = get().selected;
    set({
      selected: s.includes(id)
        ? s.filter((x) => x !== id)
        : [...s, id].slice(-8),
    });
  },
  clearSelected: () => set({ selected: [] }),
  resetPreview: () =>
    set({
      previewText: "The quick brown fox jumps over the lazy dog",
      fontSize: 32,
      lineHeight: 1.3,
      letterSpacing: 0,
      weight: 400,
      align: "left",
    }),
}));

export async function clearAllStorage() {
  const all = await idbKeys();
  await Promise.all(
    all.filter((k) => String(k).startsWith("abgs:")).map((k) => idbDel(k)),
  );
}
