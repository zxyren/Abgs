import { create } from "zustand";
import { get as idbGet, set as idbSet, del as idbDel, keys as idbKeys } from "idb-keyval";
import {
  isFontFile,
  sanitizeFamily,
  fontFormat,
  loadFont,
  parseFontMetadata,
  unloadFont,
  isFontLoaded,
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

export type SortKey = "name" | "recent" | "size";

interface State {
  fonts: FontItem[];
  hydrated: boolean;
  uploadProgress: { current: number; total: number } | null;
  previewText: string;
  globalPreviewActive: boolean;
  fontSize: number;
  lineHeight: number;
  letterSpacing: number;
  weight: number;
  align: "left" | "center" | "right";
  theme: "light" | "dark";
  search: string;
  sort: SortKey;
  filterFormat: string | null;
  selected: string[]; // for comparison
  paletteOpen: boolean;

  hydrate: () => Promise<void>;
  addFiles: (files: File[]) => Promise<void>;
  loadFontOnDemand: (id: string) => Promise<void>;
  remove: (id: string) => Promise<void>;
  rename: (id: string, family: string) => void;
  downloadFont: (id: string) => Promise<void>;
  toggleSelected: (id: string) => void;
  clearSelected: () => void;
  resetPreview: () => void;
  setPreview: (text: string) => void;
  set: (patch: Partial<State>) => void;
}

const META_KEY = "fontest:fonts";
const DATA_PREFIX = "fontest:data:";
const loadingIds = new Set<string>();

export const useFontStore = create<State>((set, get) => ({
  fonts: [],
  hydrated: false,
  uploadProgress: null,
  previewText: "The quick brown fox jumps over the lazy dog",
  globalPreviewActive: false,
  fontSize: 80,
  lineHeight: 1.3,
  letterSpacing: 0,
  weight: 400,
  align: "left",
  theme:
    typeof window !== "undefined" && localStorage.getItem("fontest:theme") === "dark"
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
    set({ fonts: meta, hydrated: true });
  },

  addFiles: async (files) => {
    const fontFiles = files.filter((f) => isFontFile(f.name));
    if (!fontFiles.length) return;

    set({ uploadProgress: { current: 0, total: fontFiles.length } });

    const existing = get().fonts;
    const additions: FontItem[] = [];
    const batchSize = 15;

    for (let i = 0; i < fontFiles.length; i += batchSize) {
      const batch = fontFiles.slice(i, i + batchSize);

      const batchResults = await Promise.all(
        batch.map(async (file) => {
          try {
            const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
            const familyBase = sanitizeFamily(file.name);
            const family = `${familyBase}_${id.slice(-4)}`;
            const data = await file.arrayBuffer();
            const metadata = parseFontMetadata(data);
            await idbSet(DATA_PREFIX + id, data);
            return {
              id,
              family,
              originalName: file.name,
              format: fontFormat(file.name),
              size: file.size,
              addedAt: Date.now(),
              tags: [],
              metadata,
            } as FontItem;
          } catch (e) {
            console.error("Failed to process font file:", file.name, e);
            return null;
          }
        }),
      );

      const valid = batchResults.filter((f): f is FontItem => f !== null);
      additions.push(...valid);

      set({
        uploadProgress: {
          current: Math.min(i + batch.length, fontFiles.length),
          total: fontFiles.length,
        },
      });
    }

    const next = [...additions, ...existing];
    await idbSet(META_KEY, next);
    set({ fonts: next, uploadProgress: null });
  },

  loadFontOnDemand: async (id) => {
    const font = get().fonts.find((f) => f.id === id);
    if (!font) return;
    if (isFontLoaded(font.family) || loadingIds.has(id)) return;

    loadingIds.add(id);
    try {
      const data = (await idbGet(DATA_PREFIX + id)) as ArrayBuffer | undefined;
      if (data) {
        const m = font.metadata;
        if (m?.isVariable === undefined || m?.weightClass === undefined) {
          const patch = parseFontMetadata(data);
          set((s) => ({
            fonts: s.fonts.map((f) =>
              f.id === id ? { ...f, metadata: { ...f.metadata, ...patch } } : f,
            ),
          }));
        }
        await loadFont(font.family, data);
      }
    } catch (e) {
      console.warn("Failed to load font on demand:", font.family, e);
    } finally {
      loadingIds.delete(id);
    }
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
      selected: s.includes(id) ? s.filter((x) => x !== id) : [...s, id].slice(-8),
    });
  },
  clearSelected: () => set({ selected: [] }),
  resetPreview: () =>
    set({
      previewText: "The quick brown fox jumps over the lazy dog",
      globalPreviewActive: false,
      fontSize: 80,
      lineHeight: 1.3,
      letterSpacing: 0,
      weight: 400,
      align: "left",
    }),
  setPreview: (text: string) => set({ previewText: text, globalPreviewActive: text.trim() !== "" }),
}));

export async function clearAllStorage() {
  const all = await idbKeys();
  await Promise.all(all.filter((k) => String(k).startsWith("fontest:")).map((k) => idbDel(k)));
}
