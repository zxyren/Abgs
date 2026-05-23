import { type DropEvent, useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FolderOpen, FileType, ShieldCheck } from "lucide-react";
import { useFontStore } from "@/store/font-store";
import { toast } from "sonner";
import { isFontFile } from "@/lib/font-utils";
import { useRef } from "react";

type WebkitDirAttr = { webkitdirectory: string };
type ItemWithEntry = DataTransferItem & {
  webkitGetAsEntry?: () => FileSystemEntry | null;
};

async function walkEntries(entry: FileSystemEntry): Promise<File[]> {
  if (entry.isFile)
    return new Promise((res) =>
      (entry as FileSystemFileEntry).file((f) => res([f])),
    );
  if (entry.isDirectory) {
    const reader = (entry as FileSystemDirectoryEntry).createReader();
    const entries = await new Promise<FileSystemEntry[]>((res) =>
      reader.readEntries(res),
    );
    return (await Promise.all(entries.map(walkEntries))).flat();
  }
  return [];
}

const FORMATS = ["TTF", "OTF", "WOFF", "WOFF2", "EOT", "TTC", "FON"];

export function UploadZone() {
  const addFiles = useFontStore((s) => s.addFiles);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const onDrop = async (accepted: File[], _rej: unknown, event: DropEvent) => {
    const items =
      "dataTransfer" in event ? event.dataTransfer?.items : undefined;
    let all = accepted;

    if (items?.length) {
      const collected = (
        await Promise.all(
          Array.from(items as DataTransferItemList)
            .map((i) => (i as ItemWithEntry).webkitGetAsEntry?.())
            .filter(Boolean)
            .map((e) => walkEntries(e!)),
        )
      ).flat();
      if (collected.length) all = collected;
    }

    const fonts = all.filter((f) => isFontFile(f.name));
    if (!fonts.length) return toast.error("No supported font files found");
    await addFiles(fonts);
    toast.success(`Loaded ${fonts.length} font${fonts.length > 1 ? "s" : ""}`);
  };

  const handleFolderChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    const fonts = files.filter((f) => isFontFile(f.name));
    if (!fonts.length) return toast.error("No supported font files found");
    await addFiles(fonts);
    toast.success(`Loaded ${fonts.length} font${fonts.length > 1 ? "s" : ""}`);
    e.target.value = "";
  };

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    multiple: true,
    noClick: true,
    onDrop,
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <div
        {...getRootProps()}
        className={`relative overflow-hidden rounded-2xl border max-w-7xl mb-7 transition-all duration-300 ${
          isDragActive
            ? "border-foreground/30 bg-foreground/5 shadow-[inset_0_0_0_1px_hsl(var(--foreground)/0.1)]"
            : "border-border bg-card"
        }`}
      >
        <input {...getInputProps()} />

        {/* Hidden folder picker */}
        <input
          ref={folderInputRef}
          type="file"
          className="hidden"
          onChange={handleFolderChange}
          {...({ webkitdirectory: "", multiple: true } as WebkitDirAttr & {
            multiple: boolean;
          })}
        />

        {/* Subtle dot-grid texture */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "radial-gradient(circle, var(--foreground) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />

        {/* Corner accent brackets */}
        {(
          [
            "top-0 left-0",
            "top-0 right-0 [transform:scaleX(-1)]",
            "bottom-0 left-0 [transform:scaleY(-1)]",
            "bottom-0 right-0 [transform:scale(-1)]",
          ] as const
        ).map((cls, i) => (
          <span
            key={i}
            className={`pointer-events-none absolute ${cls} h-4 w-4`}
            style={{
              borderTop: "1.5px solid hsl(var(--foreground)/0.18)",
              borderLeft: "1.5px solid hsl(var(--foreground)/0.18)",
            }}
          />
        ))}

        <div className="relative flex flex-col items-center px-8 pb-10 pt-12">
          {/* Animated icon */}
          <AnimatePresence mode="wait">
            <motion.div
              key={isDragActive ? "active" : "idle"}
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ type: "spring", stiffness: 380, damping: 22 }}
              className={`mb-6 flex h-16 w-16 items-center justify-center rounded-2xl transition-colors ${
                isDragActive
                  ? "border-2 border-dashed border-foreground/25 bg-foreground/5 text-foreground"
                  : "border border-border bg-background text-foreground/60 shadow-sm"
              }`}
            >
              <Upload size={26} strokeWidth={1.5} />
            </motion.div>
          </AnimatePresence>

          {/* Heading + sub */}
          <h2 className="text-[22px] font-semibold tracking-tight text-foreground">
            {isDragActive ? "Drop to load fonts" : "Drop fonts here"}
          </h2>
          <p className="mt-1.5 text-center text-sm leading-relaxed text-muted-foreground">
            Single files, multiple fonts, or an entire folder
          </p>

          {/* Divider */}
          <div className="my-7 flex w-full max-w-xs items-center gap-3">
            <span className="h-px flex-1 bg-border" />
            <span className="text-[11px] uppercase tracking-widest text-muted-foreground/60">
              or browse
            </span>
            <span className="h-px flex-1 bg-border" />
          </div>

          {/* CTA buttons */}
          <div className="flex w-full max-w-60 flex-col gap-2.5">
            <button
              type="button"
              onClick={open}
              className="flex items-center justify-center gap-2 rounded-xl border border-foreground bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-all hover:opacity-90 active:scale-[0.98]"
            >
              <FileType size={15} />
              Choose font files
            </button>
            <button
              type="button"
              onClick={() => folderInputRef.current?.click()}
              className="flex items-center justify-center gap-2 rounded-xl border border-border bg-transparent px-5 py-2.5 text-sm font-medium text-foreground transition-all hover:bg-accent active:scale-[0.98]"
            >
              <FolderOpen size={15} />
              Choose a folder
            </button>
          </div>

          {/* Format pills */}
          <div className="mt-8 flex flex-wrap justify-center gap-1.5">
            {FORMATS.map((fmt) => (
              <span
                key={fmt}
                className="rounded-md border font-medium border-border/60 bg-muted/30 px-2 py-0.5 text-sm tracking-wide text-muted-foreground"
              >
                {fmt}
              </span>
            ))}
          </div>

          {/* Privacy badge */}
          <div className="mt-5 flex items-center gap-1.5 text-sm text-muted-foreground">
            <ShieldCheck size={16} className="text-emerald-500" />
            Stored locally · Nothing leaves your device
          </div>
        </div>
      </div>
    </motion.div>
  );
}
