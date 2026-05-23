import { type DropEvent, useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Folder, FileType, ShieldCheck } from "lucide-react";
import { useFontStore } from "@/store/font-store";
import { toast } from "sonner";
import { isFontFile } from "@/lib/font-utils";
import { useRef, useState } from "react";
import { Separator } from "../ui/separator";
import { Button } from "../ui/button";

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
  const [loading, setLoading] = useState(false);

  const process = async (files: File[]) => {
    const fonts = files.filter((f) => isFontFile(f.name));
    if (!fonts.length) return toast.error("No supported font files found");
    setLoading(true);
    await addFiles(fonts);
    setLoading(false);
    toast.success(`Loaded ${fonts.length} font${fonts.length > 1 ? "s" : ""}`);
  };

  const onDrop = async (accepted: File[], _: unknown, event: DropEvent) => {
    const items =
      "dataTransfer" in event ? event.dataTransfer?.items : undefined;
    if (items?.length) {
      const all = (
        await Promise.all(
          Array.from(items as DataTransferItemList)
            .map((i) => (i as ItemWithEntry).webkitGetAsEntry?.())
            .filter(Boolean)
            .map((e) => walkEntries(e!)),
        )
      ).flat();
      return process(all.length ? all : accepted);
    }
    process(accepted);
  };

  const handleFolderChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    await process(Array.from(e.target.files ?? []));
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
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="mx-auto mb-7 max-w-7xl"
    >
      <input
        ref={folderInputRef}
        type="file"
        className="hidden"
        onChange={handleFolderChange}
        {...({ webkitdirectory: "", multiple: true } as WebkitDirAttr & {
          multiple: boolean;
        })}
      />

      {/* Dashed drop zone */}
      <div
        {...getRootProps()}
        className={`
          relative overflow-hidden rounded-2xl border border-dashed outline-none
          transition-all duration-200
          ${
            isDragActive
              ? "border-foreground/40 bg-foreground/10"
              : "border-border hover:border-foreground/25 hover:bg-foreground/5"
          }
        `}
      >
        <input {...getInputProps()} />

        <AnimatePresence>
          {isDragActive && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="pointer-events-none absolute inset-0 bg-foreground/5"
            />
          )}
        </AnimatePresence>

        <div className="flex flex-col items-center px-8 py-14">
          {/* Icon */}
          <motion.div
            animate={isDragActive ? { scale: 1.08, y: -2 } : { scale: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 22 }}
            className={`
              mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border transition-colors duration-200
              ${
                isDragActive
                  ? "border-foreground/25 bg-foreground/10 text-foreground"
                  : "border-border bg-card text-foreground/50"
              }
            `}
          >
            <Upload size={22} strokeWidth={1.5} />
          </motion.div>

          {/* Heading */}
          <p className="text-base text-foreground">
            {isDragActive ? (
              "Drop to load fonts"
            ) : (
              <>
                Drag & Drop or{" "}
                <button
                  type="button"
                  onClick={open}
                  className="relative cursor-pointer font-bold text-foreground after:absolute after:left-0 after:bottom-0 after:h-px after:w-0 after:bg-foreground after:transition-all after:duration-300 after:ease-out hover:after:w-full"
                >
                  choose files
                </button>{" "}
                to upload
              </>
            )}
          </p>
          <p className="mt-1.5 mb-7 text-[13px] text-muted-foreground">
            Single files, multiple fonts, or an entire folder
          </p>

          {/* Divider */}
          <div className="mb-6 flex w-60 items-center gap-3">
            <Separator orientation="horizontal" className="flex-1" />
            <span className="text-sm uppercase tracking-widest text-muted-foreground font-bold">
              or browse
            </span>
            <Separator orientation="horizontal" className="flex-1" />
          </div>

          {/* Buttons */}
          <div className="flex gap-2.5">
            <Button type="button" onClick={open} disabled={loading}>
              <FileType size={16} /> Font files
            </Button>
            <Button
              variant="outline"
              type="button"
              onClick={() => folderInputRef.current?.click()}
              disabled={loading}
            >
              <Folder size={16} /> Open folder
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-3 flex items-center justify-between px-1">
        <div className="flex flex-wrap gap-x-1.5 text-sm text-muted-foreground/40">
          {FORMATS.map((f, i) => (
            <span key={f}>
              {f}
              {i < FORMATS.length - 1 && (
                <span className="ml-1.5 opacity-50">·</span>
              )}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground/40">
          <ShieldCheck size={16} className="text-emerald-500/70" />
          Stored locally · Nothing leaves your device
        </div>
      </div>
    </motion.div>
  );
}
