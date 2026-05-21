import { useDropzone } from "react-dropzone";
import { motion } from "framer-motion";
import { Upload } from "lucide-react";
import { useFontStore } from "@/store/font-store";
import { toast } from "sonner";
import { isFontFile } from "@/lib/font-utils";

export function UploadZone({ compact = false }: { compact?: boolean }) {
  const addFiles = useFontStore((s) => s.addFiles);

  async function walkEntries(entry: any): Promise<File[]> {
    if (entry.isFile) {
      return new Promise((res) => entry.file((f: File) => res([f])));
    }
    if (entry.isDirectory) {
      const reader = entry.createReader();
      const entries: any[] = await new Promise((res) => reader.readEntries(res));
      const files = await Promise.all(entries.map(walkEntries));
      return files.flat();
    }
    return [];
  }

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    multiple: true,
    onDrop: async (accepted, _rej, event) => {
      let all: File[] = accepted;
      const items = (event as any)?.dataTransfer?.items as DataTransferItemList | undefined;
      if (items && items.length) {
        const collected: File[] = [];
        const entries = Array.from(items)
          .map((i) => (i.webkitGetAsEntry ? i.webkitGetAsEntry() : null))
          .filter(Boolean);
        for (const e of entries) collected.push(...(await walkEntries(e)));
        if (collected.length) all = collected;
      }
      const fonts = all.filter((f) => isFontFile(f.name));
      if (!fonts.length) {
        toast.error("No supported font files found");
        return;
      }
      await addFiles(fonts);
      toast.success(`Loaded ${fonts.length} font${fonts.length > 1 ? "s" : ""}`);
    },
  });

  if (compact) {
    return (
      <div
        {...getRootProps()}
        className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-soft transition hover:opacity-90"
      >
        <input {...getInputProps()} {...({ webkitdirectory: "" } as any)} />
        <Upload className="h-4 w-4" />
        <span>Upload fonts</span>
      </div>
    );
  }

  const root = getRootProps();
  return (
    <motion.div
      {...(root as any)}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative cursor-pointer rounded-3xl border-2 border-dashed p-16 text-center transition-all ${
        isDragActive
          ? "border-primary bg-accent/60 scale-[1.01]"
          : "border-border bg-card/60 hover:border-foreground/40 hover:bg-card"
      } shadow-soft`}
    >
      <input {...getInputProps()} {...({ webkitdirectory: "" } as any)} />
      <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-float">
        <Upload className="h-6 w-6" />
      </div>
      <h2 className="text-2xl font-semibold tracking-tight">Drop your fonts here</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
        Drag a single font, multiple files, or an entire folder. Supports TTF, OTF, WOFF, WOFF2,
        EOT, TTC and FON.
      </p>
      <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-xs text-muted-foreground">
        Stored locally · Nothing leaves your device
      </div>
    </motion.div>
  );
}
